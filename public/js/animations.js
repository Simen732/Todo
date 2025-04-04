document.addEventListener('DOMContentLoaded', function() {
    // Find or create animation wrapper
    let animWrapper = document.querySelector('.animation-wrapper');
    if (!animWrapper) {
        animWrapper = document.createElement('div');
        animWrapper.className = 'animation-wrapper';
        document.body.appendChild(animWrapper);
    }
    
    // Check for visibility mode options
    const urlParams = new URLSearchParams(window.location.search);
    const highVisibility = urlParams.has('high-visibility');
    const heavyShower = urlParams.has('heavy-shower');
    
    // Auto-enable higher visibility on auth pages
    const isAuthPage = document.body.classList.contains('auth-page');
    
    if (highVisibility || heavyShower || isAuthPage) {
        animWrapper.style.background = 'rgba(15, 18, 24, 0.5)'; // More transparent background
    }
    
    // Create animation elements - use higher visibility for auth pages automatically
    createMeteors(animWrapper, highVisibility || heavyShower || isAuthPage); 
    createParticles(animWrapper, highVisibility || isAuthPage);
    createGradientWaves(animWrapper, highVisibility || isAuthPage);
    createLightRays(animWrapper, highVisibility || isAuthPage);
    
    // Initialize animations
    initializeAnimations(highVisibility || isAuthPage);
    
    // Add debug border to help visualize
    if (window.location.search.includes('debug=1')) {
        animWrapper.style.border = '3px solid red';
    }
});

// Create animated meteor shower with red theme
function createMeteors(wrapper, highVisibility = false) {
    const meteorContainer = document.createElement('div');
    meteorContainer.className = 'meteor-container';
    wrapper.appendChild(meteorContainer);
    
    // Create meteors
    const meteorCount = highVisibility ? 100 : 60;
    
    for (let i = 0; i < meteorCount; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        
        // Random properties
        const posX = Math.random() * 100; // Random horizontal position
        const duration = Math.random() * 1.5 + 0.7; // Duration between 0.7 and 2.2 seconds
        const delay = Math.random() * 10; // Longer random delay for sporadic appearance
        const opacity = highVisibility ? (Math.random() * 0.8 + 0.5) : (Math.random() * 0.6 + 0.4);
        const width = Math.random() * 3 + 1; // Random width between 1px and 4px
        const height = Math.random() * 40 + 15; // Random height between 15px and 55px
        const travelX = Math.random() * 100 - 200; // More negative travel for consistent angle
        
        // Add variety to the red meteor appearances
        const meteorTypes = ['red-bright', 'red-orange', 'red-dark', 'red-intense'];
        const meteorType = meteorTypes[Math.floor(Math.random() * meteorTypes.length)];
        
        // Based on the meteor type, add custom red colors
        let meteorColor, glowColor;
        
        switch(meteorType) {
            case 'red-bright':
                meteorColor = `linear-gradient(to bottom right, 
                    rgba(255, 255, 255, 0.9), 
                    rgba(255, 180, 180, 0.8) 10%, 
                    rgba(255, 80, 80, 0.6) 50%, 
                    rgba(200, 0, 0, 0.3) 100%)`;
                glowColor = '0 0 10px 1px rgba(255, 80, 50, 0.6), 0 0 16px 2px rgba(255, 30, 0, 0.4)';
                break;
            case 'red-orange':
                meteorColor = `linear-gradient(to bottom right, 
                    rgba(255, 255, 255, 0.9), 
                    rgba(255, 200, 150, 0.8) 10%, 
                    rgba(255, 100, 50, 0.6) 50%, 
                    rgba(200, 50, 0, 0.3) 100%)`;
                glowColor = '0 0 10px 1px rgba(255, 100, 0, 0.6), 0 0 16px 2px rgba(200, 50, 0, 0.4)';
                break;
            case 'red-dark':
                meteorColor = `linear-gradient(to bottom right, 
                    rgba(255, 255, 255, 0.9), 
                    rgba(230, 150, 150, 0.8) 10%, 
                    rgba(180, 50, 50, 0.6) 50%, 
                    rgba(120, 0, 0, 0.3) 100%)`;
                glowColor = '0 0 10px 1px rgba(200, 50, 50, 0.6), 0 0 16px 2px rgba(150, 0, 0, 0.4)';
                break;
            case 'red-intense':
            default:
                meteorColor = `linear-gradient(to bottom right, 
                    rgba(255, 255, 255, 0.9), 
                    rgba(255, 150, 150, 0.8) 10%, 
                    rgba(255, 50, 0, 0.6) 50%, 
                    rgba(180, 0, 0, 0.3) 100%)`;
                glowColor = '0 0 10px 1px rgba(255, 50, 0, 0.6), 0 0 16px 2px rgba(200, 0, 0, 0.4)';
        }
        
        // Apply styles with meteor type colors
        meteor.style.cssText = `
            --duration: ${duration}s;
            --meteor-opacity: ${opacity};
            --travel-x: ${travelX};
            width: ${width}px;
            height: ${height}px;
            left: ${posX}%;
            animation-delay: -${delay}s;
            background: ${meteorColor};
            box-shadow: ${glowColor};
            transform: rotate(15deg); /* More vertical angle, like raindrops */
        `;
        
        meteorContainer.appendChild(meteor);
    }
    
    // Create impact effects with red theme
    setInterval(() => {
        if (document.hidden) return;
        
        const impact = document.createElement('div');
        impact.className = 'impact';
        
        const posX = Math.random() * (window.innerWidth - 20);
        const size = Math.random() * 20 + 8; // Larger impact effect (8-28px)
        
        impact.style.left = `${posX}px`;
        impact.style.width = `${size}px`;
        impact.style.height = `${size}px`;
        impact.style.background = `radial-gradient(circle, 
            rgba(255, 200, 150, 0.9) 0%, 
            rgba(255, 80, 0, 0.6) 40%, 
            rgba(200, 0, 0, 0.2) 70%, 
            transparent 100%)`;
        impact.style.boxShadow = '0 0 20px 5px rgba(255, 50, 0, 0.5)';
        
        wrapper.appendChild(impact);
        
        setTimeout(() => {
            if (impact.parentNode === wrapper) {
                wrapper.removeChild(impact);
            }
        }, 800); // Impact animation is 0.8s
    }, 200); // Less frequent impacts than raindrops
}

