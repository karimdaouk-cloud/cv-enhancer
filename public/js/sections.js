/**
 * CV Enhancer - Section Handlers
 * Manages CV sections like experience, education, certifications, and languages
 */

// Global function to be accessible from outside
    function populateEditorWithData(data) {
        if (!data) return;
    
    console.log('Populating editor with data:', data);
    
    // Ensure data has the expected structure
    if (!data.personal) {
        console.warn('Missing personal data, creating default structure');
        data.personal = {
            name: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: ''
        };
    }
        
        // Personal info
    $('#fullName').val(data.personal.name || '');
    $('#email').val(data.personal.email || '');
    $('#phone').val(data.personal.phone || '');
    $('#location').val(data.personal.location || '');
    $('#linkedin').val(data.personal.linkedin || '');
    $('#portfolio').val(data.personal.website || '');
        
        // Summary
        $('#professionalSummary').val(data.summary || '');
        $('#enhancedSummaryContent').text(
            'Results-driven Senior Developer with over 5 years of expertise in full-stack web development and mobile applications. ' +
            'Demonstrated proficiency in JavaScript, React, and Node.js with a proven track record of leading development teams to ' +
            'deliver high-quality, responsive web applications. Experienced in implementing CI/CD pipelines and improving code quality ' +
            'through comprehensive unit testing methodologies.'
        );
        
        // Lists of items (experience, education, certifications, languages)
        const itemsConfig = [
            { data: data.experience, container: '#experienceItems', createFn: createExperienceItemHtml, type: 'experience' },
            { data: data.education, container: '#educationItems', createFn: createEducationItemHtml, type: 'education' },
            { data: data.certifications, container: '#certificationItems', createFn: createCertificationItemHtml, type: 'certification' },
            { data: data.languages, container: '#languageItems', createFn: createLanguageItemHtml, type: 'language' }
        ];
        
        itemsConfig.forEach(config => {
            if (config.data && config.data.length > 0) {
                $(config.container).empty();
                
                config.data.forEach((item, index) => {
                    const element = config.createFn(index + 1, item);
                    $(config.container).append(element);
                attachItemHandlers($(element), config.type);
                });
            }
        });
        
        // Skills
        if (data.skills && data.skills.length > 0) {
            $('#skillTags').empty();
            
            data.skills.forEach(skill => {
                $('#skillTags').append(`
                    <div class="skill-tag">
                    <span>${skill}</span>
                    <button class="remove-skill" aria-label="Remove skill">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        });
        
        // Attach skill removal handlers
        attachSkillRemoveHandlers();
    }
    
    // Additional info
    $('#additionalInfo').val(data.additionalInfo || data.additional || '');
}

// Initialize section item handlers
function initSectionHandlers() {
    setupSectionItemHandlers();
    setupTabSwitching();
    attachSkillHandlers();
}

// Function to attach event handlers to skill removal buttons
function attachSkillRemoveHandlers() {
    $('#skillTags .remove-skill').off('click').on('click', function() {
        $(this).closest('.skill-tag').remove();
    });
}

// Function to set up skill input and handlers
function attachSkillHandlers() {
    // Add skill on button click
    $('#addSkillBtn').off('click').on('click', function() {
        const skillInput = $('#skillInput');
        const skillName = skillInput.val().trim();
        
        if (skillName) {
            addSkill(skillName);
            skillInput.val('').focus();
        }
    });
    
    // Add skill on Enter key
    $('#skillInput').off('keypress').on('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const skillName = $(this).val().trim();
            
            if (skillName) {
                addSkill(skillName);
                $(this).val('').focus();
            }
        }
    });
    
    // Handle existing skill remove buttons
    attachSkillRemoveHandlers();
    
    // Handle suggested skills
    $('.btn-add-suggestion').off('click').on('click', function() {
        const skillName = $(this).closest('.skill-suggestion').find('span').text().trim();
        addSkill(skillName);
        $(this).closest('.skill-suggestion').remove();
    });
}

// Function to add a skill
function addSkill(skillName) {
    // Check if skill already exists
    const existingSkills = Array.from($('#skillTags .skill-tag span')).map(span => 
        $(span).text().toLowerCase()
    );
    
    if (existingSkills.includes(skillName.toLowerCase())) {
        // Show toast notification if available
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
    
    $('#skillTags').append(skillTag);
    
    // Attach remove handler
    skillTag.find('.remove-skill').on('click', function() {
        skillTag.remove();
    });
}

// Function to set up tab switching between original and enhanced content
function setupTabSwitching() {
    $('.btn-tab').off('click').on('click', function() {
        const targetId = $(this).data('target');
        const parent = $(this).closest('.form-group');
        
        if (parent.length) {
            // Remove active class from all buttons and content containers
            parent.find('.btn-tab').removeClass('active');
            parent.find('.content-container').removeClass('active');
            
            // Add active class to clicked button and corresponding content
            $(this).addClass('active');
            parent.find(`#${targetId}`).addClass('active');
        }
    });
    
    // Setup accept buttons for AI suggestions
    $('.btn-accept').off('click').on('click', function() {
        const suggestionContent = $(this).closest('.ai-suggestion').find('.suggestion-content').text();
        const section = $(this).closest('.section-container');
        const textarea = section.find('textarea');
        
        if (suggestionContent && textarea.length) {
            textarea.val(suggestionContent);
            
            // Switch back to original tab
            const originalTab = section.find('.btn-tab[data-target*="original"]');
            if (originalTab.length) {
                originalTab.trigger('click');
            }
            
            // Show toast notification if available
            if (window.CVEnhancer && window.CVEnhancer.showToast) {
                window.CVEnhancer.showToast('AI suggestion applied!', 'success');
            }
        }
    });
}

// Set up handlers for adding/removing/editing section items
function setupSectionItemHandlers() {
    // Add section items
    const sectionConfig = {
        experience: { container: '#experienceItems', createFn: createExperienceItemHtml },
        education: { container: '#educationItems', createFn: createEducationItemHtml },
        certification: { container: '#certificationItems', createFn: createCertificationItemHtml },
        language: { container: '#languageItems', createFn: createLanguageItemHtml }
    };
    
    // Setup add buttons for each section
    Object.keys(sectionConfig).forEach(type => {
        $(`#add${type.charAt(0).toUpperCase() + type.slice(1)}`).off('click').on('click', function() {
            const count = $(`.${type}-item`).length + 1;
            const newItem = $(sectionConfig[type].createFn(count));
            $(sectionConfig[type].container).append(newItem);
            attachItemHandlers(newItem, type);
            
            // Also attach tab switching if it's an experience item (which has tabs)
            if (type === 'experience') {
                newItem.find('.btn-tab').each(function() {
                    $(this).on('click', function() {
                        const targetId = $(this).data('target');
                        const parent = $(this).closest('.form-group');
                        
                        if (parent.length) {
                            parent.find('.btn-tab').removeClass('active');
                            parent.find('.content-container').removeClass('active');
                            $(this).addClass('active');
                            parent.find(`#${targetId}`).addClass('active');
                        }
                    });
                });
            }
        });
    });
    
    // Attach handlers to existing items
    Object.keys(sectionConfig).forEach(type => {
        $(`.${type}-item`).each(function() {
            attachItemHandlers($(this), type);
        });
    });
}

// Handler for section items
function attachItemHandlers(item, type) {
    // Remove item button
    item.find('.btn-remove').off('click').on('click', function() {
        const itemClass = `.${type}-item`;
        
        if ($(itemClass).length > 1) {
            $(this).closest(itemClass).remove();
            
            // Renumber remaining items
            $(itemClass).each(function(index) {
                $(this).find('h3').text(`${type.charAt(0).toUpperCase() + type.slice(1)} #${index + 1}`);
            });
        } else {
            // Show toast notification if available
            if (window.CVEnhancer && window.CVEnhancer.showToast) {
                window.CVEnhancer.showToast(`You need at least one ${type} item.`, 'warning');
            } else {
                alert(`You need at least one ${type} item.`);
            }
        }
    });
    
    // Handle checkboxes specific to each type
    const checkboxConfig = {
        experience: { checkbox: '.current-job', field: '.end-date' },
        education: { checkbox: '.current-edu', field: '.edu-end-date' },
        certification: { checkbox: '.no-expiry', field: '.cert-expiry' }
    };
    
    if (checkboxConfig[type]) {
        item.find(checkboxConfig[type].checkbox).off('change').on('change', function() {
            const endDateField = item.find(checkboxConfig[type].field);
            endDateField.prop('disabled', this.checked);
            if (this.checked) {
                endDateField.val('');
            }
        });
        
        // Initialize disabled state based on checkbox
        const checkbox = item.find(checkboxConfig[type].checkbox);
        if (checkbox.length && checkbox.prop('checked')) {
            item.find(checkboxConfig[type].field).prop('disabled', true);
        }
    }
}

// Experience item template
function createExperienceItemHtml(number, data = {}) {
    const originalId = 'original-exp-' + number;
    const enhancedId = 'enhanced-exp-' + number;
    const checkboxId = 'currentJob' + number;
    
    let enhancedDescription = number === 1 ?
        'Provided technical leadership for a team of 5 developers, implementing Agile methodologies that increased delivery speed by 30%. Architected and deployed responsive web applications with React and Node.js, resulting in a 25% improvement in user engagement. Established robust CI/CD pipelines that reduced deployment time by 40% and implemented comprehensive unit testing that decreased production bugs by 60%.' :
        'Designed and developed reusable React components that improved development efficiency by 20%. Collaborated closely with UX/UI designers to implement pixel-perfect responsive designs across mobile and desktop platforms. Optimized frontend performance, achieving a 35% reduction in load time and improving user experience metrics by 15%.';
    
    return `
        <div class="experience-item">
            <div class="item-header">
                <h3>Experience #${number}</h3>
                <div class="item-actions">
                    <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                    <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" class="form-control job-title" value="${data.title || ''}">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" class="form-control company-name" value="${data.company || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" class="form-control start-date" value="${data.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="month" class="form-control end-date" value="${data.endDate || ''}" ${data.current ? 'disabled' : ''}>
                    <div class="checkbox-group">
                        <input type="checkbox" id="${checkboxId}" class="current-job" ${data.current ? 'checked' : ''}>
                        <label for="${checkboxId}">I currently work here</label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <div class="editor-actions">
                    <div class="toggle-container">
                        <button class="btn btn-tab active" data-target="${originalId}">Original</button>
                        <button class="btn btn-tab" data-target="${enhancedId}">AI Enhanced</button>
                    </div>
                </div>
                <div class="content-container active" id="${originalId}">
                    <textarea class="form-control job-description" rows="4" placeholder="Describe your responsibilities and achievements...">${data.description || ''}</textarea>
                </div>
                <div class="content-container" id="${enhancedId}">
                    <div class="ai-suggestion">
                        <div class="suggestion-header">
                            <span class="ai-badge"><i class="fas fa-robot"></i> AI Enhanced</span>
                            <div class="suggestion-actions">
                                <button class="btn btn-small btn-accept"><i class="fas fa-check"></i> Accept</button>
                                <button class="btn btn-small btn-edit"><i class="fas fa-pen"></i> Edit</button>
                            </div>
                        </div>
                        <div class="suggestion-content enhanced-description">
                            ${enhancedDescription}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Education item template
function createEducationItemHtml(number, data = {}) {
    const checkboxId = 'currentEdu' + number;
    
    return `
        <div class="education-item">
            <div class="item-header">
                <h3>Education #${number}</h3>
                <div class="item-actions">
                    <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                    <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                </div>
                    </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" class="form-control degree" value="${data.degree || ''}">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="form-control institution" value="${data.institution || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" class="form-control edu-start-date" value="${data.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="month" class="form-control edu-end-date" value="${data.endDate || ''}" ${data.current ? 'disabled' : ''}>
                    <div class="checkbox-group">
                        <input type="checkbox" id="${checkboxId}" class="current-edu" ${data.current ? 'checked' : ''}>
                        <label for="${checkboxId}">I'm currently studying here</label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Description (Optional)</label>
                <textarea class="form-control edu-description" rows="2" placeholder="Relevant coursework, achievements, etc.">${data.description || ''}</textarea>
            </div>
        </div>
    `;
}

// Certification item template
function createCertificationItemHtml(number, data = {}) {
    const checkboxId = 'noCertExpiry' + number;
    
    return `
        <div class="certification-item">
            <div class="item-header">
                <h3>Certification #${number}</h3>
                <div class="item-actions">
                    <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                    <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Certification Name</label>
                    <input type="text" class="form-control cert-name" value="${data.name || ''}">
                </div>
                <div class="form-group">
                    <label>Issuing Organization</label>
                    <input type="text" class="form-control cert-org" value="${data.organization || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Issue Date</label>
                    <input type="month" class="form-control cert-date" value="${data.date || ''}">
                </div>
                <div class="form-group">
                    <label>Expiration Date (Optional)</label>
                    <input type="month" class="form-control cert-expiry" value="${data.expiry || ''}" ${data.noExpiry ? 'disabled' : ''}>
                    <div class="checkbox-group">
                        <input type="checkbox" id="${checkboxId}" class="no-expiry" ${data.noExpiry ? 'checked' : ''}>
                        <label for="${checkboxId}">No expiration date</label>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Language item template
function createLanguageItemHtml(number, data = {}) {
    return `
        <div class="language-item">
            <div class="item-header">
                <h3>Language #${number}</h3>
                <div class="item-actions">
                    <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                    <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Language</label>
                    <input type="text" class="form-control language-name" value="${data.name || ''}">
                </div>
                <div class="form-group">
                    <label>Proficiency Level</label>
                    <select class="form-control proficiency-level">
                        <option value="Native" ${data.level === 'Native' ? 'selected' : ''}>Native</option>
                        <option value="Fluent" ${data.level === 'Fluent' ? 'selected' : ''}>Fluent</option>
                        <option value="Advanced" ${data.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                        <option value="Intermediate" ${data.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                        <option value="Basic" ${data.level === 'Basic' ? 'selected' : ''}>Basic</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

// Export the section handlers to make them available to the main script
window.CVEnhancer = window.CVEnhancer || {};
window.CVEnhancer.sectionHandlers = {
    initSectionHandlers,
    populateEditorWithData,
    attachItemHandlers,
    attachSkillHandlers,
    addSkill
};

// Initialize when the document is ready
$(document).ready(function() {
    initSectionHandlers();
});