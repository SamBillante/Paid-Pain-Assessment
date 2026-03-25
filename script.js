/**
 * Pain Assessment Intake Form - JavaScript
 * Handles form validation, database connectivity, and form submission
 */

// ==============================================================================
// CONFIGURATION
// ==============================================================================

/**
 * Update these with your Supabase credentials
 * Replace 'your-project' with your actual Supabase project ID
 */
const SUPABASE_CONFIG = {
    
};

// Table name in Supabase
const TABLE_NAME = 'pain_assessments';

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
    submissions: 'intakeForm_submissions',
    draftForm: 'intakeForm_draft'
};

// ==============================================================================
// FORM VALIDATION RULES
// ==============================================================================

const validationRules = {
    fullName: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: 'Please enter a valid name'
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
    },
    phone: {
        required: true,
        pattern: /^[\d\s\-\(\)\+\.]+$/,
        minLength: 10,
        message: 'Please enter a valid phone number'
    },
    painLevel: {
        required: true,
        message: 'Please rate your pain level'
    },
    wellnessGoal: {
        required: true,
        message: 'Please select at least one wellness goal'
    },
    consultationPreference: {
        required: true,
        message: 'Please select a consultation preference'
    },
    disclaimerAgreement: {
        required: true,
        message: 'You must agree to the disclaimer to proceed'
    }
};

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format phone number for display
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

/**
 * Validate a single field
 */
function validateField(fieldName, value) {
    const rules = validationRules[fieldName];
    
    if (!rules) return { valid: true };
    
    // Check if required
    if (rules.required && !value) {
        return {
            valid: false,
            message: rules.message || `${capitalize(fieldName)} is required`
        };
    }
    
    // If field is empty and not required, it's valid
    if (!value) return { valid: true };
    
    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
        return {
            valid: false,
            message: rules.message || `Minimum ${rules.minLength} characters required`
        };
    }
    
    // Check maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
        return {
            valid: false,
            message: rules.message || `Maximum ${rules.maxLength} characters allowed`
        };
    }
    
    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
        return {
            valid: false,
            message: rules.message
        };
    }
    
    // Check min/max for numbers
    if (rules.min !== undefined && parseFloat(value) < rules.min) {
        return {
            valid: false,
            message: rules.message || `Must be at least ${rules.min}`
        };
    }
    
    if (rules.max !== undefined && parseFloat(value) > rules.max) {
        return {
            valid: false,
            message: rules.message || `Must be no more than ${rules.max}`
        };
    }
    
    // Check custom validation
    if (rules.custom && !rules.custom(value)) {
        return {
            valid: false,
            message: rules.message
        };
    }
    
    return { valid: true };
}

/**
 * Show error message for a field
 */
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.classList.add('error');
    
    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

