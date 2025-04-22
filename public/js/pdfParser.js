/**
 * CV Enhancer - Client-side PDF Parser
 * Handles client-side extraction from PDF files
 */

// Create a namespace for the PDF parser
const PDFParser = (function() {
    // Minimum characters required to consider valid section content
    const MIN_SECTION_CHARS = 10;
    
    // Common section identifiers in CVs
    const sectionIdentifiers = {
        summary: ['summary', 'profile', 'objective', 'about me', 'professional summary'],
        experience: ['experience', 'work experience', 'employment history', 'work history'],
        education: ['education', 'academic', 'qualifications', 'educational background'],
        skills: ['skills', 'core competencies', 'technical skills', 'expertise', 'proficiencies'],
        certifications: ['certifications', 'certificates', 'accreditations', 'licensure'],
        languages: ['languages', 'language proficiency', 'language skills']
    };
    
    /**
     * Process a PDF file on the client side
     * @param {File} file - The PDF file to process
     * @returns {Promise<Object>} - Extracted CV data
     */
    async function processPDFClientSide(file) {
        try {
            const text = await extractTextFromPDF(file);
            return parseCVText(text);
        } catch (error) {
            console.error('Error processing PDF on client side:', error);
            throw error;
        }
    }
    
    /**
     * Extract text from a PDF file using pdf.js
     * @param {File} file - The PDF file
     * @returns {Promise<string>} - Extracted text
     */
    async function extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function(event) {
                try {
                    const typedArray = new Uint8Array(event.target.result);
                    
                    // Use PDF.js to extract text
                    const pdf = await pdfjsLib.getDocument({data: typedArray}).promise;
                    let extractedText = '';
                    
                    // Extract text from each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        
                        // Join the text content of the page
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        extractedText += pageText + '\n\n';
                    }
                    
                    resolve(extractedText);
                } catch (error) {
                    console.error('Error extracting text from PDF:', error);
                    reject(error);
                }
            };
            
            fileReader.onerror = function() {
                reject(new Error('Error reading the file'));
            };
            
            fileReader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Parse the extracted CV text into structured data
     * @param {string} text - The extracted text from the PDF
     * @returns {Object} - Structured CV data
     */
    function parseCVText(text) {
        // Initialize CV data structure
        const cvData = {
            personalInfo: extractPersonalInfo(text),
            summary: '',
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            languages: [],
            additional: ''
        };
        
        // Extract sections from the text
        const sections = identifySections(text);
        
        // Process identified sections
        for (const [sectionName, content] of Object.entries(sections)) {
            if (content.length < MIN_SECTION_CHARS) continue;
            
            if (sectionIdentifiers.summary.some(id => sectionName.includes(id))) {
                cvData.summary = content;
            } 
            else if (sectionIdentifiers.experience.some(id => sectionName.includes(id))) {
                cvData.experience = extractExperienceItems(content);
            }
            else if (sectionIdentifiers.education.some(id => sectionName.includes(id))) {
                cvData.education = extractEducationItems(content);
            }
            else if (sectionIdentifiers.skills.some(id => sectionName.includes(id))) {
                cvData.skills = extractSkills(content);
            }
            else if (sectionIdentifiers.certifications.some(id => sectionName.includes(id))) {
                cvData.certifications = extractCertifications(content);
            }
            else if (sectionIdentifiers.languages.some(id => sectionName.includes(id))) {
                cvData.languages = extractLanguages(content);
            }
            else {
                // Additional content
                cvData.additional += content + '\n\n';
            }
        }
        
        // Clean up any trailing whitespace
        cvData.additional = cvData.additional.trim();
        
        return cvData;
    }
    
    /**
     * Extract personal information from the CV text
     * @param {string} text - The full CV text
     * @returns {Object} - Personal information
     */
    function extractPersonalInfo(text) {
        // Take the first few lines of the CV (likely to contain personal info)
        const headerLines = text.split('\n').slice(0, 10).join('\n');
        
        const personalInfo = {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: ''
        };
        
        // Extract full name (likely the first non-empty line)
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
            personalInfo.fullName = lines[0].trim();
        }
        
        // Extract email
        const emailMatch = headerLines.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
            personalInfo.email = emailMatch[0];
        }
        
        // Extract phone number
        const phonePattern = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?|(\d{3})-(\d{3})-(\d{4})/;
        const phoneMatch = headerLines.match(phonePattern);
        if (phoneMatch) {
            personalInfo.phone = phoneMatch[0];
        }
        
        // Extract location (city, state/country)
        const locationPatterns = [
            /(?:^|\n|\s)([A-Za-z\s]+,\s*[A-Za-z\s]+)(?:\n|\s|$)/,  // City, State/Country
            /(?:^|\n|\s)([A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+)(?:\n|\s|$)/  // City, State, Country
        ];
        
        for (const pattern of locationPatterns) {
            const locationMatch = headerLines.match(pattern);
            if (locationMatch) {
                personalInfo.location = locationMatch[1].trim();
                break;
            }
        }
        
        // Extract LinkedIn URL
        const linkedinPattern = /(?:linkedin\.com\/in\/[A-Za-z0-9_-]+)/i;
        const linkedinMatch = text.match(linkedinPattern);
        if (linkedinMatch) {
            personalInfo.linkedin = linkedinMatch[0];
        }
        
        // Extract website/portfolio URL (excluding LinkedIn and email)
        const websitePattern = /(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9][-A-Za-z0-9]*\.)+[A-Za-z]{2,}(?:\/[^\s]*)?/i;
        const websiteMatches = Array.from(text.matchAll(new RegExp(websitePattern, 'gi')))
            .map(match => match[0])
            .filter(url => !url.includes('linkedin.com') && !url.includes('@'));
        
        if (websiteMatches.length > 0) {
            personalInfo.portfolio = websiteMatches[0];
        }
        
        return personalInfo;
    }
    
    /**
     * Identify sections in the CV text
     * @param {string} text - The full CV text
     * @returns {Object} - Identified sections with their content
     */
    function identifySections(text) {
        const sections = {};
        
        // Flatten section identifiers for easier matching
        const allIdentifiers = Object.values(sectionIdentifiers).flat();
        
        // Create regex pattern to match section headings
        const headingPattern = new RegExp(`(^|\\n)\\s*(${allIdentifiers.join('|')})\\s*(?::|\\n|$)`, 'gi');
        
        // Find all section headings
        let matches = [];
        let match;
        
        while ((match = headingPattern.exec(text)) !== null) {
            matches.push({
                index: match.index,
                heading: match[2].toLowerCase().trim(),
                fullMatch: match[0]
            });
        }
        
        // If no sections found, treat everything as 'content'
        if (matches.length === 0) {
            sections['content'] = text.trim();
            return sections;
        }
        
        // Extract content between section headings
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextIndex = (i < matches.length - 1) ? matches[i + 1].index : text.length;
            
            const startPos = currentMatch.index + currentMatch.fullMatch.length;
            const content = text.substring(startPos, nextIndex).trim();
            
            sections[currentMatch.heading] = content;
        }
        
        // Add everything before the first section as the header
        if (matches.length > 0 && matches[0].index > 0) {
            sections['header'] = text.substring(0, matches[0].index).trim();
        }
        
        return sections;
    }
    
    /**
     * Extract experience items from the experience section
     * @param {string} experienceText - The experience section text
     * @returns {Array} - Array of experience objects
     */
    function extractExperienceItems(experienceText) {
        if (!experienceText || experienceText.trim().length < MIN_SECTION_CHARS) {
            return [];
        }
        
        const experiences = [];
        
        // Split into individual job entries (commonly separated by blank lines or dates)
        const jobEntries = experienceText.split(/\n{2,}/).filter(entry => entry.trim());
        
        jobEntries.forEach(entry => {
            const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
            
            if (lines.length < 2) return;  // Skip if there's not enough information
            
            const experience = {
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            };
            
            // Check for date ranges in the entry
            const datePatterns = [
                /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\s*(?:-|to|–|—)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current|Now)/i,
                /\b(20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:(20\d{2}|19\d{2})|Present|Current|Now)\b/i
            ];
            
            let dateLineIndex = -1;
            let dateMatch = null;
            
            // Find the line with a date range
            for (let i = 0; i < lines.length; i++) {
                for (const pattern of datePatterns) {
                    const match = lines[i].match(pattern);
                    if (match) {
                        dateLineIndex = i;
                        dateMatch = match;
                        break;
                    }
                }
                if (dateMatch) break;
            }
            
            // Extract job title and company
            if (dateLineIndex === 0) {
                // If date is on the first line, job title might be with the date
                experience.title = lines[0].replace(dateMatch[0], '').trim();
                experience.company = lines[1] || '';
            } else if (dateLineIndex === 1) {
                // If date is on the second line, first line is likely job title
                experience.title = lines[0];
                experience.company = lines[1].replace(dateMatch[0], '').trim();
            } else if (dateLineIndex > 1) {
                // If date is elsewhere, assume first two lines are title and company
                experience.title = lines[0];
                experience.company = lines[1];
            } else {
                // No date found, use first two lines as title and company
                experience.title = lines[0];
                experience.company = lines[1];
            }
            
            // Process date range if found
            if (dateMatch) {
                const dateRange = dateMatch[0];
                const dates = dateRange.split(/\s*(?:-|to|–|—)\s*/);
                
                if (dates.length >= 2) {
                    experience.startDate = dates[0].trim();
                    if (dates[1].match(/Present|Current|Now/i)) {
                        experience.current = true;
                        experience.endDate = 'Present';
                    } else {
                        experience.endDate = dates[1].trim();
                    }
                }
            }
            
            // Combine remaining lines for description
            const skipLines = Math.max(2, dateLineIndex + 1);
            experience.description = lines.slice(skipLines).join('\n');
            
            experiences.push(experience);
        });
        
        return experiences;
    }
    
    /**
     * Extract education items from the education section
     * @param {string} educationText - The education section text
     * @returns {Array} - Array of education objects
     */
    function extractEducationItems(educationText) {
        if (!educationText || educationText.trim().length < MIN_SECTION_CHARS) {
            return [];
        }
        
        const educationItems = [];
        
        // Split into individual education entries
        const eduEntries = educationText.split(/\n{2,}/).filter(entry => entry.trim());
        
        eduEntries.forEach(entry => {
            const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
            
            if (lines.length < 2) return;  // Skip if there's not enough information
            
            const education = {
                degree: '',
                institution: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            };
            
            // Check for degree indicators in the first line
            const degreePatterns = [
                /(?:Bachelor|Master|PhD|Doctorate|Associate|B\.?[A-Z]|M\.?[A-Z]|Ph\.?D)/i,
                /(?:BS|BA|MS|MA|MBA|BBA|AA|AS)/i
            ];
            
            const firstLineIsDegree = degreePatterns.some(pattern => pattern.test(lines[0]));
            
            if (firstLineIsDegree) {
                education.degree = lines[0];
                education.institution = lines[1] || '';
            } else {
                // If no degree found in first line, assume institution first, degree second
                education.institution = lines[0];
                education.degree = lines[1] || '';
            }
            
            // Check for dates
            const datePatterns = [
                /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\s*(?:-|to|–|—)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current|Now)/i,
                /\b(20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:(20\d{2}|19\d{2})|Present|Current|Now)\b/i
            ];
            
            let dateLineIndex = -1;
            let dateMatch = null;
            
            // Find the line with a date range
            for (let i = 0; i < lines.length; i++) {
                for (const pattern of datePatterns) {
                    const match = lines[i].match(pattern);
                    if (match) {
                        dateLineIndex = i;
                        dateMatch = match;
                        break;
                    }
                }
                if (dateMatch) break;
            }
            
            // Process date range if found
            if (dateMatch) {
                const dateRange = dateMatch[0];
                const dates = dateRange.split(/\s*(?:-|to|–|—)\s*/);
                
                if (dates.length >= 2) {
                    education.startDate = dates[0].trim();
                    if (dates[1].match(/Present|Current|Now/i)) {
                        education.current = true;
                        education.endDate = 'Present';
                    } else {
                        education.endDate = dates[1].trim();
                    }
                }
            }
            
            // Combine remaining lines for description
            const skipLines = Math.max(2, dateLineIndex + 1);
            if (dateLineIndex !== 1 && dateLineIndex !== 0) { // Avoid duplicate information
                education.description = lines.slice(skipLines).join('\n');
            }
            
            educationItems.push(education);
        });
        
        return educationItems;
    }
    
    /**
     * Extract skills from the skills section
     * @param {string} skillsText - The skills section text
     * @returns {Array} - Array of skill strings
     */
    function extractSkills(skillsText) {
        if (!skillsText || skillsText.trim().length < MIN_SECTION_CHARS) {
            return [];
        }
        
        let skills = [];
        
        // Check for bullet points or commas as separators
        if (skillsText.includes('•') || skillsText.includes('-') || skillsText.includes('*')) {
            // Skills separated by bullet points
            const bulletPattern = /(?:•|-|\*)\s*([^•\-*\n]+)/g;
            const matches = [...skillsText.matchAll(bulletPattern)];
            
            skills = matches.map(match => match[1].trim());
        } else if (skillsText.includes(',')) {
            // Skills separated by commas
            skills = skillsText.split(',').map(skill => skill.trim());
        } else {
            // Skills on separate lines
            skills = skillsText.split('\n').map(skill => skill.trim()).filter(skill => skill);
        }
        
        // Filter out non-skill content and duplicates
        return [...new Set(skills.filter(skill => 
            skill.length > 0 && skill.length < 60 && !skill.includes(':') && !/^\d+$/.test(skill)
        ))];
    }
    
    /**
     * Extract certifications from the certifications section
     * @param {string} certificationsText - The certifications section text
     * @returns {Array} - Array of certification objects
     */
    function extractCertifications(certificationsText) {
        if (!certificationsText || certificationsText.trim().length < MIN_SECTION_CHARS) {
            return [];
        }
        
        const certifications = [];
        
        // Split into individual certification entries
        const entries = certificationsText.split(/\n{2,}|\n(?=•|-|\*|\d+\.)|(?:•|-|\*|\d+\.)/).filter(entry => entry.trim());
        
        entries.forEach(entry => {
            const lines = entry.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) return;
            
            const certification = {
                name: '',
                organization: '',
                date: '',
                expiry: '',
                noExpiry: true
            };
            
            // First line typically contains the certification name
            certification.name = lines[0].trim();
            
            // Look for organization and date in subsequent lines
            if (lines.length > 1) {
                // Check for date pattern in all lines
                const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|20\d{2}|19\d{2}/i;
                
                for (let i = 1; i < lines.length; i++) {
                    const dateMatch = lines[i].match(datePattern);
                    if (dateMatch) {
                        certification.date = dateMatch[0].trim();
                        
                        // If this line has organization info, extract it
                        const orgPart = lines[i].replace(dateMatch[0], '').trim();
                        if (orgPart && !certification.organization) {
                            certification.organization = orgPart.replace(/^[,\s-]+|[,\s-]+$/g, '');
                        }
                    } else if (!certification.organization) {
                        // If no date in this line, assume it's the organization
                        certification.organization = lines[i].trim();
                    }
                }
            }
            
            // If we still don't have an organization, check if it's in the cert name
            if (!certification.organization && certification.name.includes(',')) {
                const parts = certification.name.split(',').map(part => part.trim());
                certification.name = parts[0];
                certification.organization = parts[1] || '';
            }
            
            certifications.push(certification);
        });
        
        return certifications;
    }
    
    /**
     * Extract languages from the languages section
     * @param {string} languagesText - The languages section text
     * @returns {Array} - Array of language objects
     */
    function extractLanguages(languagesText) {
        if (!languagesText || languagesText.trim().length < MIN_SECTION_CHARS) {
            return [];
        }
        
        const languages = [];
        
        // Common proficiency levels
        const proficiencyLevels = [
            'native', 'fluent', 'proficient', 'advanced', 'intermediate', 'basic', 'beginner',
            'c2', 'c1', 'b2', 'b1', 'a2', 'a1'
        ];
        
        const proficiencyPattern = new RegExp(`(${proficiencyLevels.join('|')})`, 'i');
        
        // Handle different formats of language listings
        if (languagesText.includes(':') || languagesText.includes('-') || languagesText.includes('•')) {
            // Format: Language: Level or Language - Level or • Language - Level
            const entries = languagesText.split(/\n/).map(entry => entry.trim()).filter(entry => entry);
            
            entries.forEach(entry => {
                // Clean up entry
                entry = entry.replace(/^[•\-*]\s*/, '');
                
                let language = '', level = '';
                
                // Check for level indicators
                const levelMatch = entry.match(proficiencyPattern);
                
                if (entry.includes(':')) {
                    // Format: Language: Level
                    const parts = entry.split(':').map(part => part.trim());
                    language = parts[0];
                    level = parts[1] || '';
                } else if (entry.includes('-')) {
                    // Format: Language - Level
                    const parts = entry.split('-').map(part => part.trim());
                    language = parts[0];
                    level = parts[1] || '';
                } else if (levelMatch) {
                    // Format: Language (Level) or Level Language
                    const levelIndex = entry.toLowerCase().indexOf(levelMatch[0].toLowerCase());
                    if (levelIndex === 0) {
                        // Level Language
                        language = entry.substring(levelMatch[0].length).trim();
                        level = levelMatch[0];
                    } else {
                        // Language Level or Language (Level)
                        language = entry.substring(0, levelIndex).trim();
                        level = levelMatch[0];
                    }
                } else {
                    // Just language without level
                    language = entry;
                    level = 'Intermediate'; // Default level
                }
                
                // Clean up parentheses from level
                level = level.replace(/[()]/g, '').trim();
                
                // Standardize level
                if (level) {
                    if (level.match(/native|mother\s*tongue|first\s*language/i)) {
                        level = 'Native';
                    } else if (level.match(/fluent|proficient|excellent|c2/i)) {
                        level = 'Fluent';
                    } else if (level.match(/advanced|c1|upper\s*intermediate|b2/i)) {
                        level = 'Advanced';
                    } else if (level.match(/intermediate|b1/i)) {
                        level = 'Intermediate';
                    } else if (level.match(/basic|beginner|elementary|a1|a2/i)) {
                        level = 'Basic';
                    }
                } else {
                    level = 'Intermediate';  // Default level if not specified
                }
                
                if (language) {
                    languages.push({
                        name: language,
                        level: level
                    });
                }
            });
        } else if (languagesText.includes(',')) {
            // Languages separated by commas
            const languageList = languagesText.split(',').map(lang => lang.trim()).filter(lang => lang);
            
            languageList.forEach(language => {
                languages.push({
                    name: language,
                    level: 'Intermediate'  // Default level
                });
            });
        } else {
            // Languages on separate lines
            const languageList = languagesText.split('\n').map(lang => lang.trim()).filter(lang => lang);
            
            languageList.forEach(language => {
                languages.push({
                    name: language,
                    level: 'Intermediate'  // Default level
                });
            });
        }
        
        return languages;
    }
    
    // Return public API
    return {
        processPDFClientSide: processPDFClientSide,
        extractTextFromPDF: extractTextFromPDF,
        parseCVText: parseCVText
    };
})();

// If PDF.js is not loaded, log an error
if (typeof pdfjsLib === 'undefined') {
    console.error('PDF.js library is not loaded. Text extraction may not work properly.');
}