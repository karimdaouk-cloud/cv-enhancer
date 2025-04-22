/**
 * CV Enhancer - Main JavaScript
 * Entry point that initializes the appropriate page functionality
 */

// Global state that can be shared across modules
window.CVEnhancer = {
    state: {
        currentFile: null,
        cvData: {},
        currentTemplate: 'professional',
        paperSize: 'a4'
    }
};

// Page transition effect - initialize animations
function initPageAnimations() {
    // Create page transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Add animation classes to hero elements
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    const floatingElements = document.querySelectorAll('.floating-element');
    
    if (heroContent) {
        heroContent.querySelector('h2').classList.add('animate-fade-in');
        heroContent.querySelector('p').classList.add('animate-fade-in', 'delay-100');
        const heroButtons = heroContent.querySelector('.hero-buttons');
        if (heroButtons) {
            heroButtons.classList.add('animate-fade-in', 'delay-200');
        }
    }
    
    if (heroImage) {
        const mainImage = heroImage.querySelector('.main-image');
        if (mainImage) {
            mainImage.classList.add('animate-fade-in', 'delay-300');
        }
    }
    
    if (floatingElements.length) {
        floatingElements.forEach((el, index) => {
            el.classList.add('animate-fade-in', `delay-${(index + 4) * 100}`);
        });
    }
    
    // Scroll reveal animations
    const scrollRevealElements = document.querySelectorAll('.feature-card, .template-card, .process-step, .section-container');
    scrollRevealElements.forEach(el => {
        el.classList.add('scroll-reveal');
    });
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Reveal elements on scroll
    function revealOnScroll() {
        scrollRevealElements.forEach(el => {
            if (isInViewport(el)) {
                el.classList.add('revealed');
            }
        });
    }
    
    // Check on initial load
    revealOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', revealOnScroll);
    
    // Remove overlay after a short delay
    setTimeout(() => {
        overlay.classList.add('loaded');
        
        // Remove from DOM after transition ends
        overlay.addEventListener('transitionend', () => {
            overlay.remove();
        });
                }, 500);
}

// Initialize file upload functionality
function initBasicUploadPage() {
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
    
    // Function to handle selected file
    function handleFile(file) {
        if (!file) return;
        
        // Reset previous upload
        if (uploadProgress.style.display === 'block') {
            uploadProgress.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }
        
        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            console.log('Error: Please upload a PDF file');
            return;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            console.log('Error: File size exceeds 5MB limit');
            return;
        }
        
        // Update file info
        window.CVEnhancer.state.currentFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'flex';
        uploadButton.disabled = false;
        
        console.log('File ready to upload');
    }
    
    // Format file size to readable format
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Handle file input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            handleFile(e.target.files[0]);
        });
    }
    
    // Handle drag and drop events
    if (dropArea) {
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
        
        dropArea.addEventListener('drop', function(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            handleFile(file);
        });
        
        // Make entire document a drop target
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, preventDefaults, false);
        });
        
        document.addEventListener('drop', function(e) {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            handleFile(file);
        });
    }
    
    // Handle remove file
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', function() {
            window.CVEnhancer.state.currentFile = null;
            fileInfo.style.display = 'none';
            fileInput.value = '';
            uploadButton.disabled = true;
            console.log('File removed');
        });
    }
    
    // Handle upload button
    if (uploadButton) {
        console.log('Upload button found, attaching click event');
        uploadButton.addEventListener('click', function() {
            console.log('Upload button clicked', window.CVEnhancer.state.currentFile);
            if (!window.CVEnhancer.state.currentFile) {
                console.log('Error: Please select a file first');
                return;
            }
            
            // Show progress
            uploadProgress.style.display = 'block';
            
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                progressFill.style.width = progress + '%';
                progressText.textContent = progress + '%';
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    console.log('Upload complete! Processing your CV...');
                    
                    // Redirect to editor page with more reliable methods
                    console.log('Upload complete, preparing to redirect from main.js...');
                    try {
                        console.log('Redirecting via window.location.href...');
                        window.location.href = './editor.html';
                        
                        // If that doesn't immediately work, try the assign method
                        setTimeout(function() {
                            console.log('Trying window.location.assign...');
                            window.location.assign('./editor.html');
                            
                            // Last resort - try with full absolute path
                            setTimeout(function() {
                                console.log('Trying with absolute path...');
                                window.location = window.location.origin + '/editor.html';
                            }, 500);
                        }, 500);
                    } catch (e) {
                        console.error('Error redirecting:', e);
                    }
                }
            }, 100);
        });
    } else {
        console.error('Upload button not found!');
    }
}