/**
 * Clear error message for a field
 */
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    field.classList.remove('error');
    
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    let alertElement = document.querySelector('.alert');
    
    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.className = 'alert';
        const form = document.querySelector('.intake-form');
        form.insertBefore(alertElement, form.firstChild);
    }
    
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type} show`;
    alertElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
    }, 5000);
}

/**
 * Disable all form buttons
 */
function disableFormButtons(disabled = true) {
    const buttons = document.querySelectorAll('.intake-form .btn');
    buttons.forEach(btn => {
        btn.disabled = disabled;
    });
}

/**
 * Set button loading state
 */
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ==============================================================================
// SUPABASE INTEGRATION
// ==============================================================================

/**
 * Initialize Supabase client
 * Note: In production, use official Supabase JavaScript client
 */
class SupabaseClient {
    constructor(url, anonKey) {
        this.url = url;
        this.anonKey = anonKey;
        this.isConfigured = url !== 'https://your-project.supabase.co' && anonKey !== 'your-anon-key-here';
    }
    
    /**
     * Insert a new record
     */
    async insert(table, data) {
        if (!this.isConfigured) {
            console.warn('Supabase not configured. Using localStorage fallback.');
            return this.insertLocal(data);
        }
        
        try {
            const response = await fetch(
                `${this.url}/rest/v1/${table}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.anonKey,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(data)
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit form');
            }
            
            const result = await response.json();
            return { success: true, data: result };
        } catch (error) {
            console.error('Supabase error:', error);
            // Fallback to localStorage
            return this.insertLocal(data);
        }
    }
    
    /**
     * Store submission in localStorage as fallback
     */
    insertLocal(data) {
        try {
            const submissions = JSON.parse(
                localStorage.getItem(STORAGE_KEYS.submissions) || '[]'
            );
            
            const submission = {
                id: Date.now().toString(),
                ...data,
                submitted_at: new Date().toISOString(),
                synced: false
            };
            
            submissions.push(submission);
            localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
            
            console.log('Form submitted to localStorage (pending sync)');
            return { success: true, data: submission, local: true };
        } catch (error) {
            console.error('localStorage error:', error);
            throw error;
        }
    }
    
    /**
     * Get all submissions from localStorage
     */
    getLocalSubmissions() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEYS.submissions) || '[]'
            );
        } catch (error) {
            return [];
        }
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// ==============================================================================
// FORM HANDLING
// ==============================================================================

/**
 * Convert camelCase to snake_case
 */
function camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Collect form data and convert to snake_case for Supabase
 */
function collectFormData() {
    const form = document.getElementById('intakeForm');
    const formData = new FormData(form);
    const data = {};
    
    // Get all form values
    formData.forEach((value, key) => {
        if (data[key]) {
            // Handle multiple values for checkboxes
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });
    
    // Convert checkbox arrays to comma-separated strings
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key] = data[key].join(', ');
        }
    });
    
    // Convert camelCase keys to snake_case for Supabase
    const snakeCaseData = {};
    Object.keys(data).forEach(key => {
        const snakeKey = camelToSnakeCase(key);
        snakeCaseData[snakeKey] = data[key];
    });
    
    // Convert disclaimer_agreement to boolean
    if (snakeCaseData.disclaimer_agreement) {
        snakeCaseData.disclaimer_agreement = snakeCaseData.disclaimer_agreement === 'agree';
    }
    
    return snakeCaseData;
}

/**
 * Save form as draft to localStorage
 */
function saveDraft() {
    try {
        const data = collectFormData();
        localStorage.setItem(STORAGE_KEYS.draftForm, JSON.stringify(data));
        console.log('Form draft saved');
    } catch (error) {
        console.error('Error saving draft:', error);
    }
}

/**
 * Load form from draft
 */
function loadDraft() {
    try {
        const draft = localStorage.getItem(STORAGE_KEYS.draftForm);
        if (!draft) return;
        
        const data = JSON.parse(draft);
        const form = document.getElementById('intakeForm');
        
        Object.keys(data).forEach(key => {
            const field = form.elements[key];
            if (!field) return;
            
            if (field.type === 'checkbox' || field.type === 'radio') {
                const values = data[key].split(', ');
                document.querySelectorAll(`[name="${key}"]`).forEach(input => {
                    input.checked = values.includes(input.value);
                });
            } else {
                field.value = data[key];
            }
        });
        
        console.log('Form draft loaded');
    } catch (error) {
        console.error('Error loading draft:', error);
    }
}

/**
 * Clear form draft
 */
function clearDraft() {
    try {
        localStorage.removeItem(STORAGE_KEYS.draftForm);
        console.log('Form draft cleared');
    } catch (error) {
        console.error('Error clearing draft:', error);
    }
}

/**
 * Validate entire form
 */
