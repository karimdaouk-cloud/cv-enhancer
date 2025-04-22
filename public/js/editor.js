/**
 * CV Enhancer - Editor Page
 * Core functionality for the CV editor
 */

// Initialize the editor page
function initEditorPage() {
    console.log('Initializing editor page');
    
    const state = window.CVEnhancer.state;
    
    // Try to load data from session storage, otherwise use sample data
    try {
        const storedData = sessionStorage.getItem('cvData');
        if (storedData) {
            state.cvData = JSON.parse(storedData);
            console.log('Loaded CV data from session storage');
        } else {
            console.log('No CV data found in session storage, using sample data');
            state.cvData = getSampleCVData();
        }
    } catch (error) {
        console.error('Error loading CV data:', error);
        state.cvData = getSampleCVData();
    }
    
    // Populate editor with data
    if (window.CVEnhancer.sectionHandlers && window.CVEnhancer.sectionHandlers.populateEditorWithData) {
        window.CVEnhancer.sectionHandlers.populateEditorWithData(state.cvData);
    } else {
        console.error('Section handlers not loaded properly');
    populateEditorWithData(state.cvData);
    }
    
    // Setup main editor functionality
    setupNavigation();
    if (window.CVEnhancer.sectionHandlers && window.CVEnhancer.sectionHandlers.initSectionHandlers) {
        // Section handlers already initialized in sections.js
        console.log('Section handlers initialized from sections.js');
    } else {
    initSectionHandlers();
    }
    initSkillsManagement();
    setupPreviewAndExport();
    
    // Initialize template selection
    initTemplateSelection();
    
    // Initialize preview controls
    initPreviewControls();
    
    console.log('Editor page initialization complete');
    
    // Add event listeners for preview functionality
    document.getElementById('closePreview').addEventListener('click', function() {
        console.log('Close preview button clicked');
        closePreview();
    });
    
    document.getElementById('downloadFromPreview').addEventListener('click', function() {
        console.log('Download from preview button clicked');
        downloadCV();
    });
    
    // Template selection
    document.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', function() {
            console.log('Template option clicked:', this.getAttribute('data-template'));
            document.querySelectorAll('.template-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update preview if it's visible
            if (document.getElementById('previewPanel').style.display === 'flex') {
                console.log('Updating preview with new template');
                updatePreview(collectCVData());
            }
        });
    });
    
    // AI enhance button
    $('#aiEnhanceButton').off('click').on('click', function() {
        console.log('AI Enhance button clicked');
        
        // Show loading overlay
        $('#loadingOverlay').addClass('active');
        $('#loadingMessage').text('Enhancing your CV with AI...');
        
        // Use timeout to simulate AI processing
        setTimeout(() => {
            try {
                // Call enhanceCV function
            enhanceCV();
                
                // Show success toast
                if (window.CVEnhancer && window.CVEnhancer.showToast) {
                    window.CVEnhancer.showToast('Your CV has been enhanced with AI!', 'success');
                }
            } catch (error) {
                console.error('Error enhancing CV:', error);
                if (window.CVEnhancer && window.CVEnhancer.showToast) {
                    window.CVEnhancer.showToast('Error enhancing your CV. Please try again.', 'error');
                }
            } finally {
                // Hide loading overlay
            $('#loadingOverlay').removeClass('active');
            }
        }, 2000);
    });
    
    // Setup navigation between sections and templates
    function setupNavigation() {
        // Section navigation
        $('.section-tabs li').on('click', function() {
            const sectionId = $(this).data('section');
            $('.section-tabs li').removeClass('active');
            $(this).addClass('active');
            $('.section-container').removeClass('active');
            $('#' + sectionId).addClass('active');
        });
        
        // Template selection
        $('.template-option').on('click', function() {
            state.currentTemplate = $(this).data('template');
            $('.template-option').removeClass('active');
            $(this).addClass('active');
            
            if ($('#previewPanel').hasClass('active')) {
                updatePreview();
            }
        });
        
        // Toggle between original and enhanced content
        $(document).on('click', '.btn-tab', function() {
            const target = $(this).data('target');
            const parent = $(this).closest('.form-group');
            
            parent.find('.btn-tab').removeClass('active');
            $(this).addClass('active');
            parent.find('.content-container').removeClass('active');
            parent.find('#' + target).addClass('active');
        });
        
        // Accept AI suggestions
        $(document).on('click', '.btn-accept, .btn-edit', function() {
            const suggestionContainer = $(this).closest('.ai-suggestion');
            const enhancedContent = suggestionContainer.find('.suggestion-content').text();
            const originalTextarea = suggestionContainer.closest('.form-group').find('textarea');
            
            originalTextarea.val(enhancedContent);
            
            const originalTabId = suggestionContainer.closest('.content-container').attr('id').replace('enhanced-', 'original-');
            suggestionContainer.closest('.form-group').find(`[data-target="${originalTabId}"]`).click();
        });
    }
    
    // Setup preview and export functionality
    function setupPreviewAndExport() {
        console.log('Setting up preview and export functionality');
        
        // Set up preview button
        const previewButton = document.getElementById('previewButton');
        if (previewButton) {
            previewButton.addEventListener('click', function() {
                console.log('Preview button clicked');
                showPreview();
            });
        }
        
        // Set up download button
        const downloadButton = document.getElementById('downloadButton');
        if (downloadButton) {
            downloadButton.addEventListener('click', function() {
                console.log('Download button clicked');
                downloadCV();
            });
        }
        
        // Set up close preview button
        const closePreviewButton = document.getElementById('closePreview');
        if (closePreviewButton) {
            closePreviewButton.addEventListener('click', closePreview);
        }
        
        // Set up download from preview button
        const downloadFromPreviewButton = document.getElementById('downloadFromPreview');
        if (downloadFromPreviewButton) {
            downloadFromPreviewButton.addEventListener('click', downloadCV);
        }
    }
    
    // Update the CV preview
    function updatePreview() {
        const previewFrame = $('#previewFrame')[0];
        const currentCVData = getCurrentFormData();
        
        // Choose the appropriate template generator
        let templateHtml;
        switch (state.currentTemplate) {
            case 'modern':
                templateHtml = generateModernTemplateHtml(currentCVData);
                break;
            case 'executive':
                templateHtml = generateExecutiveTemplateHtml(currentCVData);
                break;
            default: // professional
                templateHtml = generateProfessionalTemplateHtml(currentCVData);
        }
        
        // Write template HTML to preview iframe
        const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;
        previewDocument.open();
        previewDocument.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CV Preview</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <link rel="stylesheet" href="/css/main.css">
                <link rel="stylesheet" href="/css/templates/template1.css">
                <link rel="stylesheet" href="/css/templates/template2.css">
                <link rel="stylesheet" href="/css/templates/template3.css">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    .preview-container {
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                    }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    ${templateHtml}
                </div>
            </body>
            </html>
        `);
        previewDocument.close();
    }
    
    // Collect all current form data
    function getCurrentFormData() {
        return {
            personalInfo: {
                fullName: $('#fullName').val() || 'Your Name',
                email: $('#email').val() || 'email@example.com',
                phone: $('#phone').val() || '(123) 456-7890',
                location: $('#location').val() || 'City, Country',
                linkedin: $('#linkedin').val() || '',
                portfolio: $('#portfolio').val() || ''
            },
            summary: $('#professionalSummary').val() || 'Professional summary goes here...',
            experience: getFormItems('.experience-item', {
                title: '.job-title',
                company: '.company-name',
                startDate: '.start-date',
                endDate: '.end-date',
                current: '.current-job',
                description: '.job-description'
            }),
            education: getFormItems('.education-item', {
                degree: '.degree',
                institution: '.institution',
                startDate: '.edu-start-date',
                endDate: '.edu-end-date',
                current: '.current-edu',
                description: '.edu-description'
            }),
            skills: [...$('#skillTags .skill-tag')].map(tag => 
                $(tag).text().trim().replace('×', '')
            ),
            certifications: getFormItems('.certification-item', {
                name: '.cert-name',
                organization: '.cert-org',
                date: '.cert-date',
                expiry: '.cert-expiry',
                noExpiry: '.no-expiry'
            }),
            languages: getFormItems('.language-item', {
                name: '.language-name',
                level: '.proficiency-level'
            }),
            additional: $('#additionalInfo').val() || '',
            paperSize: state.paperSize
        };
    }
    
    // Helper function to get form items by selector
    function getFormItems(selector, fields) {
        const items = [];
        
        $(selector).each(function() {
            const item = {};
            
            // Get text fields
            Object.entries(fields).forEach(([key, fieldSelector]) => {
                if (key === 'current' || key === 'noExpiry') {
                    item[key] = $(this).find(fieldSelector).prop('checked');
                } else {
                    item[key] = $(this).find(fieldSelector).val() || 
                                (key.includes('title') ? 'Title' : 
                                 key.includes('company') || key.includes('institution') ? 'Organization' : 
                                 key.includes('description') ? 'Description...' : '');
                }
            });
            
            items.push(item);
        });
        
        return items;
    }
    
    // Enhance CV with AI suggestions
    function enhanceCV() {
        console.log('Enhancing CV with AI...');
        
        // Enhanced summary - make sure the element exists first
        const summaryElement = $('#enhancedSummaryContent');
        if (summaryElement.length > 0) {
            summaryElement.text(
            'Results-driven Senior Developer with over 5 years of expertise in full-stack web development and mobile applications. ' +
            'Demonstrated proficiency in JavaScript, React, and Node.js with a proven track record of leading development teams to ' +
            'deliver high-quality, responsive web applications. Experienced in implementing CI/CD pipelines and improving code quality ' +
            'through comprehensive unit testing methodologies.'
        );
            
            // Automatically switch to the enhanced tab
            $('button.btn-tab[data-target="enhanced-summary"]').click();
        } else {
            console.error('Enhanced summary element not found');
        }
        
        // Enhance experience descriptions
        $('.experience-item').each(function(index) {
            const enhancedDesc = index === 0 ?
                'Provided technical leadership for a team of 5 developers, implementing Agile methodologies that increased delivery speed by 30%. Architected and deployed responsive web applications with React and Node.js, resulting in a 25% improvement in user engagement. Established robust CI/CD pipelines that reduced deployment time by 40% and implemented comprehensive unit testing that decreased production bugs by 60%.' :
                'Designed and developed reusable React components that improved development efficiency by 20%. Collaborated closely with UX/UI designers to implement pixel-perfect responsive designs across mobile and desktop platforms. Optimized frontend performance, achieving a 35% reduction in load time and improving user experience metrics by 15%.';
            
            const enhancedDescElement = $(this).find('.enhanced-description');
            if (enhancedDescElement.length > 0) {
                enhancedDescElement.text(enhancedDesc);
                
                // Automatically switch to the enhanced tab
                $(this).find('button.btn-tab[data-target^="enhanced-exp"]').click();
            } else {
                console.error('Enhanced description element not found for experience item', index);
            }
        });
        
        // Generate skill suggestions
        if ($('#generateSkillsBtn').length > 0) {
        $('#generateSkillsBtn').trigger('click');
        } else {
            console.error('Generate skills button not found');
        }
    }
}

function initSkillsManagement() {
    // Add skill on button click
    $('#addSkillBtn').on('click', function() {
        const skillInput = $('#skillInput');
        const skillName = skillInput.val().trim();
        
        if (skillName) {
            if (window.CVEnhancer && typeof window.addSkill === 'function') {
                window.addSkill(skillName);
            } else if (window.CVEnhancer && typeof window.CVEnhancer.sectionHandlers.addSkill === 'function') {
                window.CVEnhancer.sectionHandlers.addSkill(skillName);
            } else {
                // Fallback implementation
                addSkillFallback(skillName);
            }
            skillInput.val('').focus();
        }
    });
    
    // Add skill on Enter key
    $('#skillInput').on('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const skillName = $(this).val().trim();
            
            if (skillName) {
                if (window.CVEnhancer && typeof window.addSkill === 'function') {
                    window.addSkill(skillName);
                } else if (window.CVEnhancer && window.CVEnhancer.sectionHandlers && 
                          typeof window.CVEnhancer.sectionHandlers.addSkill === 'function') {
                    window.CVEnhancer.sectionHandlers.addSkill(skillName);
                } else {
                    // Fallback implementation
                    addSkillFallback(skillName);
                }
                $(this).val('').focus();
            }
        }
    });
    
    // Generate skill suggestions
    $('#generateSkillsBtn').on('click', function() {
        const suggestedSkills = $('#suggestedSkills');
        suggestedSkills.html('<div class="loading-spinner"></div>');
        
        // Simulate AI generating skills
        setTimeout(function() {
            const sampleSkills = [
                'Problem Solving', 'Project Management', 'Leadership', 
                'Communication', 'Data Analysis', 'Strategic Planning'
            ];
            
            suggestedSkills.empty();
            
            sampleSkills.forEach(function(skill) {
                const skillItem = $(`
                    <div class="skill-suggestion">
                        <span>${skill}</span>
                        <button class="btn btn-small btn-add-suggestion"><i class="fas fa-plus"></i></button>
                    </div>
                `);
                
                skillItem.find('.btn-add-suggestion').on('click', function() {
                    if (window.CVEnhancer && typeof window.addSkill === 'function') {
                        window.addSkill(skill);
                    } else if (window.CVEnhancer && window.CVEnhancer.sectionHandlers && 
                              typeof window.CVEnhancer.sectionHandlers.addSkill === 'function') {
                        window.CVEnhancer.sectionHandlers.addSkill(skill);
                    } else {
                        addSkillFallback(skill);
                    }
                    skillItem.remove();
                });
                
                suggestedSkills.append(skillItem);
            });
            
            if (window.CVEnhancer && window.CVEnhancer.showToast) {
                window.CVEnhancer.showToast('Skill suggestions generated', 'success');
            }
        }, 1500);
    });
}

// Fallback skill addition function
function addSkillFallback(skillName) {
    // Check if skill already exists
    const existingSkills = Array.from($('#skillTags .skill-tag span')).map(span => 
        $(span).text().toLowerCase()
    );
    
    if (existingSkills.includes(skillName.toLowerCase())) {
        if (window.CVEnhancer && window.CVEnhancer.showToast) {
            window.CVEnhancer.showToast('This skill already exists', 'warning');
        } else {
            alert('This skill already exists');
        }
        return;
    }
    
    // Create and append the skill tag
    const skillTag = $(`
        <div class="skill-tag">
            <span>${skillName}</span>
            <button class="remove-skill" aria-label="Remove skill">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);
    
    // Add event listener for remove button
    skillTag.find('.remove-skill').on('click', function() {
        skillTag.remove();
    });
    
    // Add to DOM
    $('#skillTags').append(skillTag);
}

