/**
 * CV Enhancer - Setup Script
 * This script creates the necessary directory structure and copies files to the right locations
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('CV Enhancer - Setup Script');
console.log('=========================');

// Create required directories
const directories = [
    'server',
    'server/controllers',
    'server/routes',
    'server/uploads',
    'server/utils',
    'public',
    'public/css',
    'public/js',
    'public/images'
];

console.log('\nCreating directory structure...');
directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    } else {
        console.log(`Directory already exists: ${dir}`);
    }
});

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    const envTemplate = `# CV Enhancer Environment Variables

# Server Configuration
PORT=3012

# OpenAI API Configuration
OPENAI_API_KEY=your-api-key-here

# PDF Extraction Settings
MAX_PDF_SIZE_MB=5

# Security Settings
ENABLE_CORS=true
`;
    fs.writeFileSync(envPath, envTemplate);
    console.log('\nCreated .env file. Please edit it with your API keys.');
} else {
    console.log('\n.env file already exists.');
}

// Install dependencies
console.log('\nInstalling dependencies...');
exec('npm install', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(stdout);
    console.log('Dependencies installed successfully!');
    
    console.log('\nSetup complete! You can now start the server with:');
    console.log('npm start');
    
    console.log('\nTo test PDF extraction, run:');
    console.log('node test-extraction.js /path/to/your/cv.pdf');
});