// Simple script to verify animations are working
console.log('Animation check script loaded');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - checking animations');
    
    // Check if animations wrapper exists
    const animWrapper = document.querySelector('.animation-wrapper');
    if (animWrapper) {
        console.log('Animation wrapper found:', animWrapper);
        console.log('Number of particles:', document.querySelectorAll('.particle').length);
        console.log('Number of gradient waves:', document.querySelectorAll('.gradient-wave').length);
        console.log('Number of light rays:', document.querySelectorAll('.light-rays').length);
    } else {
        console.error('Animation wrapper not found!');
        console.log('Attempting to create animation wrapper manually...');
        
        // Try to create it manually
        const newAnimWrapper = document.createElement('div');
        newAnimWrapper.className = 'animation-wrapper';
        document.body.appendChild(newAnimWrapper);
        
        // Call animations.js functions directly if they're in the global scope
        if (typeof createParticles === 'function') {
            createParticles(newAnimWrapper);
            createGradientWaves(newAnimWrapper);
            createLightRays(newAnimWrapper);
            initializeAnimations();
            console.log('Animation elements created manually.');
        } else {
            console.error('Animation functions not found in global scope.');
        }
    }
});