// Initialize editor page functionality
function initEditorPage() {
    // Tab navigation
    const sectionTabs = document.querySelectorAll('.section-tabs li');
    const sectionContainers = document.querySelectorAll('.section-container');
    
    if (sectionTabs.length) {
        sectionTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                
                // Remove active class from all tabs and sections
                sectionTabs.forEach(t => t.classList.remove('active'));
                sectionContainers.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding section
                this.classList.add('active');
                document.getElementById(sectionId).classList.add('active');
            });
        });
    }
    
    // Template selection
    const templateOptions = document.querySelectorAll('.template-option');
    
    if (templateOptions.length) {
        templateOptions.forEach(option => {
            option.addEventListener('click', function() {
                const templateId = this.getAttribute('data-template');
                
                // Remove active class from all options
                templateOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked option
                this.classList.add('active');
                
                // Update current template
                window.CVEnhancer.state.currentTemplate = templateId;
            });
        });
    }
    
    // Toggle between original and AI enhanced content
    const toggleButtons = document.querySelectorAll('.btn-tab');
    
    if (toggleButtons.length) {
        toggleButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const parent = this.closest('.form-group');
                
                if (parent) {
                    // Remove active class from all buttons and content containers
                    parent.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('active'));
                    parent.querySelectorAll('.content-container').forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    parent.querySelector(`#${targetId}`).classList.add('active');
                }
            });
        });
    }
    
    // Add experience item
    const addExperienceBtn = document.getElementById('addExperience');
    const experienceItems = document.getElementById('experienceItems');
    
    if (addExperienceBtn && experienceItems) {
        addExperienceBtn.addEventListener('click', function() {
            const itemCount = experienceItems.querySelectorAll('.experience-item').length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'experience-item';
            newItem.innerHTML = `
                <div class="item-header">
                    <h3>Experience #${itemCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Job Title</label>
                        <input type="text" class="form-control job-title">
                    </div>
                    <div class="form-group">
                        <label>Company</label>
                        <input type="text" class="form-control company-name">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="month" class="form-control start-date">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="month" class="form-control end-date">
                        <div class="checkbox-group">
                            <input type="checkbox" id="current-job-${itemCount}">
                            <label for="current-job-${itemCount}">I currently work here</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control job-description" rows="4"></textarea>
            </div>
        `;
            
            experienceItems.appendChild(newItem);
            
            // Add event listener to new remove button
            const removeBtn = newItem.querySelector('.btn-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    experienceItems.removeChild(newItem);
                    updateExperienceTitles();
                });
            }
            
            // Add event listener to current job checkbox
            const currentJobCheckbox = newItem.querySelector('input[type="checkbox"]');
            if (currentJobCheckbox) {
                currentJobCheckbox.addEventListener('change', function() {
                    const endDateInput = newItem.querySelector('.end-date');
                    endDateInput.disabled = this.checked;
                    if (this.checked) {
                        endDateInput.value = '';
                    }
                });
            }
        });
        
        // Function to update experience item titles
        function updateExperienceTitles() {
            const items = experienceItems.querySelectorAll('.experience-item');
            items.forEach((item, index) => {
                item.querySelector('h3').textContent = `Experience #${index + 1}`;
            });
        }
    }
    
    // Add education item
    const addEducationBtn = document.getElementById('addEducation');
    const educationItems = document.getElementById('educationItems');
    
    if (addEducationBtn && educationItems) {
        addEducationBtn.addEventListener('click', function() {
            const itemCount = educationItems.querySelectorAll('.education-item').length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'education-item';
            newItem.innerHTML = `
                <div class="item-header">
                    <h3>Education #${itemCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Degree</label>
                        <input type="text" class="form-control degree">
                    </div>
                    <div class="form-group">
                        <label>Institution</label>
                        <input type="text" class="form-control institution">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="month" class="form-control edu-start-date">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="month" class="form-control edu-end-date">
                        <div class="checkbox-group">
                            <input type="checkbox" id="currentEdu-${itemCount}" class="current-edu">
                            <label for="currentEdu-${itemCount}">I'm currently studying here</label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description (Optional)</label>
                    <textarea class="form-control edu-description" rows="2" placeholder="Relevant coursework, achievements, etc."></textarea>
            </div>
        `;
            
            educationItems.appendChild(newItem);
            
            // Add event listener to new remove button
            const removeBtn = newItem.querySelector('.btn-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    educationItems.removeChild(newItem);
                    updateEducationTitles();
                });
            }
            
            // Add event listener to current education checkbox
            const currentEduCheckbox = newItem.querySelector('.current-edu');
            if (currentEduCheckbox) {
                currentEduCheckbox.addEventListener('change', function() {
                    const endDateInput = newItem.querySelector('.edu-end-date');
                    endDateInput.disabled = this.checked;
                    if (this.checked) {
                        endDateInput.value = '';
                    }
                });
            }
        });
        
        // Function to update education item titles
        function updateEducationTitles() {
            const items = educationItems.querySelectorAll('.education-item');
            items.forEach((item, index) => {
                item.querySelector('h3').textContent = `Education #${index + 1}`;
            });
        }
    }
    
    // Add certification item
    const addCertificationBtn = document.getElementById('addCertification');
    const certificationItems = document.getElementById('certificationItems');
    
    if (addCertificationBtn && certificationItems) {
        addCertificationBtn.addEventListener('click', function() {
            const itemCount = certificationItems.querySelectorAll('.certification-item').length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'certification-item';
            newItem.innerHTML = `
                <div class="item-header">
                    <h3>Certification #${itemCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Certification Name</label>
                        <input type="text" class="form-control cert-name">
                    </div>
                    <div class="form-group">
                        <label>Issuing Organization</label>
                        <input type="text" class="form-control cert-org">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="month" class="form-control cert-date">
                    </div>
                    <div class="form-group">
                        <label>Expiration Date (Optional)</label>
                        <input type="month" class="form-control cert-expiry">
                        <div class="checkbox-group">
                            <input type="checkbox" id="noCertExpiry-${itemCount}" class="no-expiry">
                            <label for="noCertExpiry-${itemCount}">No expiration date</label>
                    </div>
                </div>
            </div>
        `;
            
            certificationItems.appendChild(newItem);
            
            // Add event listener to new remove button
            const removeBtn = newItem.querySelector('.btn-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    certificationItems.removeChild(newItem);
                    updateCertificationTitles();
                });
            }
            
            // Add event listener to no expiry checkbox
            const noExpiryCheckbox = newItem.querySelector('.no-expiry');
            if (noExpiryCheckbox) {
                noExpiryCheckbox.addEventListener('change', function() {
                    const expiryInput = newItem.querySelector('.cert-expiry');
                    expiryInput.disabled = this.checked;
                    if (this.checked) {
                        expiryInput.value = '';
                    }
                });
            }
        });
        
        // Function to update certification item titles
        function updateCertificationTitles() {
            const items = certificationItems.querySelectorAll('.certification-item');
            items.forEach((item, index) => {
                item.querySelector('h3').textContent = `Certification #${index + 1}`;
            });
        }
    }
    
    // Add language item
    const addLanguageBtn = document.getElementById('addLanguage');
    const languageItems = document.getElementById('languageItems');
    
    if (addLanguageBtn && languageItems) {
        addLanguageBtn.addEventListener('click', function() {
            const itemCount = languageItems.querySelectorAll('.language-item').length + 1;
            
            const newItem = document.createElement('div');
            newItem.className = 'language-item';
            newItem.innerHTML = `
                <div class="item-header">
                    <h3>Language #${itemCount}</h3>
                    <div class="item-actions">
                        <button class="btn btn-small btn-move"><i class="fas fa-arrows-alt"></i></button>
                        <button class="btn btn-small btn-remove"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Language</label>
                        <input type="text" class="form-control language-name">
                    </div>
                    <div class="form-group">
                        <label>Proficiency Level</label>
                        <select class="form-control proficiency-level">
                            <option value="Native">Native</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Basic">Basic</option>
                        </select>
                </div>
            </div>
        `;
            
            languageItems.appendChild(newItem);
            
            // Add event listener to new remove button
            const removeBtn = newItem.querySelector('.btn-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    languageItems.removeChild(newItem);
                    updateLanguageTitles();
                });
            }
        });
        
        // Function to update language item titles
        function updateLanguageTitles() {
            const items = languageItems.querySelectorAll('.language-item');
            items.forEach((item, index) => {
                item.querySelector('h3').textContent = `Language #${index + 1}`;
            });
        }
    }
    
    // Preview CV
    const previewButton = document.getElementById('previewButton');
    const previewPanel = document.querySelector('.preview-panel');
    const closePreviewButton = document.querySelector('#closePreview');
    
    if (previewButton && previewPanel) {
        previewButton.addEventListener('click', function() {
            previewPanel.classList.add('active');
            generatePreview();
        });
        
        if (closePreviewButton) {
            closePreviewButton.addEventListener('click', function() {
                previewPanel.classList.remove('active');
            });
        }
    }
    
    // AI Enhancement button
    const aiEnhanceButtons = document.querySelectorAll('#aiEnhanceButton, .btn-ai-enhance');
    
    if (aiEnhanceButtons.length) {
        aiEnhanceButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Show loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.className = 'loading-overlay active';
                loadingOverlay.innerHTML = `
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <h3>Enhancing your content with AI...</h3>
                        <p>This may take a few moments</p>
            </div>
        `;
                document.body.appendChild(loadingOverlay);
                
                // Simulate AI processing
                setTimeout(() => {
                    // Remove loading overlay
                    document.body.removeChild(loadingOverlay);
                    
                    // Update enhanced content
                    const enhancedContainers = document.querySelectorAll('.ai-suggestion .suggestion-content');
                    enhancedContainers.forEach(container => {
                        // Get the original content from the corresponding textarea
                        const section = container.closest('.section-container');
                        const textarea = section.querySelector('textarea');
                        if (textarea) {
                            const originalContent = textarea.value;
                            
                            // Generate enhanced content (this would be done by AI in a real application)
                            let enhancedContent = 'AI improved version: ';
                            if (originalContent) {
                                enhancedContent += originalContent.trim();
                                // Make it more professional sounding by adding some improved phrases
                                enhancedContent = enhancedContent.replace(/worked on/g, 'successfully delivered')
                                                  .replace(/helped/g, 'collaborated with key stakeholders')
                                                  .replace(/made/g, 'developed and implemented')
                                                  .replace(/did/g, 'executed');
                            } else {
                                enhancedContent += 'Please add some content to enhance.';
                            }
                            
                            container.textContent = enhancedContent;
                        }
                    });
                    
                    // Activate AI tab for each section
                    const aiTabs = document.querySelectorAll('.btn-tab[data-target*="enhanced"]');
                    aiTabs.forEach(tab => tab.click());
                    
                    // Show AI enhancement toast notification
                    showToast('AI enhancement complete!', 'success');
                }, 2000);
            });
        });
    }
    
    // Accept AI suggestions
    const acceptButtons = document.querySelectorAll('.btn-accept');
    
    if (acceptButtons.length) {
        acceptButtons.forEach(button => {
            button.addEventListener('click', function() {
                const suggestionContent = this.closest('.ai-suggestion').querySelector('.suggestion-content');
                const section = this.closest('.section-container');
                const textarea = section.querySelector('textarea');
                
                if (suggestionContent && textarea) {
                    textarea.value = suggestionContent.textContent;
                    
                    // Switch back to original tab
                    const originalTab = section.querySelector('.btn-tab[data-target*="original"]');
                    if (originalTab) {
                        originalTab.click();
                    }
                    
                    // Show toast notification
                    showToast('AI suggestion applied!', 'success');
                }
            });
        });
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Function to generate preview
    function generatePreview() {
        // In a real app, this would generate the actual CV based on the user's data
        // For this demo, we'll just simulate it
        const previewFrame = document.getElementById('previewFrame');
        if (previewFrame) {
            // Show loading state
            previewFrame.srcdoc = `
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            color: #333;
                        }
                        .loading {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            text-align: center;
                        }
                        .spinner {
                            border: 4px solid #f3f3f3;
                            border-top: 4px solid #3f51b5;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 20px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </head>
                <body>
                    <div class="loading">
                    <div>
                            <div class="spinner"></div>
                            <p>Generating preview...</p>
                    </div>
                    </div>
                </body>
                </html>
            `;
            
            // After a delay, generate actual preview
            setTimeout(() => {
                // Collect data from form fields
                const fullName = document.getElementById('fullName')?.value || 'John Doe';
                const email = document.getElementById('email')?.value || 'john.doe@example.com';
                const phone = document.getElementById('phone')?.value || '+1 (555) 123-4567';
                const location = document.getElementById('location')?.value || 'New York, NY';
                const summary = document.getElementById('professionalSummary')?.value || 'Experienced professional with a track record of success...';
                
                // Generate HTML for the template (simplified version)
                const templateHtml = `
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: ${window.CVEnhancer.state.currentTemplate === 'modern' ? 
                                    "'Segoe UI', Roboto, sans-serif" : 
                                    (window.CVEnhancer.state.currentTemplate === 'executive' ? 
                                    "'Georgia', serif" : "'Arial', sans-serif")};
                                margin: 0;
                                padding: 20px;
                                color: #333;
                                line-height: 1.5;
                                background-color: ${window.CVEnhancer.state.currentTemplate === 'modern' ? '#fafafa' : '#fff'};
                            }
                            
                            .cv-container {
                                max-width: 800px;
                                margin: 0 auto;
                                background: white;
                                ${window.CVEnhancer.state.currentTemplate === 'modern' ? 'box-shadow: 0 3px 10px rgba(0,0,0,0.1);' : ''}
                                ${window.CVEnhancer.state.currentTemplate === 'executive' ? 'border: 1px solid #d4d4d4;' : ''}
                            }
                            
                            .header {
                                background-color: ${
                                    window.CVEnhancer.state.currentTemplate === 'professional' ? '#3f51b5' : 
                                    (window.CVEnhancer.state.currentTemplate === 'modern' ? '#ff5722' : '#2c3e50')
                                };
                                color: white;
                                padding: ${window.CVEnhancer.state.currentTemplate === 'modern' ? '30px' : '20px'};
                                text-align: ${window.CVEnhancer.state.currentTemplate === 'executive' ? 'center' : 'left'};
                            }
                            
                            .name {
                                font-size: 2.5rem;
                                margin: 0;
                                font-weight: ${window.CVEnhancer.state.currentTemplate === 'executive' ? '300' : '700'};
                                letter-spacing: ${window.CVEnhancer.state.currentTemplate === 'modern' ? '-1px' : 'normal'};
                            }
                            
                            .contact-info {
                                margin-top: 10px;
                                display: flex;
                                flex-wrap: wrap;
                                gap: 15px;
                                ${window.CVEnhancer.state.currentTemplate === 'executive' ? 'justify-content: center;' : ''}
                            }
                            
                            .contact-item {
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            }
                            
                            .section {
                                padding: 20px;
                                border-bottom: ${
                                    window.CVEnhancer.state.currentTemplate === 'professional' ? '1px solid #e0e0e0' : 
                                    (window.CVEnhancer.state.currentTemplate === 'modern' ? '2px solid #ff5722' : '1px solid #2c3e50')
                                };
                                margin-bottom: 15px;
                            }
                            
                            .section-title {
                                font-size: 1.5rem;
                                color: ${
                                    window.CVEnhancer.state.currentTemplate === 'professional' ? '#3f51b5' : 
                                    (window.CVEnhancer.state.currentTemplate === 'modern' ? '#ff5722' : '#2c3e50')
                                };
                                margin-top: 0;
                                margin-bottom: 15px;
                                ${window.CVEnhancer.state.currentTemplate === 'executive' ? 'text-align: center;' : ''}
                            }
                            
                            .summary {
                                line-height: 1.6;
                            }
                            
                            .experience-item, .education-item {
                                margin-bottom: 20px;
                            }
                            
                            .job-title, .degree {
                                font-weight: bold;
                                margin-bottom: 5px;
                                color: ${
                                    window.CVEnhancer.state.currentTemplate === 'professional' ? '#333' : 
                                    (window.CVEnhancer.state.currentTemplate === 'modern' ? '#ff5722' : '#2c3e50')
                                };
                            }
                            
                            .company, .school {
                                font-weight: ${window.CVEnhancer.state.currentTemplate === 'modern' ? 'bold' : 'normal'};
                            }
                            
                            .date {
                                color: #666;
                                font-style: ${window.CVEnhancer.state.currentTemplate === 'executive' ? 'italic' : 'normal'};
                            }
                            
                            .job-description {
                                margin-top: 10px;
                            }
                            
                            .skills-list {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                            }
                            
                            .skill {
                                background-color: ${
                                    window.CVEnhancer.state.currentTemplate === 'professional' ? '#e8eaf6' : 
                                    (window.CVEnhancer.state.currentTemplate === 'modern' ? '#ffccbc' : '#f5f5f5')
                                };
                                padding: 5px 10px;
                                border-radius: 3px;
                                font-size: 0.9rem;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="cv-container">
                            <div class="header">
                                <h1 class="name">${fullName}</h1>
                                <div class="contact-info">
                                    <div class="contact-item">
                                        <span>${email}</span>
                    </div>
                                    <div class="contact-item">
                                        <span>${phone}</span>
                </div>
                                    <div class="contact-item">
                                        <span>${location}</span>
            </div>
                    </div>
                </div>
                            
                            <div class="section">
                                <h2 class="section-title">Professional Summary</h2>
                                <div class="summary">
                                    ${summary}
            </div>
                            </div>
                            
                            <div class="section">
                                <h2 class="section-title">Work Experience</h2>
                                <div class="experience-item">
                                    <div class="job-title">Senior Software Developer</div>
                                    <div class="company">Tech Innovations Inc.</div>
                                    <div class="date">January 2020 - Present</div>
                                    <div class="job-description">
                                        Led development of cloud-based applications, resulting in 35% increase in efficiency. Mentored junior developers and implemented agile methodologies.
                    </div>
                </div>
                                <div class="experience-item">
                                    <div class="job-title">Software Developer</div>
                                    <div class="company">Digital Solutions LLC</div>
                                    <div class="date">June 2017 - December 2019</div>
                                    <div class="job-description">
                                        Developed and maintained web applications using modern JavaScript frameworks. Collaborated with design team to implement responsive UI components.
            </div>
                                </div>
                            </div>
                            
                            <div class="section">
            <h2 class="section-title">Education</h2>
                                <div class="education-item">
                                    <div class="degree">Master of Computer Science</div>
                                    <div class="school">University of Technology</div>
                                    <div class="date">2015 - 2017</div>
                    </div>
                                <div class="education-item">
                                    <div class="degree">Bachelor of Science in Computer Engineering</div>
                                    <div class="school">State University</div>
                                    <div class="date">2011 - 2015</div>
                </div>
            </div>
                            
                            <div class="section">
                                <h2 class="section-title">Skills</h2>
                    <div class="skills-list">
                                    <div class="skill">JavaScript</div>
                                    <div class="skill">React</div>
                                    <div class="skill">Node.js</div>
                                    <div class="skill">CSS/SCSS</div>
                                    <div class="skill">Git</div>
                                    <div class="skill">Agile/Scrum</div>
                                    <div class="skill">AWS</div>
                                    <div class="skill">Python</div>
                                    <div class="skill">RESTful APIs</div>
                                    <div class="skill">SQL</div>
                    </div>
                </div>
                    </div>
                    </body>
                    </html>
                `;
                
                previewFrame.srcdoc = templateHtml;
            }, 1000);
        }
    }
    
    // Download CV button
    const downloadButton = document.getElementById('downloadButton');
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            // In a real app, this would generate a PDF for download
            // For this demo, we'll just show a toast notification
            showToast('Your CV has been downloaded!', 'success');
        });
    }
}

