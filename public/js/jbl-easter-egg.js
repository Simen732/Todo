if (window.location.pathname.includes('/game/cookie-clicker')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Create container for the JBL icon
        const jblContainer = document.createElement('div');
        jblContainer.className = 'jbl-container';
        document.body.appendChild(jblContainer);
        
        // Create the JBL icon element
        const jblIcon = document.createElement('img');
        jblIcon.className = 'jbl-icon hidden';
        jblIcon.src = '/img/jbl.jpg'; // Make sure extension is correct
        jblIcon.alt = 'JBL Speaker';
        jblContainer.appendChild(jblIcon);
        
        // Audio element
        const jblSound = document.createElement('audio');
        jblSound.src = '/sounds/jbl-sound.mp3';
        jblSound.preload = 'auto';
        document.body.appendChild(jblSound);
        
        // Variables to track state
        let jblTimeout = null;
        let isActive = false;
        let isSoundPlaying = false;
        
        // Function to show the JBL icon at random position
        function showJblIcon() {
            if (isActive || isSoundPlaying) return;
            
            isActive = true;
            
            // Random position (keeping away from edges)
            const posX = 20 + Math.random() * (window.innerWidth - 140);
            const posY = 20 + Math.random() * (window.innerHeight - 140);
            
            // Set position
            jblIcon.style.left = `${posX}px`;
            jblIcon.style.top = `${posY}px`;
            
            // Show the icon with animation
            jblIcon.classList.remove('hidden');
            jblIcon.classList.add('show', 'shake');
            
            // Set timeout to hide if not clicked
            jblTimeout = setTimeout(() => {
                hideJblIcon();
            }, 5000); // 5 seconds
        }
        
        // Function to hide the JBL icon
        function hideJblIcon() {
            isActive = false;
            
            // First, remove the show and shake animations
            jblIcon.classList.remove('show', 'shake');
            
            // Add the fading animation
            jblIcon.classList.add('fading');
            
            // After the animation completes, actually hide the element
            setTimeout(() => {
                jblIcon.classList.remove('fading');
                jblIcon.classList.add('hidden');
            }, 1500); // Match this to the animation duration
            
            if (jblTimeout) {
                clearTimeout(jblTimeout);
                jblTimeout = null;
            }
        }
        
        // Click handler
        jblIcon.addEventListener('click', function() {
            // Set flag to prevent new icons
            isSoundPlaying = true;
            
            // Play sound
            jblSound.currentTime = 0;
            const audioDuration = 313000; // 5 minutes and 13 seconds
            
            jblSound.play()
                .catch(error => console.error('Error playing sound:', error));
            
            // Add special effects
            jblIcon.classList.add('clicked');
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'jbl-success';
            successMsg.textContent = 'JBL Mode Activated!';
            document.body.appendChild(successMsg);
            
            // CRAZY MODE ACTIVATION
            const animWrapper = document.querySelector('.animation-wrapper');
            if (animWrapper) {
                // Add more meteors for crazy mode
                for (let i = 0; i < 50; i++) {
                    const meteor = document.createElement('div');
                    meteor.className = 'meteor';
                    const posX = Math.random() * 100;
                    meteor.style.cssText = `
                        --duration: ${Math.random() * 1 + 0.5}s;
                        --meteor-opacity: 1;
                        --travel-x: ${Math.random() * 100 - 200};
                        width: ${Math.random() * 5 + 1}px;
                        height: ${Math.random() * 50 + 20}px;
                        left: ${posX}%;
                        animation-delay: -${Math.random() * 2}s;
                    `;
                    document.querySelector('.meteor-container')?.appendChild(meteor);
                }
                
                // Enable crazy mode
                animWrapper.classList.add('crazy-mode');
                
                // Enable screen shake
                document.querySelector('.app-layout')?.classList.add('shake-mode');
                
                // Create more particles
                for (let i = 0; i < 30; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.cssText = `
                        width: ${Math.random() * 20 + 5}px;
                        height: ${Math.random() * 20 + 5}px;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                    `;
                    document.querySelector('.particles')?.appendChild(particle);
                }
                
                // Disable crazy mode after audio duration
                setTimeout(() => {
                    animWrapper.classList.remove('crazy-mode');
                    document.querySelector('.app-layout')?.classList.remove('shake-mode');
                    
                    // Allow new JBL icons to appear again after song ends
                    isSoundPlaying = false;
                    
                    // Remove extra meteors and particles (they'll finish their animation)
                    setTimeout(() => {
                        const meteors = document.querySelectorAll('.meteor-container .meteor');
                        meteors.forEach((meteor, i) => {
                            if (i >= meteors.length - 50) {
                                meteor.remove();
                            }
                        });
                        
                        const particles = document.querySelectorAll('.particles .particle');
                        particles.forEach((particle, i) => {
                            if (i >= particles.length - 30) {
                                particle.remove();
                            }
                        });
                    }, 2000);
                }, audioDuration);
            }
            
            // Remove success message after animation
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 2000);
            
            // Hide the icon
            setTimeout(() => {
                jblIcon.classList.remove('clicked');
                hideJblIcon();
            }, 300);
        });
        
        // Start the random appearances
        function scheduleNextAppearance() {
            // Random time between 15-25 seconds
            const nextTime = 15000 + Math.random() * 10000;
            
            setTimeout(() => {
                // Only show new icon if sound is not playing and tab is visible
                if (!isSoundPlaying && !document.hidden) {
                    showJblIcon();
                }
                scheduleNextAppearance();
            }, nextTime);
        }
        
        // Start the cycle
        scheduleNextAppearance();
    });
}