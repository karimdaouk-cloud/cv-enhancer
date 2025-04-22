/**
 * CV Enhancer - Extraction Controller
 * Handles extraction of CV content from PDF files
 */

const path = require('path');
const fs = require('fs');
const { processCVFromPDF } = require('../utils/pdfParser');

/**
 * Extract content from a CV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.extractCV = async (req, res) => {
    try {
        console.log('Starting CV extraction for fileId:', req.params.fileId);
        const { fileId } = req.params;
        
        // Find the file
        const uploadsDir = path.join(__dirname, '../uploads');
        console.log('Looking for files in directory:', path.resolve(uploadsDir));
        
        // Check if the directory exists
        if (!fs.existsSync(uploadsDir)) {
            console.error(`Uploads directory does not exist: ${uploadsDir}`);
            return res.status(404).json({ error: 'Uploads directory not found' });
        }
        
        // List all files in uploads directory
        const files = fs.readdirSync(uploadsDir);
        console.log('All files in uploads directory:', files);
        
        // Look for file that starts with the fileId
        const pdfFile = files.find(file => file.startsWith(fileId));
        
        if (!pdfFile) {
            console.error(`File with ID ${fileId} not found among ${files.length} files`);
            return res.status(404).json({ error: 'File not found' });
        }
        
        const filePath = path.join(uploadsDir, pdfFile);
        console.log('Found file, full path:', path.resolve(filePath));
        
        // Check if file exists and get its size
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log('File exists with size:', stats.size, 'bytes');
        } else {
            console.error('Error: File does not exist at path:', filePath);
            return res.status(404).json({ error: 'File exists in directory listing but cannot be accessed' });
        }
        
        // Process the PDF file using pdfParser
        console.log('Processing PDF file with processCVFromPDF...');
        const cvData = await processCVFromPDF(filePath);
        console.log('PDF processed successfully, extracted data:', JSON.stringify(cvData, null, 2).substring(0, 500) + '...');
        
        // Return the extracted data
        res.json({
            success: true,
            data: cvData
        });
    } catch (error) {
        console.error('Error in extraction controller:', error);
        res.status(500).json({ error: error.message });
    }
};