function validateForm() {
    const form = document.getElementById('intakeForm');
    const fields = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    const errors = {};
    const checkedFields = new Set();
    
    fields.forEach(field => {
        // Skip duplicate checkbox processing
        if (checkedFields.has(field.name)) {
            return;
        }
        
        let value = field.value.trim();
        
        // For checkboxes and radios, check if at least one is selected
        if ((field.type === 'checkbox' || field.type === 'radio') && field.name) {
            const inputs = form.querySelectorAll(`[name="${field.name}"]`);
            checkedFields.add(field.name);
            
            if (validationRules[field.name]?.required) {
                const isChecked = Array.from(inputs).some(input => input.checked);
                if (!isChecked) {
                    value = '';
                }
            }
        }
        
        const validation = validateField(field.name, value);
        
        if (!validation.valid) {
            isValid = false;
            errors[field.name] = validation.message;
            showFieldError(field.name, validation.message);
        } else {
            clearFieldError(field.name);
        }
    });
    
    return { valid: isValid, errors };
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
        showAlert('Please fix the errors above', 'error');
        return;
    }
    
    // Collect data
    const data = collectFormData();
    
    // Add metadata
    data.submitted_at = new Date().toISOString();
    data.user_agent = navigator.userAgent;
    
    // Disable buttons and show loading state
    const submitBtn = document.querySelector('[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        // Submit to database
        const result = await supabase.insert(TABLE_NAME, data);
        
        if (result.success) {
            // Clear draft
            clearDraft();
            
            // Show success message
            showAlert(
                result.local 
                    ? 'Form submitted! (pending sync with database)'
                    : 'Form submitted successfully!',
                'success'
            );
            
            // Hide form and show confirmation screen
            const form = document.getElementById('intakeForm');
            const thankYouMsg = document.getElementById('thankYouMessage');
            
            if (form && thankYouMsg) {
                form.style.display = 'none';
                thankYouMsg.style.display = 'block';
                thankYouMsg.classList.add('show');
                
                // Populate confirmation screen with submitted data
                populateConfirmationScreen(data);
                
                thankYouMsg.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showAlert(
            'An error occurred while submitting the form. Please try again.',
            'error'
        );
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

/**
 * Populate the confirmation screen with submitted data
 */
function populateConfirmationScreen(data) {
    // Extract first name for greeting
    const firstName = data.fullName ? data.fullName.split(' ')[0] : 'Friend';
    document.getElementById('confirmName').textContent = firstName;
    
    // Populate summary fields
    document.getElementById('summaryName').textContent = data.fullName || 'Not provided';
    document.getElementById('summaryEmail').textContent = data.email || 'Not provided';
    document.getElementById('summaryPhone').textContent = data.phone || 'Not provided';
    
    // Pain level with visualization
    const painLevel = data.painLevel || 'Not provided';
    const painDisplay = painLevel !== 'Not provided' 
        ? `${painLevel}/10 ${getPainLevelEmoji(painLevel)}`
        : 'Not provided';
    document.getElementById('summaryPainLevel').textContent = painDisplay;
    
    // Wellness goals
    const goalsList = data.wellnessGoal 
        ? data.wellnessGoal.split(', ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
        : 'Not provided';
    document.getElementById('summaryWellnessGoal').textContent = goalsList;
    
    // Consultation preference
    const sessionMap = {
        '15min': '15-minute consultation',
        '30min': '30-minute consultation',
        '60min': '60-minute consultation'
    };
    const sessionDisplay = sessionMap[data.consultationPreference] || data.consultationPreference || 'Not provided';
    document.getElementById('summarySessions').textContent = sessionDisplay;
    
    // Initialize Calendly container if URL is configured
    initializeCalendly();
}

/**
 * Get emoji for pain level
 */
function getPainLevelEmoji(painLevel) {
    const level = parseInt(painLevel);
    if (level === 0) return '😊';
    if (level <= 2) return '🙂';
    if (level <= 4) return '😐';
    if (level <= 6) return '😟';
    if (level <= 8) return '😣';
    return '😫';
}

/**
 * Initialize Calendly integration
 * Update CALENDLY_URL in configuration to enable
 */
function initializeCalendly() {
    const CALENDLY_URL = ''; // Set to your Calendly URL, e.g., 'https://calendly.com/yourname/30min'
    
    if (!CALENDLY_URL) {
        // Show placeholder if no URL configured
        return;
    }
    
    const container = document.getElementById('calendlyContainer');
    if (!container) return;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create Calendly container
    const calScriptUrl = `${CALENDLY_URL}?hide_event_type_details=1&hide_gdpr_block=1`;
    
    // Load Calendly script if not already loaded
    if (!window.Calendly) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        document.head.appendChild(script);
    }
    
    // Create Calendly inline widget
    const calDiv = document.createElement('div');
    calDiv.className = 'calendly-inline-widget';
    calDiv.setAttribute('data-url', calScriptUrl);
    calDiv.style.minHeight = '600px';
    container.appendChild(calDiv);
    
    // If Calendly is already loaded, refresh the widget
    if (window.Calendly) {
        setTimeout(() => {
            if (window.Calendly.initInlineWidget) {
                window.Calendly.initInlineWidget({ url: calScriptUrl, parentElement: container });
            }
        }, 100);
    }
}

/**
 * Handle form reset
 */
function handleFormReset(event) {
    if (confirm('Are you sure you want to clear the form?')) {
        clearDraft();
        // Reset will proceed
    } else {
        event.preventDefault();
    }
}

// ==============================================================================
// EVENT LISTENERS
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('intakeForm');
    
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Form reset
    form.addEventListener('reset', handleFormReset);
    
    // Auto-save draft on input
    form.addEventListener('change', saveDraft);
    
    // Load draft if exists
    loadDraft();
    
    // Real-time validation on field blur
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.addEventListener('blur', () => {
            const value = field.type === 'checkbox' 
                ? field.checked 
                : field.value.trim();
            
            const validation = validateField(field.name, value);
            
            if (validation.valid) {
                clearFieldError(field.name);
            } else {
                showFieldError(field.name, validation.message);
            }
        });
    });
    
    // Update pain severity display
    const painLevelSlider = document.getElementById('painLevel');
    const painLevelValue = document.getElementById('painLevelValue');
    
    if (painLevelSlider && painLevelValue) {
        painLevelSlider.addEventListener('input', (e) => {
            painLevelValue.textContent = e.target.value;
        });
    }
    
    // Auto-format phone number
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('blur', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }
});

