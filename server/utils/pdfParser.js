/**
 * CV Enhancer - Server-side PDF Parser
 * Handles the extraction and categorization of CV content from PDF files
 */

const fs = require('fs');
const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const pdfParse = require('pdf-parse');

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDF(filePath) {
    try {
        // Read the PDF file
        const dataBuffer = fs.readFileSync(filePath);
        
        // Use pdf-parse for simple text extraction
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

/**
 * Extract detailed content with layout information from a PDF
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Detailed PDF content with layout information
 */
async function extractDetailedPDFContent(filePath) {
    try {
        const options = {};
        const data = await pdfExtract.extract(filePath, options);
        return data;
    } catch (error) {
        console.error('Error extracting detailed PDF content:', error);
        throw error;
    }
}

/**
 * Process extracted text to identify CV sections
 * @param {string} text - Raw text extracted from the PDF
 * @returns {Object} - Processed CV data organized by sections
 */
function processCVText(text) {
    // Initialize the CV data structure
    const cvData = {
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            portfolio: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        additional: ''
    };
    
    // Extract sections based on common CV headings
    const sections = extractSections(text);
    
    // Process personal information (usually at the top of the CV)
    cvData.personalInfo = extractPersonalInfo(sections.header || '');
    
    // Process summary/profile section
    cvData.summary = extractSummary(sections.summary || sections.profile || sections.objective || '');
    
    // Process experience section
    cvData.experience = extractExperience(sections.experience || sections.work || sections['work experience'] || sections['employment history'] || '');
    
    // Process education section
    cvData.education = extractEducation(sections.education || sections['educational background'] || '');
    
    // Process skills section
    cvData.skills = extractSkills(sections.skills || sections['technical skills'] || sections.technologies || sections['core competencies'] || '');
    
    // Process certifications section
    cvData.certifications = extractCertifications(sections.certifications || sections.certificates || sections.qualifications || '');
    
    // Process languages section
    cvData.languages = extractLanguages(sections.languages || sections['language proficiency'] || '');
    
    // Process additional information
    cvData.additional = extractAdditionalInfo(
        sections.additional || 
        sections['additional information'] || 
        sections.interests || 
        sections.hobbies || 
        sections.volunteering || 
        sections.publications || 
        ''
    );
    
    return cvData;
}

/**
 * Extract sections from CV text based on common headings
 * @param {string} text - The raw CV text
 * @returns {Object} - Extracted sections with their content
 */
function extractSections(text) {
    const sections = {
        header: ''  // The top part before any section heading
    };
    
    // Common section headings in CVs/resumes
    const sectionHeadings = [
        'summary', 'profile', 'professional summary', 'objective', 'about me',
        'experience', 'work experience', 'employment history', 'work history', 'professional experience',
        'education', 'academic background', 'educational background', 'academic qualifications',
        'skills', 'technical skills', 'core competencies', 'technologies', 'expertise', 'professional skills',
        'certifications', 'certificates', 'qualifications', 'professional certifications',
        'languages', 'language proficiency', 'language skills',
        'additional information', 'interests', 'hobbies', 'volunteering', 'publications', 'projects'
    ];
    
    // Create a regex pattern for section headings
    const headingPattern = new RegExp(
        `(^|\\n)\\s*(${sectionHeadings.join('|')})\\s*(?::|\\n|$)`, 'gi'
    );
    
    // Find all matches with their positions
    let match;
    let matches = [];
    
    // Collect all matches with their positions
    while ((match = headingPattern.exec(text)) !== null) {
        matches.push({
            index: match.index,
            heading: match[2].toLowerCase().trim(),
            fullMatch: match[0]
        });
    }
    
    // If no sections found, treat everything as header
    if (matches.length === 0) {
        sections.header = text.trim();
        return sections;
    }
    
    // Extract header (everything before first section)
    sections.header = text.substring(0, matches[0].index).trim();
    
    // Extract each section's content
    for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextIndex = (i < matches.length - 1) ? matches[i + 1].index : text.length;
        
        // Extract content from the end of current heading to start of next heading
        const startPos = currentMatch.index + currentMatch.fullMatch.length;
        const content = text.substring(startPos, nextIndex).trim();
        
        // Store section content
        sections[currentMatch.heading] = content;
    }
    
    return sections;
}

/**
 * Extract personal information from CV header
 * @param {string} headerText - The header text from CV
 * @returns {Object} - Extracted personal information
 */
function extractPersonalInfo(headerText) {
    const personalInfo = {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
    };
    
    // Extract full name (usually the first line with more than 3 characters)
    const lines = headerText.split('\n').filter(line => line.trim().length > 3);
    if (lines.length > 0) {
        personalInfo.fullName = lines[0].trim();
    }
    
    // Extract email using regex
    const emailMatch = headerText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
        personalInfo.email = emailMatch[0];
    }
    
    // Extract phone number using regex
    const phonePattern = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const phoneMatch = headerText.match(phonePattern);
    if (phoneMatch) {
        personalInfo.phone = phoneMatch[0];
    }
    
    // Extract location (city, state/province, country)
    const locationPatterns = [
        /(?:^|\n|\s)([A-Za-z\s]+,\s*[A-Za-z\s]+)(?:\n|\s|$)/,  // City, State/Country
        /(?:^|\n|\s)([A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+)(?:\n|\s|$)/  // City, State, Country
    ];
    
    for (const pattern of locationPatterns) {
        const locationMatch = headerText.match(pattern);
        if (locationMatch) {
            personalInfo.location = locationMatch[1].trim();
            break;
        }
    }
    
    // Extract LinkedIn URL
    const linkedinPattern = /(?:linkedin\.com\/in\/[A-Za-z0-9_-]+)/i;
    const linkedinMatch = headerText.match(linkedinPattern);
    if (linkedinMatch) {
        personalInfo.linkedin = linkedinMatch[0];
    }
    
    // Extract portfolio/website URL
    const websitePatterns = [
        /(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9][-A-Za-z0-9]*\.)+[A-Za-z]{2,}(?:\/[^\s]*)?/i,
        /(?<!@)([A-Za-z0-9][-A-Za-z0-9]*\.)+[A-Za-z]{2,}(?:\/[^\s]*)?/i
    ];
    
    for (const pattern of websitePatterns) {
        const websiteMatch = headerText.match(pattern);
        if (websiteMatch && 
            !websiteMatch[0].includes('linkedin.com') && 
            !websiteMatch[0].includes('@')) {
            personalInfo.portfolio = websiteMatch[0];
            break;
        }
    }
    
    return personalInfo;
}

