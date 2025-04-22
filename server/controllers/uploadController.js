/**
 * CV Enhancer - Upload Controller
 * Handles CV file uploads
 */

const path = require('path');
const fs = require('fs');

/**
 * Upload a CV file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadCV = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Print detailed file information
        console.log('File upload details:', req.file);
        console.log('Absolute file path:', path.resolve(req.file.path));
        
        // Verify file exists and is readable
        if (fs.existsSync(req.file.path)) {
            const stats = fs.statSync(req.file.path);
            console.log('File exists with size:', stats.size, 'bytes');
        } else {
            console.log('Warning: File does not exist at path:', req.file.path);
        }
        
        // Return the file path and ID for further processing
        const fileId = path.basename(req.file.filename, path.extname(req.file.filename));
        
        res.json({
            success: true,
            fileId,
            filePath: req.file.path,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading CV:', error);
        res.status(500).json({ error: error.message });
    }
};