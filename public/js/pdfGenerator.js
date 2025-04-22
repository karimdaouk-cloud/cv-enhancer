/**
 * CV Enhancer - PDF Generator
 * Handles the generation of PDF files from CV templates
 */

// Ensure html2pdf is loaded
if (typeof html2pdf === 'undefined') {
    console.error('html2pdf library is not loaded');
}

/**
 * Generate a PDF from CV data using the selected template
 * @param {Object} cvData - CV data to use for the PDF
 * @param {string} template - Template name to use ('professional', 'modern', or 'executive')
 * @param {string} paperSize - Paper size to use ('a4' or 'letter')
 * @returns {Promise<Blob>} - Generated PDF as a Blob
 */
async function generateCVPDF(cvData, template, paperSize) {
    try {
        // Generate HTML for the selected template
        let templateHtml;
        switch (template) {
            case 'modern':
                templateHtml = generateModernTemplateHtml(cvData);
                break;
            case 'executive':
                templateHtml = generateExecutiveTemplateHtml(cvData);
                break;
            default: // professional
                templateHtml = generateProfessionalTemplateHtml(cvData);
        }
        
        // Create a temporary container for the HTML
        const container = document.createElement('div');
        container.className = 'pdf-container';
        container.innerHTML = templateHtml;
        document.body.appendChild(container);
        
        // Configure html2pdf options
        const options = {
            margin: 10,
            filename: 'enhanced-cv.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: paperSize, orientation: 'portrait' }
        };
        
        // Generate PDF
        const pdfBlob = await html2pdf()
            .from(container.firstChild)
            .set(options)
            .outputPdf('blob');
        
        // Remove the temporary container
        document.body.removeChild(container);
        
        return pdfBlob;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

/**
 * Generate HTML for the Professional template
 * @param {Object} data - CV data
 * @returns {string} - HTML string for the template
 */
function generateProfessionalTemplateHtml(data) {
    return `
        <div class="cv-professional ${data.paperSize || 'a4'}">
            <div class="cv-header">
                <h1 class="name">${data.personalInfo.fullName}</h1>
                <div class="contact-info">
                    ${data.personalInfo.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.personalInfo.email}</div>` : ''}
                    ${data.personalInfo.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.personalInfo.phone}</div>` : ''}
                    ${data.personalInfo.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location}</div>` : ''}
                    ${data.personalInfo.linkedin ? `<div class="contact-item"><i class="fab fa-linkedin"></i> ${data.personalInfo.linkedin}</div>` : ''}
                    ${data.personalInfo.portfolio ? `<div class="contact-item"><i class="fas fa-globe"></i> ${data.personalInfo.portfolio}</div>` : ''}
                </div>
            </div>
            <div class="cv-content">
                ${data.summary ? `
                <div class="cv-section">
                    <h2 class="section-title">Professional Summary</h2>
                    <div class="summary">${data.summary}</div>
                </div>
                ` : ''}
                
                ${data.experience && data.experience.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Work Experience</h2>
                    ${data.experience.map(exp => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <div>
                                <h3 class="timeline-title">${exp.title}</h3>
                                <div class="timeline-subtitle">${exp.company}</div>
                            </div>
                            <div class="timeline-period">
                                ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                            </div>
                        </div>
                        <div class="timeline-description">${formatDescription(exp.description)}</div>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education && data.education.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <div>
                                <h3 class="timeline-title">${edu.degree}</h3>
                                <div class="timeline-subtitle">${edu.institution}</div>
                            </div>
                            <div class="timeline-period">
                                ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                            </div>
                        </div>
                        ${edu.description ? `<div class="timeline-description">${edu.description}</div>` : ''}
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-list">
                        ${data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.certifications && data.certifications.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Certifications</h2>
                    <div class="list-items">
                        ${data.certifications.map(cert => `
                        <div class="list-item">
                            <div class="list-item-title">${cert.name}</div>
                            <div class="list-item-subtitle">
                                ${cert.organization}, ${formatDate(cert.date)}
                                ${!cert.noExpiry && cert.expiry ? ` - ${formatDate(cert.expiry)}` : ''}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.languages && data.languages.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Languages</h2>
                    <div class="list-items">
                        ${data.languages.map(lang => `
                        <div class="list-item">
                            <div class="list-item-title">${lang.name}</div>
                            <div class="list-item-subtitle">${lang.level}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="cv-section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="additional">${data.additional}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Generate HTML for the Modern template
 * @param {Object} data - CV data
 * @returns {string} - HTML string for the template
 */
function generateModernTemplateHtml(data) {
    return `
        <div class="cv-modern ${data.paperSize || 'a4'}">
            <div class="cv-sidebar">
                <div class="profile">
                    <h1 class="name">${data.personalInfo.fullName}</h1>
                    ${data.experience && data.experience.length > 0 ? 
                        `<div class="profession">${data.experience[0].title}</div>` : ''}
                </div>
                
                <div class="sidebar-section">
                    <h2 class="sidebar-title">Contact</h2>
                    <div class="contact-info">
                        ${data.personalInfo.phone ? `
                        <div class="contact-item">
                            <div class="contact-icon"><i class="fas fa-phone"></i></div>
                            <div class="contact-text">${data.personalInfo.phone}</div>
                        </div>` : ''}
                        
                        ${data.personalInfo.email ? `
                        <div class="contact-item">
                            <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                            <div class="contact-text">${data.personalInfo.email}</div>
                        </div>` : ''}
                        
                        ${data.personalInfo.location ? `
                        <div class="contact-item">
                            <div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div>
                            <div class="contact-text">${data.personalInfo.location}</div>
                        </div>` : ''}
                        
                        ${data.personalInfo.linkedin ? `
                        <div class="contact-item">
                            <div class="contact-icon"><i class="fab fa-linkedin"></i></div>
                            <div class="contact-text">${data.personalInfo.linkedin}</div>
                        </div>` : ''}
                        
                        ${data.personalInfo.portfolio ? `
                        <div class="contact-item">
                            <div class="contact-icon"><i class="fas fa-globe"></i></div>
                            <div class="contact-text">${data.personalInfo.portfolio}</div>
                        </div>` : ''}
                    </div>
                </div>
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="sidebar-section">
                    <h2 class="sidebar-title">Skills</h2>
                    ${data.skills.slice(0, 5).map((skill, index) => {
                        // Calculate a level between 70-95% for visualization
                        const level = 70 + (Math.floor(index / 5) * 25);
                        return `
                        <div class="skills-bar">
                            <span class="skill-name">${skill}</span>
                            <div class="skill-level-bg">
                                <div class="skill-level" style="width: ${level}%"></div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>` : ''}
                
                ${data.languages && data.languages.length > 0 ? `
                <div class="sidebar-section">
                    <h2 class="sidebar-title">Languages</h2>
                    ${data.languages.map(lang => `
                    <div class="language-item">
                        <span class="language-name">${lang.name}</span>
                        <span class="language-level">${lang.level}</span>
                    </div>
                    `).join('')}
                </div>` : ''}
            </div>
            
            <div class="cv-main">
                ${data.summary ? `
                <div class="summary">
                    ${data.summary}
                </div>` : ''}
                
                ${data.experience && data.experience.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Work Experience</h2>
                    ${data.experience.map(exp => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${exp.title}</h3>
                            <div class="timeline-subtitle">${exp.company}</div>
                            <div class="timeline-period">
                                ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                            </div>
                        </div>
                        <div class="timeline-description">${formatDescription(exp.description)}</div>
                    </div>
                    `).join('')}
                </div>` : ''}
                
                ${data.education && data.education.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${edu.degree}</h3>
                            <div class="timeline-subtitle">${edu.institution}</div>
                            <div class="timeline-period">
                                ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                            </div>
                        </div>
                        ${edu.description ? `<div class="timeline-description">${edu.description}</div>` : ''}
                    </div>
                    `).join('')}
                </div>` : ''}
                
                ${data.certifications && data.certifications.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Certifications</h2>
                    ${data.certifications.map(cert => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${cert.name}</h3>
                            <div class="timeline-subtitle">${cert.organization}</div>
                            <div class="timeline-period">
                                ${formatDate(cert.date)}
                                ${!cert.noExpiry && cert.expiry ? ` - ${formatDate(cert.expiry)}` : ''}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>` : ''}
                
                ${data.additional ? `
                <div class="cv-section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="additional">${data.additional}</div>
                </div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Generate HTML for the Executive template
 * @param {Object} data - CV data
 * @returns {string} - HTML string for the template
 */
function generateExecutiveTemplateHtml(data) {
    return `
        <div class="cv-executive ${data.paperSize || 'a4'}">
            <div class="cv-header">
                <h1 class="name">${data.personalInfo.fullName}</h1>
                ${data.experience && data.experience.length > 0 ? 
                    `<div class="profession">${data.experience[0].title}</div>` : ''}
                <div class="contact-info">
                    ${data.personalInfo.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${data.personalInfo.email}</div>` : ''}
                    ${data.personalInfo.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${data.personalInfo.phone}</div>` : ''}
                    ${data.personalInfo.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location}</div>` : ''}
                </div>
            </div>
            <div class="cv-content">
                ${data.summary ? `
                <div class="cv-section">
                    <h2 class="section-title">Profile</h2>
                    <div class="summary">${data.summary}</div>
                </div>
                ` : ''}
                
                ${data.experience && data.experience.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Professional Experience</h2>
                    ${data.experience.map(exp => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${exp.title}</h3>
                            <div class="timeline-subtitle">${exp.company}</div>
                            <div class="timeline-period">
                                ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}
                            </div>
                        </div>
                        <div class="timeline-description">${formatDescription(exp.description)}</div>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education && data.education.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Education</h2>
                    ${data.education.map(edu => `
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${edu.degree}</h3>
                            <div class="timeline-subtitle">${edu.institution}</div>
                            <div class="timeline-period">
                                ${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}
                            </div>
                        </div>
                        ${edu.description ? `<div class="timeline-description">${edu.description}</div>` : ''}
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Core Competencies</h2>
                    <div class="skills-grid">
                        <div class="skills-column">
                            <h3>Technical Skills</h3>
                            <div class="skills-list">
                                ${data.skills.filter((_, index) => index % 2 === 0).map(skill => 
                                    `<div class="skill-item">${skill}</div>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="skills-column">
                            <h3>Professional Skills</h3>
                            <div class="skills-list">
                                ${data.skills.filter((_, index) => index % 2 === 1).map(skill => 
                                    `<div class="skill-item">${skill}</div>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${data.certifications && data.certifications.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Certifications</h2>
                    <div class="list-items">
                        ${data.certifications.map(cert => `
                        <div class="list-item">
                            <div class="list-item-title">${cert.name}</div>
                            <div class="list-item-subtitle">
                                ${cert.organization}, ${formatDate(cert.date)}
                                ${!cert.noExpiry && cert.expiry ? ` - ${formatDate(cert.expiry)}` : ''}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.languages && data.languages.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Languages</h2>
                    <div class="list-items">
                        ${data.languages.map(lang => `
                        <div class="list-item">
                            <div class="list-item-title">${lang.name}</div>
                            <div class="list-item-subtitle">${lang.level}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.additional ? `
                <div class="cv-section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="additional">${data.additional}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Helper function to format dates
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date
 */
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

/**
 * Helper function to format description text
 * @param {string} description - Description text to format
 * @returns {string} - Formatted description HTML
 */
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

/**
 * Save PDF file to user's device
 * @param {Blob} pdfBlob - PDF file as a Blob
 * @param {string} fileName - File name for the PDF
 */
function savePDF(pdfBlob, fileName = 'enhanced-cv.pdf') {
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(pdfBlob);
    downloadLink.download = fileName;
    
    // Add to document, click it, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Release the object URL
    setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
    }, 100);
}

// Export functions for use in other modules
window.PDFGenerator = {
    generateCVPDF,
    savePDF
};