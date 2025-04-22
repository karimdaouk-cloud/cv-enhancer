/**
 * CV Enhancer - Executive Template
 * Generates HTML for the Executive template
 */

// Generate Executive template HTML
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
                
                ${generateCVSection('Professional Experience', data.experience, exp => `
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
                `)}
                
                ${generateCVSection('Education', data.education, edu => `
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
                `)}
                
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