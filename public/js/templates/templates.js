/**
 * CV Enhancer - Template Renderer
 * Core functions for template generation and helpers
 */

// Helper function to generate CV sections
function generateCVSection(title, items, itemRenderer, containerClass = '') {
    if (!items || items.length === 0) return '';
    
    return `
    <div class="cv-section">
        <h2 class="section-title">${title}</h2>
        <div class="${containerClass || ''}">
            ${items.map(item => itemRenderer(item)).join('')}
        </div>
    </div>`;
}

// Helper function to generate contact items
function generateContactItems(personalInfo) {
    const contactConfig = [
        { icon: 'fas fa-phone', field: 'phone' },
        { icon: 'fas fa-envelope', field: 'email' },
        { icon: 'fas fa-map-marker-alt', field: 'location' },
        { icon: 'fab fa-linkedin', field: 'linkedin' },
        { icon: 'fas fa-globe', field: 'portfolio' }
    ];
    
    return contactConfig
        .filter(item => personalInfo[item.field])
        .map(item => `
            <div class="contact-item">
                <div class="contact-icon"><i class="${item.icon}"></i></div>
                <div class="contact-text">${personalInfo[item.field]}</div>
            </div>
        `).join('');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
    } catch (e) {
        return dateString;
    }
}

// Format description text with bullet points
function formatDescription(description) {
    if (!description) return '';
    
    // Check if the description contains bullet points
    if (description.includes('\n-') || description.includes('\n•')) {
        // Convert to HTML list
        const listItems = description.split(/\n[-•]/).filter(item => item.trim());
        return `
            <ul>
                ${listItems.map(item => `<li>${item.trim()}</li>`).join('')}
            </ul>
        `;
    }
    
    // Regular paragraph with line breaks converted to <br>
    return description.replace(/\n/g, '<br>');
}