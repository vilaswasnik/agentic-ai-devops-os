(function(){
  const startBtn = document.getElementById('startBtn');
  const startMenu = document.getElementById('startMenu');
  const search = document.getElementById('globalSearch');

  if (startBtn && startMenu) {
    startBtn.addEventListener('click', () => {
      const visible = startMenu.style.display === 'block';
      startMenu.style.display = visible ? 'none' : 'block';
    });

    // Hide start menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!startMenu.contains(e.target) && e.target !== startBtn) {
        startMenu.style.display = 'none';
      }
    });
  }

  if (search) {
    const navigate = (q) => {
      const s = q.trim().toLowerCase();
      if (!s) return;
      if (s.includes('ansible')) window.location.href = '/aiagent.html';
      else if (s.includes('shell') || s.includes('script')) window.location.href = '/aiagent.html';
      else if (s.includes('knowledge') || s.includes('doc')) window.location.href = '/knowledge-neural.html';
      else if (s.includes('terraform')) alert('Terraform Agent coming soon.');
      else alert('Try: "ansible", "shell", "knowledge", or "terraform"');
    };

    search.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        navigate(search.value);
      }
    });
  }
})();
