/**
 * CV Enhancer - Server
 * Express server for handling file uploads and AI integration
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // ✅ Corrected path

// Create Express app
const app = express();
const PORT = process.env.PORT || 3012;

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
}

// Serve static files from the public directory
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    console.log(`Serving static files from: ${publicDir}`);
} else {
    console.warn(`Public directory not found: ${publicDir}`);
    // Create basic directories
    fs.mkdirSync(path.join(publicDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(publicDir, 'js'), { recursive: true });
    fs.mkdirSync(path.join(publicDir, 'images'), { recursive: true });
    console.log('Created basic directory structure in public folder');
}

// Use API routes
app.use('/api', apiRoutes);

// Routes for HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(publicDir, 'editor.html'));
});

// Fallback route
app.use('*', (req, res) => {
    res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Start the server with graceful shutdown support
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed gracefully (SIGTERM)');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed gracefully (SIGINT)');
        process.exit(0);
    });
});

module.exports = server; // Export for testing
