/**
 * CV Enhancer - Upload Handling
 * Handles file upload and processing before redirecting to editor
 */

// Initialize upload functionality
function initUploadPage() {
    console.log('Initializing upload page...');
    
    // Initialize global state object
    window.CVEnhancer = window.CVEnhancer || {
        state: {
            currentFile: null,
            cvData: {},
            currentTemplate: 'professional',
            paperSize: 'a4'
        }
    };
    
    // DOM elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFile');
    const uploadButton = document.getElementById('uploadButton');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadProgress = document.getElementById('uploadProgress');
    
    // Check if elements exist
    if (!dropArea || !fileInput || !fileInfo || !uploadButton) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Set up event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', function(e) {
        console.log('File dropped');
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelection(file);
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
        console.log('File input changed');
        if (this.files.length > 0) {
            handleFileSelection(this.files[0]);
        }
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        console.log('Handling file selection:', file.name);
        
        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }
        
        // Store file reference
        window.CVEnhancer.state.currentFile = file;
        
        // Update UI
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        uploadButton.disabled = false;
        
        console.log('File selected successfully');
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Handle remove button click
    removeFileBtn.addEventListener('click', function() {
        console.log('Removing file');
        window.CVEnhancer.state.currentFile = null;
        fileInput.value = '';
        fileInfo.style.display = 'none';
        uploadButton.disabled = true;
    });
    
    // Handle upload button click
    uploadButton.addEventListener('click', function() {
        console.log('Upload button clicked');
        if (!window.CVEnhancer.state.currentFile) {
            alert('Please select a file first');
            return;
        }
        
        uploadAndProcessCV(window.CVEnhancer.state.currentFile);
    });
    
    // Upload and process CV
    function uploadAndProcessCV(file) {
        console.log('Uploading and processing CV:', file.name);
        
        // Show upload progress
        uploadProgress.style.display = 'block';
        
        // Create FormData
        const formData = new FormData();
        formData.append('cv', file);
        
        // Start progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress > 95) {
                clearInterval(progressInterval);
                return;
            }
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }, 100);
        
        // Upload file to server
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        })
        .then(data => {
            console.log('Upload successful:', data);
            
            if (data.success && data.fileId) {
                // Complete progress bar
                clearInterval(progressInterval);
                progressFill.style.width = '100%';
                progressText.textContent = '100%';
                
                // Request extraction
                console.log('Requesting extraction for fileId:', data.fileId);
                return fetch(`/api/extract/${data.fileId}`);
            } else {
                throw new Error('Invalid upload response');
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Extraction failed');
            }
            return response.json();
        })
        .then(extractionData => {
            console.log('Extraction successful, data:', extractionData);
            
            if (extractionData.success && extractionData.data) {
                // Store extracted data in session storage for the editor page
                try {
                    sessionStorage.setItem('cvData', JSON.stringify(extractionData.data));
                    console.log('CV data stored in session storage');
                } catch (error) {
                    console.error('Error storing data in session storage:', error);
                }
                
                // Wait a moment before redirecting
                setTimeout(() => {
                    console.log('Redirecting to editor page...');
                    window.location.href = '/editor.html';
                }, 1000);
            } else {
                throw new Error('Invalid extraction data');
            }
        })
        .catch(error => {
            // Stop progress animation
            clearInterval(progressInterval);
            
            // Handle error
            console.error('Error:', error);
            alert('Error: ' + error.message);
            
            // Hide progress bar
            uploadProgress.style.display = 'none';
        });
    }
    
    console.log('Upload page initialization complete');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.upload-section')) {
        console.log('Upload section found, initializing...');
        initUploadPage();
    }
});

// Also expose as global function
window.initBasicUploadPage = initUploadPage;