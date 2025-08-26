(function(){
  const dot = document.getElementById('runnerDot');
  const statusEl = document.getElementById('runnerStatus');
  const metaEl = document.getElementById('runnerMeta');
  const startBtn = document.getElementById('startLab');
  const stopBtn = document.getElementById('stopLab');
  const resetBtn = document.getElementById('resetLab');
  const clearBtn = document.getElementById('clearTerm');
  const helpBtn = document.getElementById('helpBtn');
  const terminal = document.getElementById('terminal');
  const userLabel = document.getElementById('userLabel');
  let currentUser = 'root';
  let currentCwd = '/root';
  let inputSpan = null; // active editable span
  let promptSpan = null;
  let isBusy = false;

  function repositionPrompt(){
    if(!inputSpan) return;
    const lineEl = inputSpan.parentElement;
    if(lineEl && lineEl !== terminal.lastElementChild){
      terminal.appendChild(lineEl); // move to bottom
    }
    terminal.scrollTop = terminal.scrollHeight;
    inputSpan.focus();
  }
  function write(line, cls=''){
    const div=document.createElement('div'); div.className=cls; div.textContent=line; terminal.appendChild(div);
    repositionPrompt();
  }
  function writeHTML(html){ const div=document.createElement('div'); div.innerHTML=html; terminal.appendChild(div); repositionPrompt(); }
  function setState(running, id, age){
    statusEl.textContent = running? 'Running':'Stopped';
    dot.className = 'dot'+(running?' running':'');
    if (running) metaEl.textContent = (id? id.substring(0,12)+' ':'') + (age? '• '+age:''); else metaEl.textContent='';
    startBtn.disabled = running; stopBtn.disabled = !running; resetBtn.disabled = !running; if (inputSpan) inputSpan.contentEditable = running? 'true':'false';
  }
  async function api(path, opts={}){ const res= await fetch(path, { headers:{'Content-Type':'application/json'}, ...opts}); if(!res.ok) throw new Error('HTTP '+res.status); return res.json(); }
  async function refresh(){
  try{ const s = await api('/api/centos/status'); setState(!!s.running, s.containerId, s.createdAgo); if (s.user){ currentUser = s.user; userLabel.textContent = s.user; updatePrompt(); } }
    catch(e){ setState(false); }
  }
  function help(){
    writeHTML('<div style="opacity:.8">Examples: <span class="kbd">ls -al</span> <span class="kbd">pwd</span> <span class="kbd">cd /etc</span> <span class="kbd">cat /etc/os-release</span><br/>Install: <span class="kbd">sudo dnf install -y tree</span><br/>Networking: <span class="kbd">ip addr</span> <span class="kbd">ping -c1 8.8.8.8</span><br/>Clear: <span class="kbd">clear</span></div>');
  }

  startBtn.addEventListener('click', async ()=>{ write('Starting container...'); try{ const r= await api('/api/centos/start',{method:'POST'}); write('Started '+r.containerId + (r.provisioning?' (provisioning in background)':'')); refresh(); }catch(e){ write('Start error: '+e.message,'err'); }});
  stopBtn.addEventListener('click', async ()=>{ write('Stopping...'); try{ await api('/api/centos/stop',{method:'POST'}); write('Stopped'); refresh(); }catch(e){ write('Stop error: '+e.message,'err'); }});
  resetBtn.addEventListener('click', async ()=>{ write('Resetting...'); try{ await api('/api/centos/stop',{method:'POST'}); await api('/api/centos/start',{method:'POST'}); write('Recreated'); refresh(); }catch(e){ write('Reset error: '+e.message,'err'); }});
  clearBtn.addEventListener('click', ()=>{ terminal.textContent=''; });
  helpBtn.addEventListener('click', help);

  function runCurrent(){
    if(!inputSpan) return;
    const cmd = inputSpan.textContent.trim();
    if(!cmd){ inputSpan.textContent=''; return; }
  // Echo the command line (freeze current line first)
  inputSpan.contentEditable='false';
  inputSpan.removeEventListener('keydown', keyHandler);
  write(`${currentUser}@centos:${currentCwd}$ ${cmd}`,'output-block');
    if (!history.length || history[history.length-1] !== cmd) history.push(cmd);
    historyIndex = history.length;
  // Mark busy
  isBusy = true;
    fetch('/api/centos/exec',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ cmd })})
      .then(r=>r.json()).then(data=>{
    if(data.cleared){ terminal.textContent=''; isBusy=false; ensureInput(); return; }
        if(data.stdout) write(data.stdout);
        if(data.stderr) write(data.stderr,'err');
        if(data.cwd){ currentCwd = data.cwd; updatePrompt(); }
    isBusy=false;
    ensureInput();
      }).catch(e=> write('Exec error: '+e.message,'err'));
  }
  function keyHandler(e){
  if(e.key==='Enter'){ e.preventDefault(); if(!isBusy) runCurrent(); return; }
    if(e.key==='ArrowUp'){ if(historyIndex>0){ historyIndex--; inputSpan.textContent = history[historyIndex]; placeCaret(); } e.preventDefault(); }
    else if(e.key==='ArrowDown'){ if(historyIndex < history.length-1){ historyIndex++; inputSpan.textContent = history[historyIndex]; } else { historyIndex = history.length; inputSpan.textContent=''; } placeCaret(); e.preventDefault(); }
    else if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='l'){ terminal.textContent=''; ensureInput(); e.preventDefault(); }
  }
  function ensureInput(){
    if(inputSpan && inputSpan.isConnected) { inputSpan.focus(); placeCaret(); return; }
    const line = document.createElement('div');
    const prompt = document.createElement('span'); prompt.className='prompt-symbol'; promptSpan = prompt;
  const inp = document.createElement('span');
  inp.className = 'cli-input';
  inp.contentEditable='true';
  inp.spellcheck=false;
  inp.style.outline='none';
  inp.style.whiteSpace='pre';
  inp.style.padding='0 4px';
  inputSpan = inp;
    line.appendChild(prompt); line.appendChild(inp); terminal.appendChild(line); updatePrompt();
    inp.addEventListener('keydown', keyHandler);
    inp.focus(); placeCaret();
    terminal.scrollTop = terminal.scrollHeight;
  }
  function updatePrompt(){ if(promptSpan) promptSpan.textContent = `${currentUser}@centos:${currentCwd}$`; }
  function placeCaret(){ const sel=window.getSelection(); const r=document.createRange(); r.selectNodeContents(inputSpan); r.collapse(false); sel.removeAllRanges(); sel.addRange(r); }
  // Command history
  const history = [];
  let historyIndex = 0;
  ensureInput();

  refresh();
  setInterval(refresh, 4000);
  // During initial provisioning poll more frequently for user change
  let fastPolls = 15; // ~1 minute at 4s
  const fastTimer = setInterval(()=>{
    if(fastPolls-- <=0){ clearInterval(fastTimer); return; }
    refresh();
  }, 4000);
})();
