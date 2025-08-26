document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const msgDiv = document.getElementById('login-message');
    
    // Show loading message with Matrix theme
    msgDiv.innerHTML = '<div class="success-message">ACCESSING SYSTEM...</div>';
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            // Show success message
            msgDiv.innerHTML = '<div class="success-message">ACCESS GRANTED</div>';
            
            // Stop matrix effect with fade out
            if (window.stopMatrixEffect) {
                window.stopMatrixEffect();
            }
            
            // Wait for matrix effect to fade before redirecting
            setTimeout(() => {
                window.location.href = '/os.html';
            }, 2000);
            
        } else if (data.resetRequired) {
            msgDiv.innerHTML = '<div style="color: #ff6600;">PASSWORD RESET REQUIRED</div>';
            setTimeout(() => {
                window.location.href = `/reset.html?user=${encodeURIComponent(username)}`;
            }, 1500);
        } else {
            msgDiv.innerHTML = '<div style="color: #ff0000;">ACCESS DENIED</div>';
            // Add error shake effect
            document.querySelector('.login-container').style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                document.querySelector('.login-container').style.animation = '';
                msgDiv.textContent = data.message || 'Login failed';
            }, 500);
        }
    } catch (error) {
        msgDiv.innerHTML = '<div style="color: #ff0000;">SYSTEM ERROR</div>';
        console.error('Login error:', error);
    }
});