// ==============================================================================
// SYNC OFFLINE SUBMISSIONS
// ==============================================================================

/**
 * Attempt to sync offline submissions when connection is restored
 */
async function syncOfflineSubmissions() {
    const submissions = supabase.getLocalSubmissions();
    const unsynced = submissions.filter(s => !s.synced);
    
    if (unsynced.length === 0) return;
    
    console.log(`Attempting to sync ${unsynced.length} offline submission(s)...`);
    
    for (const submission of unsynced) {
        try {
            const { id, synced, ...data } = submission;
            const response = await fetch(
                `${SUPABASE_CONFIG.url}/rest/v1/${TABLE_NAME}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_CONFIG.anonKey
                    },
                    body: JSON.stringify(data)
                }
            );
            
            if (response.ok) {
                // Mark as synced
                const allSubmissions = JSON.parse(
                    localStorage.getItem(STORAGE_KEYS.submissions) || '[]'
                );
                const index = allSubmissions.findIndex(s => s.id === id);
                if (index >= 0) {
                    allSubmissions[index].synced = true;
                    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(allSubmissions));
                }
                console.log(`Submission ${id} synced successfully`);
            }
        } catch (error) {
            console.error('Error syncing submission:', error);
        }
    }
}

// Listen for online event
window.addEventListener('online', syncOfflineSubmissions);

// Try to sync on page load
if (navigator.onLine) {
    setTimeout(syncOfflineSubmissions, 1000);
}
