/**
 * CV Enhancer - Animations
 * Handles page transitions and animations
 */

// Initialize page animations and transitions
function initPageAnimations() {
    // Create and handle page transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Animation classes for hero elements
    const elements = {
        heroContent: document.querySelector('.hero-content'),
        heroImage: document.querySelector('.hero-image'),
        floatingElements: document.querySelectorAll('.floating-element'),
        scrollReveal: document.querySelectorAll('.feature-card, .template-card, .process-step, .section-container')
    };
    
    // Add animations to hero elements if they exist
    if (elements.heroContent) {
        const heading = elements.heroContent.querySelector('h2');
        if (heading) heading.classList.add('animate-fade-in');
        
        const paragraph = elements.heroContent.querySelector('p');
        if (paragraph) paragraph.classList.add('animate-fade-in', 'delay-100');
        
        const buttons = elements.heroContent.querySelector('.hero-buttons');
        if (buttons) buttons.classList.add('animate-fade-in', 'delay-200');
    }
    
    if (elements.heroImage) {
        const image = elements.heroImage.querySelector('.main-image');
        if (image) image.classList.add('animate-fade-in', 'delay-300');
    }
    
    if (elements.floatingElements.length) {
        elements.floatingElements.forEach((el, index) => {
            el.classList.add('animate-fade-in', `delay-${(index + 4) * 100}`);
        });
    }
    
    // Setup scroll reveal animations
    elements.scrollReveal.forEach(el => el.classList.add('scroll-reveal'));
    
    // Reveal elements that are visible in viewport
    const revealOnScroll = () => {
        elements.scrollReveal.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 && rect.bottom >= 0) {
                el.classList.add('revealed');
            }
        });
    };
    
    // Check on initial load and scroll
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);
    
    // Remove overlay after transition
    setTimeout(() => {
        overlay.classList.add('loaded');
        overlay.addEventListener('transitionend', () => overlay.remove());
    }, 500);
}