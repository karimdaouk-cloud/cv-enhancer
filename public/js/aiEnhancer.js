/**
 * CV Enhancer - AI Enhancement Module
 * Handles the AI enhancement of CV content
 */

// Initialize the AI enhancer module
(function() {
    // Sample professional keywords to improve content
    const professionalKeywords = {
        verbs: [
            'achieved', 'accomplished', 'delivered', 'managed', 'led', 'executed',
            'implemented', 'developed', 'created', 'designed', 'optimized', 'enhanced',
            'streamlined', 'coordinated', 'communicated', 'collaborated', 'directed',
            'initiated', 'facilitated', 'generated', 'transformed', 'resolved'
        ],
        weakPhrases: [
            'responsible for', 'duties included', 'worked on', 'helped with',
            'was tasked with', 'did', 'made', 'assisted', 'participated in'
        ],
        strongPhrases: [
            'spearheaded', 'successfully delivered', 'efficiently managed',
            'strategically implemented', 'effectively coordinated', 'pioneered',
            'orchestrated', 'championed', 'revolutionized', 'cultivated'
        ],
        measurementTerms: [
            'increased', 'decreased', 'reduced', 'improved', 'saved', 'generated',
            'accelerated', 'maximized', 'minimized', 'elevated', 'exceeded'
        ]
    };

    // Enhance text with more professional language
    function enhanceText(originalText) {
        if (!originalText || originalText.trim() === '') {
            return 'Please provide content to enhance.';
        }

        let enhancedText = originalText;

        // Replace weak phrases with stronger alternatives
        professionalKeywords.weakPhrases.forEach(phrase => {
            const randomIndex = Math.floor(Math.random() * professionalKeywords.strongPhrases.length);
            const replacement = professionalKeywords.strongPhrases[randomIndex];
            const regex = new RegExp('\\b' + phrase + '\\b', 'gi');
            enhancedText = enhancedText.replace(regex, replacement);
        });

        // Add measurable outcomes if they don't exist
        if (!/(increased|decreased|improved|reduced|by \d+%)/i.test(enhancedText)) {
            // Only suggest metrics if the text suggests a result
            if (/result|outcome|impact/i.test(enhancedText)) {
                enhancedText += ' This resulted in a significant improvement in efficiency and productivity.';
            }
        }

        // Ensure quantifiable results are included
        if (!/\d+%|\d+ percent/i.test(enhancedText) && /improved|increased|reduced|decreased/i.test(enhancedText)) {
            // Replace general statements with quantified ones
            enhancedText = enhancedText.replace(
                /(improved|increased|reduced|decreased)(\s+)(\w+)/gi,
                (match, verb, space, noun) => `${verb}${space}${noun} by approximately 25%`
            );
        }

        return enhancedText;
    }

    // Enhance skills with more marketable alternatives
    function enhanceSkills(skills) {
        const skillUpgrades = {
            'programming': 'Software Development',
            'coding': 'Software Engineering',
            'excel': 'Advanced Microsoft Excel',
            'word': 'Microsoft Office Suite',
            'writing': 'Content Development',
            'communication': 'Stakeholder Communication',
            'teamwork': 'Cross-functional Team Collaboration',
            'management': 'Project Leadership',
            'analysis': 'Data Analysis & Reporting',
            'problem solving': 'Strategic Problem Resolution'
        };

        return skills.map(skill => {
            const lowerSkill = skill.toLowerCase();
            for (const [basic, enhanced] of Object.entries(skillUpgrades)) {
                if (lowerSkill.includes(basic)) {
                    return enhanced;
                }
            }
            return skill;
        });
    }

    // Function to suggest additional skills based on job experience
    function suggestAdditionalSkills(jobDescriptions) {
        const techSkills = [
            'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 
            'AWS', 'Docker', 'CI/CD', 'Git', 'Agile Methodologies'
        ];
        
        const softSkills = [
            'Leadership', 'Communication', 'Project Management', 
            'Critical Thinking', 'Time Management', 'Problem Solving'
        ];
        
        const suggestions = [];
        
        // Analyze job descriptions for tech hints
        const techHints = /(software|develop|code|program|web|app|data|analysis)/i;
        const managementHints = /(manag|lead|direct|coordinat|oversee)/i;
        
        const isTech = jobDescriptions.some(desc => techHints.test(desc));
        const isManagement = jobDescriptions.some(desc => managementHints.test(desc));
        
        // Select appropriate skills based on analysis
        if (isTech) {
            suggestions.push(...techSkills.slice(0, 5));
        }
        
        if (isManagement) {
            suggestions.push(...softSkills.slice(0, 3));
        }
        
        // Always add some soft skills
        if (suggestions.length < 5) {
            suggestions.push(...softSkills.slice(0, 5 - suggestions.length));
        }
        
        return suggestions;
    }

    // Expose functions to the global scope
    window.AIEnhancer = {
        enhanceText: enhanceText,
        enhanceSkills: enhanceSkills,
        suggestAdditionalSkills: suggestAdditionalSkills
    };
})();