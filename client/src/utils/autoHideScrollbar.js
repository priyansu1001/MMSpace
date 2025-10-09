// Auto-hide scrollbar functionality
let scrollTimeout;

const handleScroll = (element) => {
    // Add scrolling class to show scrollbar
    element.classList.add('scrolling');
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Set timeout to hide scrollbar after scrolling stops
    scrollTimeout = setTimeout(() => {
        element.classList.remove('scrolling');
    }, 1000); // Hide after 1 second of no scrolling
};

const initAutoHideScrollbars = () => {
    // Apply to document body
    document.addEventListener('scroll', () => handleScroll(document.body));
    
    // Apply to all scrollable elements
    const scrollableElements = document.querySelectorAll('[data-auto-hide-scroll]');
    scrollableElements.forEach(element => {
        element.addEventListener('scroll', () => handleScroll(element));
    });
    
    // Apply to common scrollable containers
    const containers = document.querySelectorAll('.overflow-auto, .overflow-y-auto, .overflow-x-auto');
    containers.forEach(element => {
        element.addEventListener('scroll', () => handleScroll(element));
    });
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoHideScrollbars);
} else {
    initAutoHideScrollbars();
}

// Re-initialize when new content is added (for React components)
const observer = new MutationObserver(() => {
    initAutoHideScrollbars();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

export default initAutoHideScrollbars;