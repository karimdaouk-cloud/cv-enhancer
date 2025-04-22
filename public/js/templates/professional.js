/**
 * CV Enhancer - Professional Template
 * Generates HTML for the Professional template
 */

// Generate Professional template HTML
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
                
                ${generateCVSection('Education', data.education, edu => `
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
                `)}
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="cv-section">
                    <h2 class="section-title">Skills</h2>
                    <div class="skills-list">
                        ${data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${generateCVSection('Certifications', data.certifications, cert => `
                    <div class="list-item">
                        <div class="list-item-title">${cert.name}</div>
                        <div class="list-item-subtitle">
                            ${cert.organization}${cert.date ? `, ${formatDate(cert.date)}` : ''}
                            ${!cert.noExpiry && cert.expiry ? ` - ${formatDate(cert.expiry)}` : ''}
                        </div>
                    </div>
                `, 'list-items')}
                
                ${generateCVSection('Languages', data.languages, lang => `
                    <div class="list-item">
                        <div class="list-item-title">${lang.name}</div>
                        <div class="list-item-subtitle">${lang.level}</div>
                    </div>
                `, 'list-items')}
                
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