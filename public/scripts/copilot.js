(function(){
  const chat = document.getElementById('copilot-chat');
  const input = document.getElementById('copilot-input');
  const sendBtn = document.getElementById('copilot-send');
  const history = []; // { role: 'user'|'assistant', content: string }
  const streamToggle = document.getElementById('agentbot-stream-toggle');
  const stopBtn = document.getElementById('agentbot-stop');
  const newChatBtn = document.getElementById('agentbot-newchat');
  let currentStream = null; // holds EventSource
  const HISTORY_KEY = 'agentbot_history_v1';
  const SETTINGS_KEY = 'agentbot_settings_v1';
  const AGENT_ID = 'agentbot';
  const SESSION_ID = (()=>{
    const key = 'agentbot_session_id';
    let v = localStorage.getItem(key);
    if (!v) { v = Math.random().toString(36).slice(2); localStorage.setItem(key, v); }
    return v;
  })();

  function addMsg(text, sender){
    const wrap = document.createElement('div');
    wrap.className = 'message ' + (sender === 'user' ? 'user' : 'bot');
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;
    wrap.appendChild(content);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }

  function getOptions(){
    const modelEl = document.getElementById('agentbot-model');
    const tempEl = document.getElementById('agentbot-temp');
    return {
      model: modelEl ? modelEl.value : undefined,
      temperature: tempEl ? Number(tempEl.value) : undefined,
    };
  }

  function saveSettings(){
    try {
      const modelEl = document.getElementById('agentbot-model');
      const tempEl = document.getElementById('agentbot-temp');
      const streamEl = document.getElementById('agentbot-stream-toggle');
      const obj = {
        model: modelEl ? modelEl.value : undefined,
        temperature: tempEl ? tempEl.value : undefined,
        stream: streamEl ? !!streamEl.checked : true
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
    } catch(_) {}
  }

  function loadSettings(){
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      const modelEl = document.getElementById('agentbot-model');
      const tempEl = document.getElementById('agentbot-temp');
      const streamEl = document.getElementById('agentbot-stream-toggle');
      if (modelEl && obj.model) modelEl.value = obj.model;
      if (tempEl && obj.temperature != null) tempEl.value = obj.temperature;
      if (streamEl && typeof obj.stream === 'boolean') streamEl.checked = obj.stream;
    } catch(_) {}
  }

  function saveHistory(){
    const msgs = history.slice(-50);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs)); } catch(_) {}
    fetch('/api/chat/history', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ agent: AGENT_ID, session: SESSION_ID, messages: msgs })
    }).catch(()=>{});
  }

  function loadHistory(){
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(_) { return []; }
  }

  function renderHistory(){
    chat.innerHTML = '';
    const localMsgs = loadHistory();
    fetch(`/api/chat/history?agent=${AGENT_ID}&session=${SESSION_ID}`)
      .then(r=>r.ok?r.json():{messages:localMsgs}).then(data=>{
        const msgs = Array.isArray(data.messages) ? data.messages : localMsgs;
        history.splice(0, history.length, ...msgs);
        for (const m of msgs) {
          const wrap = document.createElement('div');
          wrap.className = 'message ' + (m.role === 'user' ? 'user' : 'bot');
          const content = document.createElement('div');
          content.className = 'message-content';
          if (m.role === 'assistant') {
            content.innerHTML = renderMarkdown(m.content || '');
          } else {
            content.textContent = m.content || '';
          }
          wrap.appendChild(content);
          chat.appendChild(wrap);
        }
        chat.scrollTop = chat.scrollHeight;
      }).catch(()=>{
        const msgs = localMsgs;
        history.splice(0, history.length, ...msgs);
      });
  }

  function buildPrompt(q){
    // Include last 6 turns for context
    const turns = history.slice(-6);
    let prompt = '';
    if (turns.length) {
      prompt += 'Conversation so far:\n';
      for (const t of turns) {
        prompt += `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content}\n`;
      }
      prompt += '\n';
    }
    prompt += `User: ${q}\nAssistant:`;
    return prompt;
  }

  function escapeHtml(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function renderMarkdown(text){
    // Minimal safe markdown: code fences, inline code, links, line breaks
    const esc = escapeHtml(text);
    // code fences ```
    let html = esc.replace(/```([\s\S]*?)```/g, (m, code)=>`<pre><code>${code}</code></pre>`);
    // inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // links
    html = html.replace(/(https?:\/\/[^\s)]+)(?=\s|$)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    // newlines
    html = html.replace(/\n/g,'<br/>');
    return html;
  }

  async function askLLM(q){
    // Try direct LLM first
    try {
      const res = await fetch('/agent-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: buildPrompt(q), options: getOptions() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          return data.offline ? `${data.answer}\n(offline mode)` : data.answer;
        }
      } else {
        const err = await res.json().catch(()=>({}));
        if (err && err.error) return `Error: ${err.error}`;
      }
    } catch (e) { /* ignore and fallback */ }

    // Fallback to RAG knowledge base
    try {
      const res = await fetch('/rag-knowledgebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();
      return data.answer || 'No answer available.';
    } catch (e) {
      return 'Error contacting LLM service.';
    }
  }

  async function streamLLM(q, onText){
    const opts = getOptions();
    const query = new URLSearchParams({ q: buildPrompt(q), model: opts.model || '', temperature: (opts.temperature ?? '').toString() }).toString();
    const url = `/agent-bot/stream?${query}`;
    // Prefer EventSource for robust SSE handling
    let es;
    await new Promise((resolve, reject)=>{
      try {
        es = new EventSource(url);
        currentStream = es;
        stopBtn && (stopBtn.style.display = 'inline-flex');
      } catch (e) { return reject(e); }
      es.onmessage = (ev)=>{
        try {
          const json = JSON.parse(ev.data);
          if (json.token) onText(json.token);
          if (json.done) { es.close(); resolve(); }
          if (json.error) { es.close(); reject(new Error(json.error)); }
        } catch(_){}
      };
      es.onerror = ()=>{ es.close(); reject(new Error('SSE error')); };
    });
    currentStream = null;
    stopBtn && (stopBtn.style.display = 'none');
  }

  async function onSend(){
    const q = (input.value || '').trim();
    if (!q) return;
    addMsg(q, 'user');
  history.push({ role: 'user', content: q });
  saveHistory();
    input.value = '';
    addMsg('', 'bot');
    const lastBot = chat.lastChild.querySelector('.message-content');
    // Try streaming first if enabled
    if (!streamToggle || streamToggle.checked) {
      try {
        await streamLLM(q, (t)=>{ lastBot.textContent += t; chat.scrollTop = chat.scrollHeight; });
        if (!lastBot.textContent) lastBot.textContent = 'No answer.';
        const finalText = lastBot.textContent;
        history.push({ role: 'assistant', content: finalText });
    saveHistory();
        lastBot.innerHTML = renderMarkdown(finalText);
        return;
      } catch (_) { /* fallback below */ }
    }

    // Fallback to non-streaming
    lastBot.textContent = 'Thinking...';
    const ans = await askLLM(q);
    history.push({ role: 'assistant', content: ans });
  saveHistory();
    lastBot.innerHTML = renderMarkdown(ans);
  }

  // Stop streaming handler
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (currentStream) {
        currentStream.close();
        currentStream = null;
      }
      stopBtn.style.display = 'none';
    });
  }

  // Persist settings on change
  const modelEl = document.getElementById('agentbot-model');
  const tempEl = document.getElementById('agentbot-temp');
  if (modelEl) modelEl.addEventListener('change', saveSettings);
  if (tempEl) tempEl.addEventListener('change', saveSettings);
  if (streamToggle) streamToggle.addEventListener('change', saveSettings);

  // Initial restore
  loadSettings();
  renderHistory();

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      try { localStorage.removeItem(HISTORY_KEY); } catch(_) {}
      history.splice(0, history.length);
      chat.innerHTML = '';
      input.value = '';
  fetch('/api/chat/history', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ agent: AGENT_ID, session: SESSION_ID }) }).catch(()=>{});
    });
  }

  sendBtn.addEventListener('click', onSend);
  input.addEventListener('keypress', (e)=>{ if (e.key === 'Enter') onSend(); });
})();
