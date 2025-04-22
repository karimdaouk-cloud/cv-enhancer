/**
 * CV Enhancer - API Routes
 * Handles API routes for the application
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const uploadController = require('../controllers/uploadController');
const extractionController = require('../controllers/extractionController');
const aiController = require('../controllers/aiController');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Create the uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueId = uuidv4();
        const fileExt = path.extname(file.originalname);
        cb(null, `${uniqueId}${fileExt}`);
    }
});

// Create upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// File upload endpoint
router.post('/upload', upload.single('cv'), uploadController.uploadCV);

// CV text extraction endpoint
router.get('/extract/:fileId', extractionController.extractCV);

// AI enhancement endpoint
router.post('/enhance', aiController.enhanceCV);

module.exports = router;