// Create floating particles - with optional high visibility
function createParticles(wrapper, highVisibility = false) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    wrapper.appendChild(particlesContainer);
    
    // Create 30 particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 10 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 40 + 20;
        const travelX = Math.random() * 100 - 50;
        const travelY = Math.random() * 100 + 50;
        const delay = Math.random() * duration;
        const opacity = highVisibility ? (Math.random() * 0.5 + 0.3) : (Math.random() * 0.3 + 0.1); // Higher opacity in high visibility mode
        
        // Apply styles
        particle.style.cssText = `
            --duration: ${duration}s;
            --travel-x: ${travelX};
            --travel-y: ${travelY};
            --particle-opacity: ${opacity};
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            top: ${posY}%;
            animation-delay: -${delay}s;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Create gradient waves - with optional high visibility
function createGradientWaves(wrapper, highVisibility = false) {
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'gradient-wave';
        wrapper.appendChild(wave);
        
        if (highVisibility) {
            wave.style.opacity = '0.8'; // Higher opacity in high visibility mode
        }
    }
}

// Create light rays - with optional high visibility
function createLightRays(wrapper, highVisibility = false) {
    for (let i = 0; i < 2; i++) {
        const rays = document.createElement('div');
        rays.className = 'light-rays';
        wrapper.appendChild(rays);
        
        if (highVisibility) {
            rays.style.opacity = '0.8'; // Higher opacity in high visibility mode
        }
    }
}

/**
 * Initialize animations and add interactive effects
 */
function initializeAnimations(highVisibility = false) {
    // Add subtle parallax effect to background
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth < 768) return; // Skip on small screens
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        // Move particles slightly with mouse
        document.querySelectorAll('.particle').forEach(particle => {
            const offsetX = (mouseX - 0.5) * 20;
            const offsetY = (mouseY - 0.5) * 20;
            
            particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
        
        // Move meteors slightly with mouse - updated to maintain raindrop-like angle
        document.querySelectorAll('.meteor').forEach(meteor => {
            const offsetX = (mouseX - 0.5) * 10;
            const angle = 15 + ((mouseY - 0.5) * 5); // More vertical angle like raindrops
            meteor.style.transform = `translateX(${offsetX}px) rotate(${angle}deg)`;
        });
        
        // Move light rays with mouse
        document.querySelectorAll('.light-rays').forEach(rays => {
            const offsetX = (mouseX - 0.5) * 10;
            const offsetY = (mouseY - 0.5) * 10;
            
            rays.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rays.style.transform.match(/rotate\((.+?)\)/)?.[1] || '0deg'})`;
        });
    });
    
    // Add scroll effect
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        // Adjust opacity based on scroll
        document.querySelectorAll('.gradient-wave').forEach(wave => {
            const opacity = Math.max(0, 1 - scrollY / 500);
            wave.style.opacity = opacity.toString();
        });
    });
    
    // Add new particles every few seconds
    setInterval(() => {
        if (document.hidden) return; // Don't add when tab is not visible
        
        const container = document.querySelector('.particles');
        if (!container) return;
        
        // Add a new particle if we have fewer than the max
        if (container.children.length < 100) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random properties similar to createParticles()
            const size = Math.random() * 6 + 2;
            const colors = [
                'rgba(66, 133, 244, 0.4)',
                'rgba(124, 77, 255, 0.3)',
                'rgba(0, 200, 83, 0.25)',
                'rgba(255, 171, 0, 0.2)'
            ];
            const colorIndex = Math.floor(Math.random() * colors.length);
            const opacity = Math.random() * 0.2 + 0.1;
            const duration = Math.random() * 40 + 20;
            const travelX = Math.random() * 100 - 50;
            const travelY = Math.random() * 100 + 50;
            
            // Position randomly
            const posX = Math.random() * 100;
            
            // Set CSS custom properties
            particle.style.setProperty('--particle-color', colors[colorIndex]);
            particle.style.setProperty('--particle-glow', colors[colorIndex].replace('0.', '0.'));
            particle.style.setProperty('--particle-opacity', opacity.toString());
            particle.style.setProperty('--duration', `${duration}s`);
            particle.style.setProperty('--travel-x', travelX.toString());
            particle.style.setProperty('--travel-y', travelY.toString());
            
            // Set other styles
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.bottom = '0';
            
            // Add to container
            container.appendChild(particle);
            
            // Remove particle after animation ends
            setTimeout(() => {
                if (particle.parentNode === container) {
                    container.removeChild(particle);
                }
            }, duration * 1000);
        }
    }, 1000);
    
    // Create splash effects occasionally
    setInterval(() => {
        if (document.hidden) return; // Don't add when tab is not visible
        
        const wrapper = document.querySelector('.animation-wrapper');
        if (!wrapper) return;
        
        // Create a splash
        const splash = document.createElement('div');
        splash.className = 'splash';
        
        // Random position
        const posX = Math.random() * (window.innerWidth - 20);
        const size = Math.random() * 10 + 5;
        
        splash.style.left = `${posX}px`;
        splash.style.width = `${size}px`;
        splash.style.height = `${size}px`;
        
        wrapper.appendChild(splash);
        
        // Remove splash after animation completes
        setTimeout(() => {
            if (splash.parentNode === wrapper) {
                wrapper.removeChild(splash);
            }
        }, 500);
    }, 100);
}

/**
 * Add animation class to elements that enter the viewport
 */
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // Target elements to animate
    document.querySelectorAll('.todo-list li, .category-item-large, .task-create-container').forEach(el => {
        observer.observe(el);
    });
}

// Initialize scroll animations if browser supports Intersection Observer
if ('IntersectionObserver' in window) {
    // Wait for content to load
    window.addEventListener('load', setupScrollAnimations);
}
