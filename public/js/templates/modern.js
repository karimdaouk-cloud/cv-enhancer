/**
 * CV Enhancer - Modern Template
 * Generates HTML for the Modern template
 */

// Generate Modern template HTML
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
                        ${generateContactItems(data.personalInfo)}
                    </div>
                </div>
                
                ${data.skills && data.skills.length > 0 ? `
                <div class="sidebar-section">
                    <h2 class="sidebar-title">Skills</h2>
                    ${data.skills.slice(0, 5).map((skill, index) => {
                        const level = 70 + Math.floor(index * 5);
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
                
                ${generateCVSection('Work Experience', data.experience, exp => `
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
                
                ${generateCVSection('Certifications', data.certifications, cert => `
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
                `)}
                
                ${data.additional ? `
                <div class="cv-section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="additional">${data.additional}</div>
                </div>` : ''}
            </div>
        </div>
    `;
}