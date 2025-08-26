  const autoCorrectPlaybook = document.getElementById('autoCorrectPlaybook');
(function(){
  // Elements retained in the simplified UI
  const labStatusEl = document.getElementById('labStatus');
  const labDot = document.getElementById('labDot');
  const labMeta = document.getElementById('labMeta');

  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  // Playbook editor elements
  const playbookList = document.getElementById('playbookList');
  const refreshFiles = document.getElementById('refreshFiles');
  const newPlaybookBtn = document.getElementById('newPlaybookBtn');
  const playbookName = document.getElementById('playbookName');
  const playbookContent = document.getElementById('playbookContent');
  const savePlaybook = document.getElementById('savePlaybook');
  const runPlaybook = document.getElementById('runPlaybook');
  const playbookRunOutput = document.getElementById('playbookRunOutput');

  // Lightweight logger: writes to existing log element if present, else console
  function appendLog(msg){
    const ts = new Date().toISOString().split('T')[1]?.replace('Z','');
    const full = `[${ts}] ${msg}`;
    const logEl = document.getElementById('logOutput'); // query lazily in case element removed
    if (logEl) {
      if (logEl.textContent === '(No activity yet)') logEl.textContent='';
      logEl.textContent += full + '\n';
      logEl.scrollTop = logEl.scrollHeight;
    } else {
      // Fallback to console only
      console.log(full);
    }
  }

  async function api(path, opts={}){
    const res = await fetch(path, { headers:{'Content-Type':'application/json'}, ...opts });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function setState(state){
    labStatusEl.textContent = state.statusLabel;
    labDot.className = 'dot ' + state.dot;
    if (state.meta) labMeta.textContent = state.meta; else labMeta.textContent='';
    startBtn.disabled = state.running;
    stopBtn.disabled = !state.running;
  // Removed buttons (logs/inventory/playbooks list) no longer managed
  savePlaybook.disabled = !state.running;
  runPlaybook.disabled = !state.running;
  autoCorrectPlaybook.disabled = !state.running;
  refreshFiles && (refreshFiles.disabled = !state.running);
  newPlaybookBtn && (newPlaybookBtn.disabled = !state.running);
  }

  // Auto-correct YAML indentation (basic) (moved outside setState to avoid redef)
  function autoCorrectYaml(yaml){
    const lines = yaml.replace(/\t/g,'  ').split('\n');
    const fixed = [];
    let inDoc = false;
    for (let raw of lines){
      let line = raw.replace(/\s+$/,'');
      if (!inDoc && (line.trim().startsWith('- ') || line.trim().startsWith('---'))) inDoc = true;
      const m = line.match(/^ +/);
      if (m){
        const spaces = ' '.repeat(Math.floor(m[0].length/2)*2);
        line = spaces + line.trimStart();
      }
      fixed.push(line);
    }
    if (!fixed[0] || !fixed[0].startsWith('---')) fixed.unshift('---');
    return fixed.join('\n');
  }

  autoCorrectPlaybook && autoCorrectPlaybook.addEventListener('click', ()=>{
    playbookContent.value = autoCorrectYaml(playbookContent.value);
    appendLog('Auto-corrected YAML indentation.');
  });

  async function refreshStatus(){
    try {
      const data = await api('/api/lab/ansible/status');
      const running = !!data.running;
      setState({
        running,
        statusLabel: running? 'Running' : 'Stopped',
        dot: running? 'running' : 'stopped',
        meta: running? `${data.containerId?.substring(0,12)||''} • ${data.createdAgo||''}`: ''
      });
    } catch (e){
      setState({ running:false, statusLabel:'Error', dot:'error', meta:'' });
      appendLog('Status error: '+e.message);
    }
  }

  startBtn.addEventListener('click', async ()=> {
    appendLog('Starting lab container...');
    try {
      const data = await api('/api/lab/ansible/start', { method:'POST' });
      appendLog('Started container '+data.containerId);
      refreshStatus();
  // After start, populate playbook list
  setTimeout(refreshPlaybookList, 500);
    } catch (e){ appendLog('Start failed: '+e.message); }
  });

  stopBtn.addEventListener('click', async ()=> {
    appendLog('Stopping lab container...');
    try {
      await api('/api/lab/ansible/stop', { method:'POST' });
      appendLog('Stopped.');
      refreshStatus();
    } catch (e){ appendLog('Stop failed: '+e.message); }
  });

  // Reset button removed.

  // Logs / inventory / playbooks panels removed from UI; related buttons & handlers deleted.

  function renderFileList(raw){
    if (!playbookList) return;
    playbookList.innerHTML='';
    const lines = (raw||'').split(/\n/).map(l=>l.trim()).filter(l=>l && !l.startsWith('('));
    if (lines.length===0){
      const li=document.createElement('li'); li.style.opacity='0.6'; li.textContent='(no playbooks)'; playbookList.appendChild(li); return;
    }
    lines.forEach(name=>{
      const li=document.createElement('li');
      li.textContent = name;
      li.style.cursor='pointer';
      li.style.padding='4px 6px';
      li.style.border='1px solid rgba(255,255,255,0.08)';
      li.style.borderRadius='4px';
      li.style.marginBottom='4px';
  li.addEventListener('contextmenu', ev=>{ ev.preventDefault(); /* context menu handled globally */ });
      li.addEventListener('click', ()=> loadPlaybook(name));
      playbookList.appendChild(li);
    });
  }

  async function refreshPlaybookList(){
    try {
  const data = await api('/api/lab/ansible/playbooks');
  renderFileList(data.output);
  if (data.cwd) appendLog('Playbooks in '+data.cwd);
    } catch(e){ appendLog('Playbooks list refresh failed: '+e.message); }
  }

  async function loadPlaybook(name){
    appendLog('Loading playbook '+name+'...');
    try {
  const data = await api('/api/lab/ansible/file?name='+encodeURIComponent(name));
      playbookName.value = data.name;
      playbookContent.value = data.content;
      appendLog('Loaded playbook'+(data.cwd?(' from '+data.cwd):''));
    } catch(e){ appendLog('Load failed: '+e.message); }
  }

  async function saveCurrentPlaybook(){
    const name = (playbookName.value||'').trim();
    if (!name){ alert('Enter filename, e.g. test.yml'); return; }
    if (!/^[A-Za-z0-9._-]+\.(yml|yaml)$/.test(name)){ alert('Invalid filename'); return; }
    appendLog('Saving '+name+'...');
    try {
  const resp = await api('/api/lab/ansible/file', { method:'POST', body: JSON.stringify({ name, content: playbookContent.value })});
  appendLog('Saved playbook to '+(resp.dir||'.'));
      // Update list immediately (optimistic) then refresh in background
      const currentNames = Array.from(playbookList.querySelectorAll('li')).map(li=>li.textContent);
      if (!currentNames.includes(name)) {
        const li=document.createElement('li');
        li.textContent=name; li.style.cursor='pointer'; li.style.padding='4px 6px'; li.style.border='1px solid rgba(255,255,255,0.08)'; li.style.borderRadius='4px'; li.style.marginBottom='4px';
        li.addEventListener('click', ()=> loadPlaybook(name));
        playbookList.appendChild(li);
      }
      // Highlight the saved file
      Array.from(playbookList.querySelectorAll('li')).forEach(li=>{
        li.style.background = li.textContent===name ? 'rgba(0,255,255,0.15)' : '';
      });
  // Immediate refresh to ensure the list reflects saved file
  refreshPlaybookList();
    } catch(e){ appendLog('Save failed: '+e.message); }
  }

  async function runCurrentPlaybook(){
    const name = (playbookName.value||'').trim();
    if (!name){ alert('Load or create a playbook first'); return; }
    // Always save before running to ensure file exists
    await saveCurrentPlaybook();
    appendLog('Running '+name+'...');
    playbookRunOutput.textContent='(running)';
    try {
      // Use exec endpoint to run ansible-playbook from current directory
      const runCmd = `ansible-playbook -i inventory ${name}`;
      const result = await api('/api/lab/ansible/exec', { method:'POST', body: JSON.stringify({ cmd: runCmd })});
      playbookRunOutput.textContent = (result.stdout||'') + (result.stderr? ('\nERR:\n'+result.stderr):'');
      appendLog('Run finished.');
    } catch(e){ playbookRunOutput.textContent='Error: '+e.message; appendLog('Run failed: '+e.message); }
  }

  refreshFiles && refreshFiles.addEventListener('click', refreshPlaybookList);
  newPlaybookBtn && newPlaybookBtn.addEventListener('click', ()=>{
    playbookName.value='new-playbook.yml';
    playbookContent.value='---\n- name: Sample\n  hosts: localhost\n  gather_facts: false\n  tasks:\n    - debug: msg="Hello from new playbook"';
    savePlaybook.disabled=false; runPlaybook.disabled=false;
  });
  savePlaybook && savePlaybook.addEventListener('click', saveCurrentPlaybook);
  runPlaybook && runPlaybook.addEventListener('click', runCurrentPlaybook);

  // Auto-refresh list every 30s when running
  setInterval(()=>{
    const dotClass = labDot.className;
    if (dotClass.includes('running')) refreshPlaybookList();
  }, 30000);

  refreshStatus();
  setInterval(refreshStatus, 10000);
})();
