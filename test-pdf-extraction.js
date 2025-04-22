/**
 * Test script for CV Enhancer PDF extraction and AI enhancement
 * This script tests both PDF extraction and AI enhancement with a sample PDF
 */

const fs = require('fs');
const path = require('path');
const { processCVFromPDF } = require('./server/utils/pdfParser');
const aiEnhancer = require('./server/utils/aiEnhancer');

// Create server directories if they don't exist
const uploadDir = path.join(__dirname, 'server/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
}

// Path to test PDF file
const testPdfPath = process.argv[2];

if (!testPdfPath) {
    console.error('Error: Please provide a path to a PDF file');
    console.log('Usage: node test-extraction.js /path/to/cv.pdf');
    process.exit(1);
}

if (!fs.existsSync(testPdfPath)) {
    console.error(`Error: File not found at ${testPdfPath}`);
    process.exit(1);
}

console.log(`Testing PDF extraction with: ${testPdfPath}`);

// Process the PDF
processCVFromPDF(testPdfPath)
    .then(cvData => {
        console.log('\n=== CV Data Extracted ===');
        console.log('Personal Information:');
        console.log(cvData.personalInfo);

        console.log('\nSummary:');
        console.log(cvData.summary ? cvData.summary.substring(0, 150) + '...' : 'No summary found');

        console.log('\nExperience:');
        console.log(`Found ${cvData.experience.length} experience items`);
        if (cvData.experience.length > 0) {
            console.log('First experience:', cvData.experience[0]);
        }

        console.log('\nEducation:');
        console.log(`Found ${cvData.education.length} education items`);
        if (cvData.education.length > 0) {
            console.log('First education:', cvData.education[0]);
        }

        console.log('\nSkills:');
        console.log(cvData.skills);

        // Test AI enhancement
        console.log('\n=== Testing AI Enhancement ===');
        return aiEnhancer.simulateEnhancement(cvData);
    })
    .then(enhancedData => {
        console.log('\nEnhanced Summary:');
        console.log(enhancedData.summary ? enhancedData.summary.substring(0, 150) + '...' : 'No summary enhancement');

        console.log('\nEnhanced Experience (first item):');
        if (enhancedData.experience && enhancedData.experience.length > 0) {
            const firstExp = enhancedData.experience[0];
            console.log(`${firstExp.title} at ${firstExp.company}`);
            console.log(firstExp.description.substring(0, 150) + '...');
        }

        console.log('\nEnhanced Skills:');
        console.log(enhancedData.skills);

        console.log('\nSuggested Additional Skills:');
        console.log(enhancedData.suggestedSkills);

        console.log('\n=== Test Complete ===');
        console.log('PDF extraction and enhancement successful!');
    })
    .catch(error => {
        console.error('Error during testing:', error);
        process.exit(1);
    });