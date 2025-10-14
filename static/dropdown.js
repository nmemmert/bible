// Simple dropdown function (exposed globally)
function toggleDropdown(element, event) {
    console.log('toggleDropdown called', element);
    event.preventDefault();
    event.stopPropagation();
    
    const menu = element.parentElement.querySelector('.dropdown-menu');
    console.log('Menu found:', menu);
    
    // Hide all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(function(m) {
        if (m !== menu) m.style.display = 'none';
    });
    
    // Toggle this dropdown
    if (menu) {
        const newDisplay = menu.style.display === 'block' ? 'none' : 'block';
        console.log('Setting display to:', newDisplay);
        menu.style.display = newDisplay;
    }
    
    return false;
}

// Close dropdowns when clicking outside - wait for DOM to load
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - setting up click handler');
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(function(m) {
                m.style.display = 'none';
            });
        }
    });
});
