// Matrix Digital Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // English letters and numbers
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Devanagari vowels
        this.characters += 'अआइईउऊऋएऐओऔ';
        
        // Devanagari consonants
        this.characters += 'कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह';
        
        // Devanagari numbers
        this.characters += '०१२३४५६७८९';
        
        // Marathi specific characters
        this.characters += 'ळझञ';
        
        // Hindi common words characters (additional conjuncts and combinations)
        this.characters += 'क्षत्रज्ञश्रद्वत्वस्वप्रब्रम्रल्रव्रह्रक्रग्रच्रज्रट्रड्रन्रप्रफ्रब्रभ्रम्रय्रर्रल्रव्र';
        
        // Matras (vowel signs)
        this.characters += 'ािीुूृेैोौ्ं:';
        
        this.fontSize = 16; // Slightly larger for better Devanagari visibility
        this.columns = 0;
        this.drops = [];
        this.animationId = null;
        
        this.init();
        this.animate();
    }
    
    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate columns
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        
        // Initialize drops
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
        
        // Set font with Devanagari support
        this.ctx.font = this.fontSize + 'px "Noto Sans Devanagari", "Mangal", "Arial Unicode MS", Courier, monospace';
    }
    
    draw() {
        // Create trailing effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set text color
        this.ctx.fillStyle = '#00ff00';
        
        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = this.characters[Math.floor(Math.random() * this.characters.length)];
            
            // Calculate position
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;
            
            // Draw character
            this.ctx.fillText(char, x, y);
            
            // Reset drop when it reaches bottom
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // Move drop down
            this.drops[i]++;
        }
    }
    
    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    fadeOut() {
        this.canvas.classList.add('matrix-fadeout');
        setTimeout(() => {
            this.stop();
        }, 1500);
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.canvas.style.display = 'none';
    }
    
    resize() {
        this.init();
    }
}

// Initialize Matrix effect when page loads
let matrixEffect;

document.addEventListener('DOMContentLoaded', function() {
    matrixEffect = new MatrixRain();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (matrixEffect) {
            matrixEffect.resize();
        }
    });
});

// Function to stop matrix effect (call this from login.js on successful login)
window.stopMatrixEffect = function() {
    if (matrixEffect) {
        matrixEffect.fadeOut();
    }
};

// Glitch effect for enhanced visual appeal
function createGlitchEffect() {
    const canvas = document.getElementById('matrix-canvas');
    const originalFilter = canvas.style.filter;
    
    canvas.style.filter = 'hue-rotate(90deg) contrast(1.2)';
    
    setTimeout(() => {
        canvas.style.filter = 'hue-rotate(-30deg) contrast(0.8)';
    }, 100);
    
    setTimeout(() => {
        canvas.style.filter = originalFilter;
    }, 200);
}

// Add random glitch effects
setInterval(() => {
    if (Math.random() > 0.95 && matrixEffect && matrixEffect.animationId) {
        createGlitchEffect();
    }
}, 1000);