/**
 * Extract professional summary from CV
 * @param {string} summaryText - The summary section text
 * @returns {string} - Extracted professional summary
 */
function extractSummary(summaryText) {
    return summaryText.trim();
}

/**
 * Extract work experience from CV
 * @param {string} experienceText - The experience section text
 * @returns {Array} - Array of experience objects
 */
function extractExperience(experienceText) {
    if (!experienceText.trim()) {
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
        
        // First line usually contains job title
        experience.title = lines[0];
        
        // Second line usually contains company name
        experience.company = lines[1];
        
        // Extract date range using regex
        const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4})\s*(?:-|to|–|—)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|Present|Current|Now)/i;
        const datePattern2 = /\b(20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:(20\d{2}|19\d{2})|Present|Current|Now)\b/i;
        
        for (let i = 0; i < lines.length; i++) {
            let dateMatch = lines[i].match(datePattern);
            if (!dateMatch) {
                dateMatch = lines[i].match(datePattern2);
            }
            
            if (dateMatch) {
                const dateRange = dateMatch[0];
                const dates = dateRange.split(/\s*(?:-|to|–|—)\s*/);
                
                if (dates.length >= 2) {
                    experience.startDate = parseDate(dates[0]);
                    
                    if (dates[1].match(/Present|Current|Now/i)) {
                        experience.current = true;
                    } else {
                        experience.endDate = parseDate(dates[1]);
                    }
                }
                
                // Remove the date line from further processing
                lines.splice(i, 1);
                break;
            }
        }
        
        // Adjust title and company if no date found (typically first two lines are title and company)
        if (!experience.startDate && lines.length >= 3) {
            experience.title = lines[0];
            experience.company = lines[1];
            
            // Rest is description
            experience.description = lines.slice(2).join('\n');
        } else {
            // Everything else is description
            experience.description = lines.slice(Math.min(2, lines.length)).join('\n');
        }
        
        experiences.push(experience);
    });
    
    return experiences;
}

/**
 * Extract education information from CV
 * @param {string} educationText - The education section text
 * @returns {Array} - Array of education objects
 */
function extractEducation(educationText) {
    if (!educationText.trim()) {
        return [];
    }
    
    const educationEntries = [];
    
    // Split into individual education entries
    const entries = educationText.split(/\n{2,}/).filter(entry => entry.trim());
    
    entries.forEach(entry => {
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
        
        // First line usually contains degree
        const degreeMatch = lines[0].match(/(?:Bachelor|Master|PhD|Doctorate|Associate|B\.?[A-Z]|M\.?[A-Z]|Ph\.?D)/i);
        if (degreeMatch) {
            education.degree = lines[0];
            education.institution = lines[1] || '';
        } else {
            // If no degree found in first line, assume institution first, degree second
            education.institution = lines[0];
            education.degree = lines[1] || '';
        }
        
        // Extract date range using regex
        const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|20\d{2}|19\d{2})\s*(?:-|to|–|—)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|20\d{2}|19\d{2}|Present|Current|Now)/i;
        
        for (let i = 0; i < lines.length; i++) {
            const dateMatch = lines[i].match(datePattern);
            if (dateMatch) {
                const dateRange = dateMatch[0];
                const dates = dateRange.split(/\s*(?:-|to|–|—)\s*/);
                
                if (dates.length >= 2) {
                    education.startDate = parseDate(dates[0]);
                    
                    if (dates[1].match(/Present|Current|Now/i)) {
                        education.current = true;
                    } else {
                        education.endDate = parseDate(dates[1]);
                    }
                }
                
                // Remove the date line from further processing
                lines.splice(i, 1);
                break;
            }
        }
        
        // Everything else is description
        if (lines.length > 2) {
            education.description = lines.slice(2).join('\n');
        }
        
        educationEntries.push(education);
    });
    
    return educationEntries;
}

