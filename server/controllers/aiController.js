/**
 * CV Enhancer - AI Controller
 * Handles AI-based enhancement of CV content
 */

// Import AI enhancement module
const aiEnhancer = require('../utils/aiEnhancer');

/**
 * Enhance CV content using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enhanceCV = async (req, res) => {
    try {
        const { cvData } = req.body;
        
        if (!cvData) {
            return res.status(400).json({ error: 'No CV data provided' });
        }
        
        // Check if OpenAI API key is configured
        const useOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-api-key-here';
        
        let enhancedData;
        
        if (useOpenAI) {
            // Use OpenAI for enhancement
            enhancedData = await aiEnhancer.enhanceWithOpenAI(cvData);
        } else {
            // Use simulated enhancement
            console.log('OpenAI API key not configured. Using simulated enhancement.');
            enhancedData = aiEnhancer.simulateEnhancement(cvData);
        }
        
        // Return enhanced data
        res.json({
            success: true,
            data: enhancedData
        });
    } catch (error) {
        console.error('Error enhancing CV with AI:', error);
        res.status(500).json({ error: error.message });
    }
};