// Fallback implementation for populateEditorWithData if the sections.js module fails to load
function populateEditorWithData(data) {
    console.warn('Using fallback populateEditorWithData from editor.js');
    if (!data) return;
    
    // Basic implementation to fill personal info
    $('#fullName').val(data.personalInfo.fullName || '');
    $('#email').val(data.personalInfo.email || '');
    $('#phone').val(data.personalInfo.phone || '');
    $('#location').val(data.personalInfo.location || '');
    $('#linkedin').val(data.personalInfo.linkedin || '');
    $('#portfolio').val(data.personalInfo.portfolio || '');
    
    // Summary
    $('#professionalSummary').val(data.summary || '');
    
    // For the other fields, we'll need a more complete implementation
    // This is just a fallback in case sections.js fails to load
}

// Get a sample CV data for testing
function getSampleCVData() {
    console.log('Getting sample CV data');
    
    return {
        personal: {
            name: 'John Doe',
            title: 'Senior Software Developer',
            email: 'john.doe@example.com',
            phone: '+1 (123) 456-7890',
            location: 'New York, NY',
            website: 'www.johndoe.com',
            linkedin: 'linkedin.com/in/johndoe'
        },
        summary: 'Experienced software developer with over 8 years of experience in full-stack web development. Proficient in JavaScript, React, Node.js, and Python. Strong problem-solving abilities and a passion for creating elegant, efficient solutions.',
        experience: [
            {
                title: 'Senior Software Developer',
                company: 'Tech Solutions Inc.',
                startDate: '2020-01',
                endDate: 'Present',
                description: 'Led development of multiple web applications using React and Node.js. Implemented CI/CD pipelines and improved code quality practices.'
            },
            {
                title: 'Software Developer',
                company: 'Web Innovations',
                startDate: '2017-03',
                endDate: '2019-12',
                description: 'Developed and maintained customer-facing web applications. Worked closely with design team to implement responsive UI features.'
            }
        ],
        education: [
            {
                degree: 'Master of Computer Science',
                institution: 'University of Technology',
                startDate: '2015-09',
                endDate: '2017-05',
                description: 'Specialized in software engineering and data structures. Graduated with honors.'
            },
            {
                degree: 'Bachelor of Science in Computer Science',
                institution: 'State University',
                startDate: '2011-09',
                endDate: '2015-05',
                description: 'Dean\'s list student. Participated in programming competitions.'
            }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML', 'SQL', 'MongoDB', 'Git', 'Docker'],
        certifications: [
            {
                name: 'AWS Certified Developer',
                issuer: 'Amazon Web Services',
                date: '2021-06'
            },
            {
                name: 'Professional Scrum Master I',
                issuer: 'Scrum.org',
                date: '2020-03'
            }
        ],
        languages: [
            {
                language: 'English',
                proficiency: 'Native'
            },
            {
                language: 'Spanish',
                proficiency: 'Intermediate'
            }
        ],
        additionalInfo: 'Conference speaker at JS Conf 2022\nContributor to open-source projects including React and Node.js'
    };
}

// Template generator functions
function generateProfessionalTemplateHtml(data) {
    console.log('Generating professional template with data:', data);
    
    // Ensure data has the expected structure
    if (!data) {
        console.error('No data provided to template generator');
        data = {};
    }
    
    if (!data.personal) {
        console.warn('No personal information provided, using defaults');
        data.personal = {
            name: 'Your Name',
            title: 'Professional Title',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: ''
        };
    }
    
    // Format dates nicely
    function formatDate(dateStr, current) {
        if (current || dateStr === 'Present') return 'Present';
        if (!dateStr) return '';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Return as is if not a valid date
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr; // If parsing fails, return the original string
        }
    }
    
    // Generate experience HTML
    const experienceHtml = data.experience && data.experience.length > 0 
        ? data.experience.map(job => `
            <div class="cv-item">
                <div class="cv-item-header">
                    <h3>${job.title || ''}</h3>
                    <p class="cv-date">${formatDate(job.startDate)} - ${formatDate(job.endDate)}</p>
                </div>
                <h4>${job.company || ''}</h4>
                <p>${job.description || ''}</p>
            </div>
        `).join('')
        : '<p>No experience added</p>';
    
    // Generate education HTML
    const educationHtml = data.education && data.education.length > 0 
        ? data.education.map(edu => `
            <div class="cv-item">
                <div class="cv-item-header">
                    <h3>${edu.degree || ''}</h3>
                    <p class="cv-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                </div>
                <h4>${edu.institution || ''}</h4>
                <p>${edu.description || ''}</p>
            </div>
        `).join('')
        : '<p>No education added</p>';
    
    // Generate skills HTML
    const skillsHtml = data.skills && data.skills.length > 0 
        ? data.skills.map(skill => `
            <div class="skill-tag">${skill}</div>
        `).join('')
        : '<p>No skills added</p>';
    
    // Generate certifications HTML
    const certificationsHtml = data.certifications && data.certifications.length > 0 
        ? data.certifications.map(cert => `
            <div class="cv-item">
                <div class="cv-item-header">
                    <h3>${cert.name || ''}</h3>
                    <p class="cv-date">${formatDate(cert.date)}${cert.expiryDate ? ' - ' + formatDate(cert.expiryDate) : ''}</p>
                </div>
                <h4>${cert.organization || ''}</h4>
            </div>
        `).join('')
        : '<p>No certifications added</p>';
    
    // Generate languages HTML
    const languagesHtml = data.languages && data.languages.length > 0 
        ? data.languages.map(lang => `
            <div class="language-item">
                <span class="language-name">${lang.language || ''}</span>
                <span class="language-level">${lang.proficiency || ''}</span>
            </div>
        `).join('')
        : '<p>No languages added</p>';
    
    // Format additional info with line breaks
    const additionalHtml = data.additionalInfo ? data.additionalInfo.replace(/\n/g, '<br>') : '';
    
    // Generate the complete template
    return `
        <div class="cv-document professional-template">
            <div class="cv-header">
                <h1 class="cv-name">${data.personal.name}</h1>
                <div class="cv-contact-info">
                    ${data.personal.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i> ${data.personal.email}</div>` : ''}
                    ${data.personal.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i> ${data.personal.phone}</div>` : ''}
                    ${data.personal.location ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i> ${data.personal.location}</div>` : ''}
                    ${data.personal.linkedin ? `<div class="cv-contact-item"><i class="fab fa-linkedin"></i> ${data.personal.linkedin}</div>` : ''}
                    ${data.personal.portfolio ? `<div class="cv-contact-item"><i class="fas fa-globe"></i> ${data.personal.portfolio}</div>` : ''}
                </div>
            </div>
            
            <div class="cv-section">
                <h2 class="cv-section-title">Professional Summary</h2>
                <div class="cv-section-content">
                    <p>${data.summary || 'No summary provided'}</p>
                </div>
            </div>
            
            <div class="cv-section">
                <h2 class="cv-section-title">Experience</h2>
                <div class="cv-section-content">
                    ${experienceHtml}
                </div>
            </div>
            
            <div class="cv-section">
                <h2 class="cv-section-title">Education</h2>
                <div class="cv-section-content">
                    ${educationHtml}
                </div>
            </div>
            
            <div class="cv-section">
                <h2 class="cv-section-title">Skills</h2>
                <div class="cv-section-content">
                    <div class="skills-container">
                        ${skillsHtml}
                    </div>
                </div>
            </div>
            
            ${data.certifications && data.certifications.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Certifications</h2>
                    <div class="cv-section-content">
                        ${certificationsHtml}
                    </div>
                </div>
            ` : ''}
            
            ${data.languages && data.languages.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Languages</h2>
                    <div class="cv-section-content">
                        <div class="languages-container">
                            ${languagesHtml}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${additionalHtml ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Additional Information</h2>
                    <div class="cv-section-content">
                        <p>${additionalHtml}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function generateModernTemplateHtml(data) {
    console.log('Generating modern template with data:', data);
    
    // Ensure data has the expected structure
    if (!data) {
        console.error('No data provided to template generator');
        data = {};
    }
    
    if (!data.personal) {
        console.warn('No personal information provided, using defaults');
        data.personal = {
            name: 'Your Name',
            title: 'Professional Position',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: ''
        };
    }
    
    // Format dates nicely
    function formatDate(dateStr) {
        if (!dateStr || dateStr === 'Present') return 'Present';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr;
        }
    }
    
    // Generate a simplified modern template
    return `
        <div class="cv-document modern-template">
            <div class="modern-header">
                <h1 class="cv-name">${data.personal.name || 'Your Name'}</h1>
                <p class="cv-title">${data.personal.title || 'Professional Position'}</p>
                <div class="cv-contact">
                    ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
                </div>
            </div>
            
            <div class="modern-body">
                <div class="modern-sidebar">
                    <div class="sidebar-section">
                        <h2>Skills</h2>
                        <ul>
                            ${data.skills && data.skills.map(skill => `<li>${skill}</li>`).join('') || '<li>No skills added yet</li>'}
                        </ul>
                    </div>
                    
                    ${data.languages && data.languages.length ? `
                        <div class="sidebar-section">
                            <h2>Languages</h2>
                            <ul>
                                ${data.languages.map(lang => `<li>${lang.language}: ${lang.proficiency}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${data.certifications && data.certifications.length ? `
                        <div class="sidebar-section">
                            <h2>Certifications</h2>
                            <ul>
                                ${data.certifications.map(cert => `<li>${cert.name}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="modern-main">
                    <div class="main-section">
                        <h2>Professional Summary</h2>
                        <p>${data.summary || 'Add a professional summary to highlight your key skills and experiences.'}</p>
                    </div>
                    
                    <div class="main-section">
                        <h2>Experience</h2>
                        ${data.experience && data.experience.length > 0 
                            ? data.experience.map(job => `
                                <div class="experience-item">
                                    <div class="item-header">
                                        <h3>${job.title || ''}</h3>
                                        <span class="company">${job.company || ''}</span>
                                        <span class="date">${formatDate(job.startDate)} - ${formatDate(job.endDate)}</span>
                                    </div>
                                    <p>${job.description || ''}</p>
                                </div>
                            `).join('')
                            : '<p>No experience added yet</p>'
                        }
                    </div>
                    
                    <div class="main-section">
                        <h2>Education</h2>
                        ${data.education && data.education.length > 0
                            ? data.education.map(edu => `
                                <div class="education-item">
                                    <div class="item-header">
                                        <h3>${edu.degree || ''}</h3>
                                        <span class="institution">${edu.institution || ''}</span>
                                        <span class="date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
                                    </div>
                                    <p>${edu.description || ''}</p>
                                </div>
                            `).join('')
                            : '<p>No education added yet</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateExecutiveTemplateHtml(data) {
    console.log('Generating executive template with data:', data);
    
    // Ensure data has the expected structure
    if (!data) {
        console.error('No data provided to template generator');
        data = {};
    }
    
    if (!data.personal) {
        console.warn('No personal information provided, using defaults');
        data.personal = {
            name: 'Your Name',
            title: 'Executive Professional',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: ''
        };
    }
    
    // Format dates nicely
    function formatDate(dateStr) {
        if (!dateStr || dateStr === 'Present') return 'Present';
        
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr;
        }
    }
    
    // Generate a simplified executive template
    return `
        <div class="cv-document executive-template">
            <div class="executive-header">
                <h1 class="cv-name">${data.personal.name || 'Your Name'}</h1>
                <p class="cv-title">${data.personal.title || 'Executive Professional'}</p>
                <div class="cv-contact">
                    ${data.personal.email ? `<span>${data.personal.email}</span>` : ''}
                    ${data.personal.phone ? `<span>${data.personal.phone}</span>` : ''}
                    ${data.personal.location ? `<span>${data.personal.location}</span>` : ''}
                </div>
            </div>
            
            <div class="executive-summary">
                <h2>Executive Summary</h2>
                <p>${data.summary || 'Add a professional summary to highlight your key skills and leadership experience.'}</p>
            </div>
            
            <div class="executive-experience">
                <h2>Professional Experience</h2>
                ${data.experience && data.experience.length > 0 
                    ? data.experience.map(job => `
                        <div class="experience-item">
                            <div class="item-header">
                                <h3>${job.title || ''} at ${job.company || ''}</h3>
                                <span class="date">${formatDate(job.startDate)} - ${formatDate(job.endDate)}</span>
                            </div>
                            <p>${job.description || ''}</p>
                        </div>
                    `).join('')
                    : '<p>No experience added yet</p>'
                }
            </div>
            
            <div class="executive-education">
                <h2>Education</h2>
                ${data.education && data.education.length > 0
                    ? data.education.map(edu => `
                        <div class="education-item">
                            <h3>${edu.degree || ''}</h3>
                            <p>${edu.institution || ''}, ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                        </div>
                    `).join('')
                    : '<p>No education added yet</p>'
                }
            </div>
            
            <div class="executive-skills">
                <h2>Core Competencies</h2>
                <div class="skills-grid">
                    ${data.skills && data.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('') || '<p>No skills added yet</p>'}
                </div>
            </div>
            
            ${data.certifications && data.certifications.length ? `
                <div class="executive-certifications">
                    <h2>Certifications</h2>
                    <ul>
                        ${data.certifications.map(cert => `<li>${cert.name} (${cert.issuer})</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
}

// Initialize section handlers for adding items
function initSectionHandlers() {
    console.log('Initializing section handlers from editor.js');
    
    // Add Experience button handler
    $('#addExperience').on('click', function() {
        console.log('Add Experience button clicked');
        const expCount = $('.experience-item').length + 1;
        
        const newExperience = $(`
            <div class="experience-item">
                <div class="item-header">
                    <h3>Experience #${expCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Job Title</label>
                        <input type="text" class="form-control job-title">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" class="form-control company-name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="month" class="form-control start-date">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="month" class="form-control end-date">
                        <div class="checkbox-group">
                            <input type="checkbox" id="currentJob${expCount}" class="current-job">
                            <label for="currentJob${expCount}">I currently work here</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <div class="editor-actions">
                        <div class="toggle-container">
                            <button class="btn btn-tab active" data-target="original-exp-${expCount}">Original</button>
                            <button class="btn btn-tab" data-target="enhanced-exp-${expCount}">AI Enhanced</button>
                        </div>
                    </div>
                    <div class="content-container active" id="original-exp-${expCount}">
                        <textarea class="form-control job-description" rows="4" placeholder="Describe your responsibilities and achievements..."></textarea>
                    </div>
                    <div class="content-container" id="enhanced-exp-${expCount}">
                        <div class="ai-suggestion">
                            <div class="suggestion-header">
                                <span class="ai-badge"><i class="fas fa-robot"></i> AI Enhanced</span>
                                <div class="suggestion-actions">
                                    <button class="btn btn-small btn-accept"><i class="fas fa-check"></i> Accept</button>
                                    <button class="btn btn-small btn-edit"><i class="fas fa-pen"></i> Edit</button>
                                </div>
                            </div>
                            <div class="suggestion-content enhanced-description">
                                <!-- This will be filled by AI -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Add event listeners to the new experience
        newExperience.find('.current-job').on('change', function() {
            const endDateInput = $(this).closest('.form-group').find('.end-date');
            endDateInput.prop('disabled', this.checked);
            if (this.checked) endDateInput.val('');
        });
        
        newExperience.find('.btn-remove').on('click', function() {
            newExperience.remove();
            updateExperienceTitles();
        });
        
        // Add to DOM
        $('#experienceItems').append(newExperience);
    });
    
    // Add Education button handler
    $('#addEducation').on('click', function() {
        console.log('Add Education button clicked');
        const eduCount = $('.education-item').length + 1;
        
        const newEducation = $(`
            <div class="education-item">
                <div class="item-header">
                    <h3>Education #${eduCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Degree</label>
                        <input type="text" class="form-control degree">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" class="form-control institution">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="month" class="form-control edu-start-date">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="month" class="form-control edu-end-date">
                        <div class="checkbox-group">
                            <input type="checkbox" id="currentEdu${eduCount}" class="current-edu">
                            <label for="currentEdu${eduCount}">I'm currently studying here</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description (Optional)</label>
                    <textarea class="form-control edu-description" rows="2" placeholder="Relevant coursework, achievements, etc."></textarea>
                </div>
            </div>
        `);
        
        // Add event listeners to the new education
        newEducation.find('.current-edu').on('change', function() {
            const endDateInput = $(this).closest('.form-group').find('.edu-end-date');
            endDateInput.prop('disabled', this.checked);
            if (this.checked) endDateInput.val('');
        });
        
        newEducation.find('.btn-remove').on('click', function() {
            newEducation.remove();
            updateEducationTitles();
        });
        
        // Add to DOM
        $('#educationItems').append(newEducation);
    });
    
    // Add Certification button handler
    $('#addCertification').on('click', function() {
        console.log('Add Certification button clicked');
        const certCount = $('.certification-item').length + 1;
        
        const newCertification = $(`
            <div class="certification-item">
                <div class="item-header">
                    <h3>Certification #${certCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Certification Name</label>
                        <input type="text" class="form-control cert-name">
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" class="form-control cert-org">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="month" class="form-control cert-date">
                    </div>
                    <div class="form-group">
                        <label>Expiration Date (Optional)</label>
                        <input type="month" class="form-control cert-expiry">
                        <div class="checkbox-group">
                            <input type="checkbox" id="noCertExpiry${certCount}" class="no-expiry">
                            <label for="noCertExpiry${certCount}">No expiration date</label>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Add event listeners to the new certification
        newCertification.find('.no-expiry').on('change', function() {
            const expiryInput = $(this).closest('.form-group').find('.cert-expiry');
            expiryInput.prop('disabled', this.checked);
            if (this.checked) expiryInput.val('');
        });
        
        newCertification.find('.btn-remove').on('click', function() {
            newCertification.remove();
            updateCertificationTitles();
        });
        
        // Add to DOM
        $('#certificationItems').append(newCertification);
    });
    
    // Add Language button handler
    $('#addLanguage').on('click', function() {
        console.log('Add Language button clicked');
        const langCount = $('.language-item').length + 1;
        
        const newLanguage = $(`
            <div class="language-item">
                <div class="item-header">
                    <h3>Language #${langCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Language</label>
                        <input type="text" class="form-control language-name">
                    </div>
                    <div class="form-group">
                        <label>Proficiency Level</label>
                        <select class="form-control proficiency-level">
                            <option value="Native">Native</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Basic">Basic</option>
                        </select>
                    </div>
                </div>
            </div>
        `);
        
        // Add event listeners to the new language
        newLanguage.find('.btn-remove').on('click', function() {
            newLanguage.remove();
            updateLanguageTitles();
        });
        
        // Add to DOM
        $('#languageItems').append(newLanguage);
    });
    
    // Helper functions to update section titles
    function updateExperienceTitles() {
        $('.experience-item').each(function(index) {
            $(this).find('h3').text(`Experience #${index + 1}`);
        });
    }
    
    function updateEducationTitles() {
        $('.education-item').each(function(index) {
            $(this).find('h3').text(`Education #${index + 1}`);
        });
    }
    
    function updateCertificationTitles() {
        $('.certification-item').each(function(index) {
            $(this).find('h3').text(`Certification #${index + 1}`);
        });
    }
    
    function updateLanguageTitles() {
        $('.language-item').each(function(index) {
            $(this).find('h3').text(`Language #${index + 1}`);
        });
    }
}

// Preview functionality
function showPreview() {
    console.log('Showing preview...');
    const cvData = collectCVData();
    console.log('CV Data for preview:', cvData);
    updatePreview(cvData);
    
    // Get the preview panel and show it
    const previewPanel = document.getElementById('previewPanel');
    if (previewPanel) {
        previewPanel.style.display = 'flex';
        previewPanel.classList.add('active');
        console.log('Preview panel displayed:', previewPanel.style.display);
    } else {
        console.error('Preview panel not found!');
    }
}

function closePreview() {
    console.log('Closing preview');
    const previewPanel = document.getElementById('previewPanel');
    if (previewPanel) {
        previewPanel.style.display = 'none';
        previewPanel.classList.remove('active');
        console.log('Preview panel hidden');
    } else {
        console.error('Preview panel not found!');
    }
}

function updatePreview(cvData) {
    try {
        console.log('Updating preview with data:', cvData);
        
        if (!cvData) {
            console.error('No CV data provided for preview');
            cvData = getSampleCVData();
            console.log('Using sample data instead:', cvData);
        }
        
        // Get selected template
        const templateSelector = document.querySelector('.template-option.active');
        console.log('Template selector:', templateSelector);
        
        const selectedTemplate = templateSelector ? 
            templateSelector.getAttribute('data-template') : 'professional';
        console.log('Selected template:', selectedTemplate);
        
        const paperSize = document.getElementById('paperSize')?.value || 'a4';
        console.log('Paper size:', paperSize);
        
        // Get the preview iframe
        const previewFrame = document.getElementById('previewFrame');
        if (!previewFrame) {
            console.error('Preview frame not found');
            return;
        }
        
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        if (!frameDoc) {
            console.error('Unable to access iframe document');
            return;
        }
        
        // Generate the HTML based on selected template
        let templateHtml = '';
        try {
            switch (selectedTemplate) {
                case 'professional':
                    templateHtml = generateProfessionalTemplateHtml(cvData);
                    break;
                case 'modern':
                    templateHtml = generateModernTemplateHtml(cvData);
                    break;
                case 'executive':
                    templateHtml = generateExecutiveTemplateHtml(cvData);
                    break;
                default:
                    console.log('Using default professional template');
                    templateHtml = generateProfessionalTemplateHtml(cvData);
            }
        } catch (templateError) {
            console.error('Error generating template:', templateError);
            templateHtml = `<div style="padding: 20px; color: red;">
                <h2>Error generating template</h2>
                <p>${templateError.message}</p>
                <p>Please try a different template or refresh the page.</p>
            </div>`;
        }
        
        console.log('Generated template HTML length:', templateHtml.length);
        
        // Update iframe content
        try {
            frameDoc.open();
            frameDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>CV Preview</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            box-sizing: border-box;
                            background-color: white;
                        }
                        
                        /* Common template styles */
                        .cv-container {
                            max-width: 100%;
                            margin: 0 auto;
                        }
                        
                        .section {
                            margin-bottom: 20px;
                        }
                        
                        .section-title {
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        
                        /* Size-specific styles */
                        @media print {
                            body {
                                width: ${paperSize === 'a4' ? '210mm' : paperSize === 'letter' ? '216mm' : '216mm'};
                                height: ${paperSize === 'a4' ? '297mm' : paperSize === 'letter' ? '279mm' : '356mm'};
                            }
                        }
                        
                        /* Add template-specific styles here based on selected template */
                        ${selectedTemplate === 'professional' ? `
                            .cv-header {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            .cv-name {
                                font-size: 24px;
                                font-weight: bold;
                                margin-bottom: 5px;
                            }
                            .cv-contact {
                                font-size: 14px;
                            }
                            .section-title {
                                color: #2c3e50;
                                border-bottom: 2px solid #3498db;
                                padding-bottom: 5px;
                            }
                            .item-title {
                                font-weight: bold;
                            }
                            .item-subtitle {
                                font-style: italic;
                            }
                            .item-date {
                                color: #7f8c8d;
                            }
                        ` : selectedTemplate === 'modern' ? `
                            .cv-container {
                                display: grid;
                                grid-template-columns: 1fr 2fr;
                                gap: 20px;
                            }
                            .cv-sidebar {
                                background-color: #f5f5f5;
                                padding: 20px;
                            }
                            .cv-main {
                                padding: 20px;
                            }
                            .cv-name {
                                font-size: 28px;
                                margin-bottom: 10px;
                                color: #2980b9;
                            }
                            .cv-title {
                                font-size: 18px;
                                color: #7f8c8d;
                                margin-bottom: 20px;
                            }
                            .section-title {
                                color: #2980b9;
                                font-size: 18px;
                            }
                            .item-title {
                                font-weight: bold;
                            }
                            .item-subtitle {
                                color: #7f8c8d;
                            }
                        ` : `
                            .cv-header {
                                border-bottom: 3px solid #2c3e50;
                                padding-bottom: 15px;
                                margin-bottom: 25px;
                            }
                            .cv-name {
                                font-size: 28px;
                                font-weight: bold;
                                color: #2c3e50;
                            }
                            .cv-title {
                                font-size: 18px;
                                color: #34495e;
                            }
                            .section-title {
                                color: #2c3e50;
                                font-size: 18px;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                            }
                            .item-title {
                                font-weight: bold;
                            }
                            .item-subtitle {
                                font-weight: bold;
                                color: #34495e;
                            }
                            .item-date {
                                font-style: italic;
                            }
                        `}
                        
                        /* Additional styles for the modern template */
                        .modern-template .modern-header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #3498db;
                        }
                        
                        .modern-template .cv-contact {
                            display: flex;
                            justify-content: center;
                            gap: 15px;
                            margin-top: 10px;
                        }
                        
                        .modern-template .modern-body {
                            display: flex;
                            gap: 30px;
                        }
                        
                        .modern-template .modern-sidebar {
                            flex: 1;
                            background-color: #f5f5f5;
                            padding: 20px;
                            border-radius: 5px;
                        }
                        
                        .modern-template .modern-main {
                            flex: 2;
                        }
                        
                        .modern-template .sidebar-section,
                        .modern-template .main-section {
                            margin-bottom: 25px;
                        }
                        
                        .modern-template h2 {
                            color: #2980b9;
                            margin-bottom: 15px;
                            border-bottom: 1px solid #e0e0e0;
                            padding-bottom: 5px;
                        }
                        
                        /* Additional styles for the executive template */
                        .executive-template {
                            font-family: 'Times New Roman', Times, serif;
                        }
                        
                        .executive-template .executive-header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px double #000;
                            padding-bottom: 20px;
                        }
                        
                        .executive-template h2 {
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-top: 25px;
                            margin-bottom: 15px;
                        }
                        
                        .executive-template .skills-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                        }
                        
                        .executive-template .skill-item {
                            background-color: #f9f9f9;
                            padding: 8px 12px;
                            border-radius: 4px;
                        }
                    </style>
                </head>
                <body>
                    ${templateHtml}
                </body>
                </html>
            `);
            frameDoc.close();
        } catch (writeError) {
            console.error('Error writing to iframe:', writeError);
            alert('Failed to update preview. Please try again.');
        }
        
        // Update frame class for proper sizing
        if (previewFrame.className) {
            previewFrame.className = previewFrame.className.replace(/\b(a4|letter|legal)\b/g, '') + ' ' + paperSize;
        } else {
            previewFrame.className = 'preview-frame ' + paperSize;
        }
    } catch (error) {
        console.error('Error in updatePreview:', error);
        alert('An error occurred while updating the preview. Please try again.');
    }
}

function collectCVData() {
    console.log('Collecting CV data...');
    
    // Check if user has entered any data
    const experienceItems = document.querySelectorAll('.experience-item');
    const educationItems = document.querySelectorAll('.education-item');
    const certificationItems = document.querySelectorAll('.certification-item');
    const languageItems = document.querySelectorAll('.language-item');
    
    // Check if full name has been entered
    const hasName = document.getElementById('fullName')?.value;
    
    // If no significant user data entered, use sample data
    if (!hasName && 
        experienceItems.length <= 1 && 
        educationItems.length <= 1 && 
        certificationItems.length <= 1 && 
        languageItems.length <= 1) {
        console.log('Minimal user data found, using sample data');
        return getSampleCVData();
    }
    
    console.log('User data found, collecting from form');
    
    // Safely get element value with fallback
    const safeGetValue = (element, selector, fallback) => {
        if (!element) return fallback;
        const el = element.querySelector(selector);
        return el ? el.value || fallback : fallback;
    };
    
    // Safely check if checkbox is checked
    const safeIsChecked = (element, selector) => {
        if (!element) return false;
        const el = element.querySelector(selector);
        return el ? el.checked : false;
    };
    
    // Collect actual user data from the form
    const data = {
        personal: {
            name: document.getElementById('fullName')?.value || 'Your Name',
            title: document.getElementById('position')?.value || 'Professional Title',
            email: document.getElementById('email')?.value || 'email@example.com',
            phone: document.getElementById('phone')?.value || '+1 (123) 456-7890',
            location: document.getElementById('location')?.value || 'City, Country',
            website: document.getElementById('portfolio')?.value || 'www.yourwebsite.com',
            linkedin: document.getElementById('linkedin')?.value || 'linkedin.com/in/yourprofile'
        },
        summary: document.getElementById('professionalSummary')?.value || 'Professional summary highlighting your experience and skills.',
        experience: [],
        education: [],
        skills: document.getElementById('skillInput')?.value 
            ? [document.getElementById('skillInput').value] 
            : ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
        certifications: [],
        languages: [],
        additionalInfo: document.getElementById('additionalInfo')?.value || ''
    };
    
    console.log('Collected personal info:', data.personal);
    
    // If there are no experience items, add a sample one
    if (experienceItems.length === 0) {
        data.experience.push({
            title: 'Job Title',
            company: 'Company Name',
            startDate: 'Jan 2020',
            endDate: 'Present',
            description: 'Job responsibilities and achievements.'
        });
    } else {
        // Collect experience items
        experienceItems.forEach(item => {
            data.experience.push({
                title: safeGetValue(item, '.job-title', 'Job Title'),
                company: safeGetValue(item, '.company-name', 'Company Name'),
                startDate: safeGetValue(item, '.start-date', 'Jan 2020'),
                endDate: safeIsChecked(item, '.current-job') ? 'Present' : 
                        safeGetValue(item, '.end-date', 'Present'),
                description: safeGetValue(item, '.job-description', 'Job responsibilities and achievements.')
            });
        });
    }
    
    // If there are no education items, add a sample one
    if (educationItems.length === 0) {
        data.education.push({
            degree: 'Degree',
            institution: 'Institution Name',
            startDate: 'Jan 2016',
            endDate: 'Dec 2020',
            description: 'Education details and achievements.'
        });
    } else {
        // Collect education items
        educationItems.forEach(item => {
            data.education.push({
                degree: safeGetValue(item, '.degree', 'Degree'),
                institution: safeGetValue(item, '.institution', 'Institution Name'),
                startDate: safeGetValue(item, '.edu-start-date', 'Jan 2016'),
                endDate: safeIsChecked(item, '.current-edu') ? 'Present' : 
                        safeGetValue(item, '.edu-end-date', 'Present'),
                description: safeGetValue(item, '.edu-description', 'Education details and achievements.')
            });
        });
    }
    
    // If there are no certification items, add a sample one
    if (certificationItems.length === 0) {
        data.certifications.push({
            name: 'Certification Name',
            issuer: 'Issuing Organization',
            date: 'Jan 2022'
        });
    } else {
        // Collect certification items
        certificationItems.forEach(item => {
            data.certifications.push({
                name: safeGetValue(item, '.cert-name', 'Certification Name'),
                issuer: safeGetValue(item, '.cert-org', 'Issuing Organization'),
                date: safeGetValue(item, '.cert-date', 'Jan 2022'),
                expiryDate: safeIsChecked(item, '.no-expiry') ? null : 
                            safeGetValue(item, '.cert-expiry', '')
            });
        });
    }
    
    // If there are no language items, add a sample one
    if (languageItems.length === 0) {
        data.languages.push({
            language: 'English',
            proficiency: 'Native'
        });
    } else {
        // Collect language items
        languageItems.forEach(item => {
            data.languages.push({
                language: safeGetValue(item, '.language-name', 'Language'),
                proficiency: safeGetValue(item, '.proficiency-level', 'Proficient')
            });
        });
    }
    
    console.log('Collected complete data:', data);
    return data;
}

function downloadCV() {
    console.log('Downloading CV...');
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    const previewFrame = document.getElementById('previewFrame');
    const frameWindow = previewFrame.contentWindow;
    
    try {
        // Use html2pdf library if available
        if (frameWindow.html2pdf) {
            const element = frameWindow.document.body;
            const opt = {
                margin:       [0.5, 0.5, 0.5, 0.5],
                filename:     'my-cv.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            frameWindow.html2pdf().set(opt).from(element).save().then(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
            });
        } else {
            // Fallback to window.print
            frameWindow.print();
            document.getElementById('loadingOverlay').style.display = 'none';
        }
    } catch (error) {
        console.error('Error downloading CV:', error);
        alert('Could not download CV. Please try again.');
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

// Initialize templates
function initTemplateSelection() {
    console.log('Initializing template selection');
    
    const templateOptions = document.querySelectorAll('.template-option');
    console.log('Found template options:', templateOptions.length);
    
    templateOptions.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Template option clicked:', this.getAttribute('data-template'));
            
            // Remove active class from all templates
            templateOptions.forEach(template => template.classList.remove('active'));
            
            // Add active class to selected template
            this.classList.add('active');
            
            // Update preview if it's open
            if (document.getElementById('previewPanel').style.display === 'flex') {
                console.log('Preview is open, updating with new template');
                const cvData = collectCVData();
                updatePreview(cvData);
            }
        });
    });
    
    // Set first template as active by default
    if (templateOptions.length > 0 && !document.querySelector('.template-option.active')) {
        console.log('Setting first template as active by default');
        templateOptions[0].classList.add('active');
    }
}

// Initialize preview controls
function initPreviewControls() {
    // Paper size change handler
    document.getElementById('paperSize').addEventListener('change', function() {
        const cvData = collectCVData();
        updatePreview(cvData);
    });
    
    // Preview button click
    document.getElementById('previewButton').addEventListener('click', showPreview);
    
    // Close preview button click
    document.getElementById('closePreview').addEventListener('click', closePreview);
    
    // Download button click
    document.getElementById('downloadFromPreview').addEventListener('click', downloadCV);
}

// Initialize the page when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document ready, initializing editor');
    initEditorPage();
});