/**
 * Extract skills from CV
 * @param {string} skillsText - The skills section text
 * @returns {Array} - Array of skill strings
 */
function extractSkills(skillsText) {
    if (!skillsText.trim()) {
        return [];
    }
    
    // Handle skill lists in various formats
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
        skill.length > 0 && skill.length < 50 && !skill.includes(':')
    ))];
}

/**
 * Extract certifications from CV
 * @param {string} certificationsText - The certifications section text
 * @returns {Array} - Array of certification objects
 */
function extractCertifications(certificationsText) {
    if (!certificationsText.trim()) {
        return [];
    }
    
    const certifications = [];
    
    // Split into individual certification entries
    const entries = certificationsText.split(/\n{2,}|\n(?=•|-|\*|\d+\.)|(?:•|-|\*|\d+\.)/g)
        .map(entry => entry.trim())
        .filter(entry => entry);
    
    entries.forEach(entry => {
        const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return;
        
        const certification = {
            name: '',
            organization: '',
            date: '',
            expiry: '',
            noExpiry: true
        };
        
        // First line typically contains the certification name
        certification.name = lines[0];
        
        // Look for organization and date in subsequent lines
        if (lines.length > 1) {
            // Check for date pattern in all lines
            const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}|20\d{2}|19\d{2}/i;
            
            for (let i = 1; i < lines.length; i++) {
                const dateMatch = lines[i].match(datePattern);
                if (dateMatch) {
                    certification.date = parseDate(dateMatch[0]);
                    
                    // If this line has organization info, extract it
                    const orgPart = lines[i].replace(dateMatch[0], '').trim();
                    if (orgPart && !certification.organization) {
                        certification.organization = orgPart.replace(/^[,\s-]+|[,\s-]+$/g, '');
                    }
                } else if (!certification.organization) {
                    // If no date in this line, assume it's the organization
                    certification.organization = lines[i];
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
 * Extract languages from CV
 * @param {string} languagesText - The languages section text
 * @returns {Array} - Array of language objects
 */
function extractLanguages(languagesText) {
    if (!languagesText.trim()) {
        return [];
    }
    
    const languages = [];
    
    // Common proficiency levels
    const proficiencyLevels = [
        'native', 'fluent', 'proficient', 'advanced', 'intermediate', 'basic', 'beginner'
    ];
    
    // Handle different formats of language listings
    if (languagesText.includes(':') || languagesText.includes('-') || languagesText.includes('•')) {
        // Format: Language: Level or Language - Level or • Language - Level
        const entries = languagesText.split(/\n/).map(entry => entry.trim()).filter(entry => entry);
        
        entries.forEach(entry => {
            // Clean up entry
            entry = entry.replace(/^[•\-*]\s*/, '');
            
            let language = '', level = '';
            
            // Check for level indicators
            const levelMatch = entry.match(new RegExp(`(${proficiencyLevels.join('|')})`, 'i'));
            
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
                level = '';
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
    } else {
        // Simple list of languages without levels
        const languageList = languagesText.split(/[,\n]/).map(lang => lang.trim()).filter(lang => lang);
        
        languageList.forEach(language => {
            languages.push({
                name: language,
                level: 'Intermediate'  // Default level
            });
        });
    }
    
    return languages;
}

/**
 * Extract additional information from CV
 * @param {string} additionalText - The additional information section text
 * @returns {string} - Extracted additional information
 */
function extractAdditionalInfo(additionalText) {
    return additionalText.trim();
}

/**
 * Parse date string into a standard format (YYYY-MM)
 * @param {string} dateStr - Date string to parse
 * @returns {string} - Date in YYYY-MM format
 */
function parseDate(dateStr) {
    if (!dateStr) return '';
    
    const months = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    // Handle year only (assume January)
    if (/^\d{4}$/.test(dateStr.trim())) {
        return `${dateStr.trim()}-01`;
    }
    
    // Handle full date format (Month Year)
    const match = dateStr.match(/([a-z]{3})[a-z]*\s+(\d{4})/i);
    if (match) {
        const month = months[match[1].toLowerCase()];
        const year = match[2];
        return `${year}-${month}`;
    }
    
    return '';
}

/**
 * Main function to process a PDF CV
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - Processed CV data
 */
async function processCVFromPDF(filePath) {
    try {
        // Extract text from PDF
        const text = await extractTextFromPDF(filePath);
        
        // Process the extracted text
        const cvData = processCVText(text);
        
        return cvData;
    } catch (error) {
        console.error('Error processing CV from PDF:', error);
        throw error;
    }
}

module.exports = {
    extractTextFromPDF,
    extractDetailedPDFContent,
    processCVText,
    processCVFromPDF
};