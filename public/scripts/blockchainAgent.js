(function(){
  // State with persistence
  const persisted = JSON.parse(localStorage.getItem('bcAgent.state')||'{}');
  const state = {
    network: persisted.network || 'eth-mainnet',
    addresses: persisted.addresses || [],
    tokens: persisted.tokens || [],
    log: [],
    metrics: { totalValue: null, assetCount: 0, pnl: null, gas: null }
  };
  function persist(){
    localStorage.setItem('bcAgent.state', JSON.stringify({ network: state.network, addresses: state.addresses, tokens: state.tokens }));
  }

  // Elements
  const networkSelect = document.getElementById('networkSelect');
  const addressInput = document.getElementById('addressInput');
  const addAddressBtn = document.getElementById('addAddressBtn');
  const addressList = document.getElementById('addressList');
  const tokenAddress = document.getElementById('tokenAddress');
  const addTokenBtn = document.getElementById('addTokenBtn');
  const tokenPills = document.getElementById('tokenPills');
  const refreshPortfolioBtn = document.getElementById('refreshPortfolio');
  const metricTotalValue = document.getElementById('metricTotalValue');
  const metricAssetCount = document.getElementById('metricAssetCount');
  const metricPnL = document.getElementById('metricPnL');
  const metricGas = document.getElementById('metricGas');
  const aiCommand = document.getElementById('aiCommand');
  const runAiCommand = document.getElementById('runAiCommand');
  const aiResult = document.getElementById('aiResult');
  const bcLog = document.getElementById('bcLog');
  const clearLogBtn = document.getElementById('clearLog');
  const exportLogBtn = document.getElementById('exportLog');
  const quickBtns = document.querySelectorAll('button.quick');
  const statusDot = document.getElementById('bcStatusDot');
  const statusLabel = document.getElementById('bcStatusLabel');
  const bcRefresh = document.getElementById('bcRefresh');

  function log(msg){
    const ts = new Date().toISOString().replace('T',' ').replace('Z','');
    state.log.push({ ts, msg });
    if (bcLog.textContent === '(no activity)') bcLog.textContent = '';
    bcLog.textContent += `[${ts}] ${msg}\n`;
    bcLog.scrollTop = bcLog.scrollHeight;
  }

  function renderAddresses(){
    if(!state.addresses.length){ addressList.textContent='(no addresses)'; return; }
    addressList.innerHTML='';
    state.addresses.forEach(addr=>{
      const div = document.createElement('div');
      div.className='pill';
      div.textContent = addr;
      div.title='Right-click to remove';
      div.addEventListener('contextmenu', e=>{ e.preventDefault(); removeAddress(addr); });
      addressList.appendChild(div);
    });
  }
  function renderTokens(){
    tokenPills.innerHTML='';
    state.tokens.forEach(t=>{
      const pill = document.createElement('div'); pill.className='pill'; pill.textContent=t; pill.title='Right-click to untrack'; pill.addEventListener('contextmenu', e=>{ e.preventDefault(); removeToken(t); }); tokenPills.appendChild(pill);
    });
  }
  function setStatus(txt, on){ statusLabel.textContent = txt; statusDot.className = 'status-dot'+(on?' on':''); }

  function addAddress(){
    const a = (addressInput.value||'').trim();
    if(!a) return; if(state.addresses.includes(a)) { log('Address already tracked'); return; }
    state.addresses.push(a); addressInput.value=''; renderAddresses(); persist(); log('Added address '+a); fakeRefreshPortfolio(); }
  function removeAddress(a){ state.addresses = state.addresses.filter(x=>x!==a); renderAddresses(); persist(); log('Removed address '+a); fakeRefreshPortfolio(); }
  function addToken(){ const t=(tokenAddress.value||'').trim(); if(!t) return; if(state.tokens.includes(t)){ log('Token already tracked'); return;} state.tokens.push(t); tokenAddress.value=''; renderTokens(); persist(); log('Tracking token '+t); fakeRefreshPortfolio(); }
  function removeToken(t){ state.tokens = state.tokens.filter(x=>x!==t); renderTokens(); persist(); log('Untracked token '+t); fakeRefreshPortfolio(); }

  function skeleton(){ metricTotalValue.className='skeleton'; metricAssetCount.className='skeleton'; metricPnL.className='skeleton'; metricGas.className='skeleton'; metricTotalValue.textContent=''; metricAssetCount.textContent=''; metricPnL.textContent=''; metricGas.textContent=''; }
  function unskeleton(){ metricTotalValue.className=''; metricAssetCount.className=''; metricPnL.className=''; metricGas.className=''; }

  function fakeRefreshPortfolio(){
    setStatus('Refreshing...', true); skeleton();
    // Simulate async fetch (later: call backend aggregator)
    setTimeout(()=>{
      const assetCount = state.tokens.length + state.addresses.length * 2; // placeholder heuristic
      const totalValue = (assetCount * 123.45).toFixed(2);
      const pnl = ((Math.random()*10)-5).toFixed(2);
      const gas = (Math.random()*0.4).toFixed(3)+' ETH';
      unskeleton();
      metricTotalValue.textContent = '$'+totalValue;
      metricAssetCount.textContent = assetCount;
      metricPnL.textContent = (pnl>=0?'+':'')+pnl+'%';
      metricPnL.style.color = pnl>=0? '#1dd17a':'#ff6b6b';
      metricGas.textContent = gas;
      setStatus('Idle', true);
      log('Portfolio snapshot updated');
    }, 900 + Math.random()*1200);
  }

  // Apply single action object
  function applyAction(a){
    if(!a || !a.type) return;
    switch(a.type){
      case 'add_address':
        if(a.address){ addressInput.value=a.address; addAddress(); }
        break;
      case 'track_token':
        if(a.token){ tokenAddress.value=a.token; addToken(); }
        break;
      case 'refresh_portfolio':
        fakeRefreshPortfolio();
        break;
      case 'list_addresses':
        aiAppend('Tracked addresses:\n'+ (state.addresses.join('\n')||'(none)'));
        break;
      case 'list_tokens':
        aiAppend('Tracked tokens:\n'+ (state.tokens.join('\n')||'(none)'));
        break;
      case 'simulate_swap':
        aiAppend('Swap simulation placeholder '+(a.amount||'?')+' '+(a.from||'?')+' -> '+(a.to||'?'));
        break;
      default:
        aiAppend('Unknown action '+a.type);
    }
  }

  // AI intent via backend endpoint with fallback heuristic
  async function handleAiCommand(text){
    const cmd = text.trim();
    if(!cmd) return;
    aiAppend('> '+cmd);
    try {
      const r = await fetch('/api/blockchain/intent', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ command: cmd }) });
      if(!r.ok) throw new Error('HTTP '+r.status);
      const data = await r.json();
      if(Array.isArray(data.actions) && data.actions.length){
        data.actions.forEach(applyAction);
        aiAppend('Actions executed: '+data.actions.map(a=>a.type).join(', '));
        return;
      } else aiAppend('No structured actions from backend.');
    } catch(e){
      aiAppend('Backend intent parse failed ('+e.message+'). Falling back.');
      // Fallback minimal heuristic
      const lower = cmd.toLowerCase();
      if(/add address /.test(lower)){
        const addr = lower.split(/add address /)[1].trim(); addressInput.value = addr; addAddress(); applyAction({ type:'add_address'}); }
      if(/track /.test(lower) && !/track .*?portfolio/.test(lower)){
        const token = lower.split(/track /)[1].split(/\s/)[0]; tokenAddress.value=token; addToken(); applyAction({ type:'track_token'}); }
      if(/portfolio summary|portfolio|balances|refresh/.test(lower)) { fakeRefreshPortfolio(); applyAction({ type:'refresh_portfolio'}); }
    }
  }

  function aiAppend(msg){ aiResult.value += (aiResult.value?"\n":"") + msg; aiResult.scrollTop = aiResult.scrollHeight; }

  // Event wiring
  networkSelect.addEventListener('change', ()=>{ state.network = networkSelect.value; persist(); log('Switched network to '+state.network); fakeRefreshPortfolio(); });
  addAddressBtn.addEventListener('click', addAddress);
  addTokenBtn.addEventListener('click', addToken);
  refreshPortfolioBtn.addEventListener('click', fakeRefreshPortfolio);
  runAiCommand.addEventListener('click', ()=>{ const txt=aiCommand.value.trim(); if(!txt) return; log('AI Command: '+txt); handleAiCommand(txt); aiCommand.value=''; });
  aiCommand.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); runAiCommand.click(); }});
  quickBtns.forEach(btn=> btn.addEventListener('click', ()=>{ aiCommand.value = btn.dataset.q; runAiCommand.click(); }));
  clearLogBtn.addEventListener('click', ()=>{ bcLog.textContent='(no activity)'; state.log=[]; });
  exportLogBtn.addEventListener('click', ()=>{ const blob = new Blob([state.log.map(l=>`[${l.ts}] ${l.msg}`).join('\n')], {type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='blockchain_agent_log.txt'; a.click(); });
  bcRefresh.addEventListener('click', fakeRefreshPortfolio);

  // Initial
  renderAddresses(); renderTokens(); networkSelect.value = state.network; fakeRefreshPortfolio(); setStatus('Idle', true);
})();