// Skills functionality
const skillInput = document.getElementById('skillInput');
const addSkillBtn = document.getElementById('addSkillBtn');
const skillTags = document.getElementById('skillTags');
const suggestedSkills = document.getElementById('suggestedSkills');
const generateSkillsBtn = document.getElementById('generateSkillsBtn');

// Initialize skill sets
const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'SQL',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
    'Project Management', 'Leadership', 'Communication',
    'Problem Solving', 'Teamwork', 'Time Management',
    'Microsoft Office', 'Adobe Creative Suite',
    'Data Analysis', 'Machine Learning', 'UI/UX Design'
];

// Function to add skill
function addSkill(skillName) {
    if (!skillName.trim()) return;
    
    // Check if skill already exists
    const existingSkills = Array.from(skillTags.querySelectorAll('.skill-tag span')).map(span => span.textContent.toLowerCase());
    if (existingSkills.includes(skillName.toLowerCase())) {
        showToast('This skill already exists', 'warning');
        return;
    }
    
    // Create skill tag
    const skillTag = document.createElement('div');
    skillTag.className = 'skill-tag';
    skillTag.innerHTML = `
        <span>${skillName}</span>
        <button class="remove-skill" aria-label="Remove skill">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add event listener for remove button
    const removeBtn = skillTag.querySelector('.remove-skill');
    removeBtn.addEventListener('click', function() {
        skillTags.removeChild(skillTag);
    });
    
    // Add to DOM
    skillTags.appendChild(skillTag);
    
    // Clear input
    if (skillInput) {
        skillInput.value = '';
        skillInput.focus();
    }
}

if (skillInput && addSkillBtn) {
    // Add skill on button click
    addSkillBtn.addEventListener('click', function() {
        addSkill(skillInput.value);
    });
    
    // Add skill on Enter key
    skillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(skillInput.value);
        }
    });
}

// Handle suggested skills
if (suggestedSkills) {
    // Initialize with sample suggested skills
    const addSuggestionButtons = document.querySelectorAll('.btn-add-suggestion');
    
    addSuggestionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const skillName = this.closest('.skill-suggestion').querySelector('span').textContent;
            addSkill(skillName);
            
            // Remove from suggestions
            this.closest('.skill-suggestion').remove();
        });
    });
}

// Generate AI skill suggestions
if (generateSkillsBtn) {
    generateSkillsBtn.addEventListener('click', function() {
        // Clear existing suggestions
        suggestedSkills.innerHTML = '';
        
        // Show loading animation
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-content';
        loadingElement.innerHTML = `
            <div class="spinner" style="width: 30px; height: 30px;"></div>
            <p>Generating suggestions...</p>
        `;
        suggestedSkills.appendChild(loadingElement);
        
        // Simulate AI processing
        setTimeout(() => {
            // Remove loading
            suggestedSkills.removeChild(loadingElement);
            
            // Get existing skills to avoid duplicates
            const existingSkills = Array.from(skillTags.querySelectorAll('.skill-tag span')).map(span => span.textContent.toLowerCase());
            
            // Generate random skills that aren't already added
            const availableSkills = commonSkills.filter(skill => !existingSkills.includes(skill.toLowerCase()));
            const shuffled = availableSkills.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 5); // Get 5 random skills
            
            // Add to suggestions
            selected.forEach(skill => {
                const skillSuggestion = document.createElement('div');
                skillSuggestion.className = 'skill-suggestion';
                skillSuggestion.innerHTML = `
                    <span>${skill}</span>
                    <button class="btn btn-small btn-add-suggestion"><i class="fas fa-plus"></i></button>
                `;
                
                // Add event listener for add button
                const addBtn = skillSuggestion.querySelector('.btn-add-suggestion');
                addBtn.addEventListener('click', function() {
                    addSkill(skill);
                    suggestedSkills.removeChild(skillSuggestion);
                });
                
                suggestedSkills.appendChild(skillSuggestion);
            });
            
            showToast('AI skill suggestions generated', 'success');
        }, 1500);
    });
}

// Initialize the application when document is ready
$(document).ready(function() {
    // Make toast function globally available
    window.CVEnhancer.showToast = showToast;
    
    // Add CSS for toast notifications
    const toastStyles = document.createElement('style');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #333;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .toast-success {
            background-color: #4caf50;
        }
        
        .toast-error {
            background-color: #f44336;
        }
        
        .toast-info {
            background-color: #2196f3;
        }
    `;
    document.head.appendChild(toastStyles);
    
    // Initialize page animations
    initPageAnimations();
    
    // Initialize appropriate page functionality
    if ($('.upload-section').length > 0) {
        // We're on the upload page
        initBasicUploadPage();
    } else if ($('.editor-page').length > 0) {
        // We're on the editor page
        initEditorPage();
    }
});