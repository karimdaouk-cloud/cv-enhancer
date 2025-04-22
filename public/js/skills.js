/**
 * CV Enhancer - Skills Management
 * Handles skills addition, removal, and suggestions
 */

// Initialize skills management
function initSkillsManagement() {
    // Add skill
    $('#addSkillBtn').on('click', addSkill);
    
    $('#skillInput').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            addSkill();
        }
    });
    
    // Remove skill
    $(document).on('click', '.remove-skill', function() {
        $(this).parent().remove();
    });
    
    // Add suggested skill
    $(document).on('click', '.btn-add-suggestion', function() {
        const skill = $(this).prev().text().trim();
        
        // Check if skill already exists
        const skillExists = [...$('.skill-tag')].some(tag => 
            $(tag).text().trim().replace('×', '') === skill
        );
        
        if (!skillExists) {
            $('#skillTags').append(`
                <div class="skill-tag">
                    ${skill}
                    <span class="remove-skill">×</span>
                </div>
            `);
            
            $(this).parent().fadeOut(300, function() {
                $(this).remove();
            });
        } else {
            alert('This skill is already in your list.');
        }
    });
    
    // Generate skill suggestions
    $('#generateSkillsBtn').on('click', function() {
        generateSkillSuggestions();
    });
}

// Add a skill from the input field
function addSkill() {
    const skill = $('#skillInput').val().trim();
    
    if (skill) {
        $('#skillTags').append(`
            <div class="skill-tag">
                ${skill}
                <span class="remove-skill">×</span>
            </div>
        `);
        
        $('#skillInput').val('');
    }
}

// Generate skill suggestions based on CV content
function generateSkillSuggestions() {
    // Default suggested skills
    const suggestedSkills = [
        'TypeScript', 'Docker', 'RESTful APIs', 'GraphQL', 
        'Agile Methodologies', 'CI/CD', 'Jest', 'Redux'
    ];
    
    $('#suggestedSkills').empty();
    
    // Filter out skills that are already added
    const currentSkills = [...$('.skill-tag')].map(tag => 
        $(tag).text().trim().replace('×', '').toLowerCase()
    );
    
    // Generate HTML for suggested skills
    suggestedSkills
        .filter(skill => !currentSkills.includes(skill.toLowerCase()))
        .forEach(skill => {
            $('#suggestedSkills').append(`
                <div class="skill-suggestion">
                    <span>${skill}</span>
                    <button class="btn btn-small btn-add-suggestion"><i class="fas fa-plus"></i></button>
                </div>
            `);
        });
}

// Get skills data from form
function getSkillsData() {
    return [...$('#skillTags .skill-tag')].map(tag => 
        $(tag).text().trim().replace('×', '')
    );
}