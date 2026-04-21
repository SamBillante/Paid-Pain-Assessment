/**
 * Pain Assessment Intake Form - JavaScript
 * Refactored to avoid long-term storage of form data.
 * Data is collected only at submission time and sent via EmailJS.
 */

// ==============================================================================
// EMAILJS CONFIGURATION
// ==============================================================================
// Replace these with your actual EmailJS credentials from emailjs.com
const EMAILJS_CONFIG = {
    publicKey: 'QSHhS2k1y5xW4eKmm',
    serviceId: 'service_pzvgdz8',
    templateId: 'template_uhhy7rd'
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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

function validateField(fieldName, value) {
    const rules = validationRules[fieldName];

    if (!rules) return { valid: true };

    if (rules.required && !value) {
        return {
            valid: false,
            message: rules.message || `${capitalize(fieldName)} is required`
        };
    }

    if (!value) return { valid: true };

    if (rules.minLength && value.length < rules.minLength) {
        return {
            valid: false,
            message: rules.message || `Minimum ${rules.minLength} characters required`
        };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        return {
            valid: false,
            message: rules.message || `Maximum ${rules.maxLength} characters allowed`
        };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        return {
            valid: false,
            message: rules.message
        };
    }

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

    if (rules.custom && !rules.custom(value)) {
        return {
            valid: false,
            message: rules.message
        };
    }

    return { valid: true };
}

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

function showAlert(message, type = 'info') {
    let alertElement = document.querySelector('.alert');

    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.className = 'alert';
        const form = document.querySelector('.intake-form');
        if (form) {
            form.insertBefore(alertElement, form.firstChild);
        }
    }

    if (!alertElement) return;

    alertElement.textContent = message;
    alertElement.className = `alert alert-${type} show`;
    alertElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
        alertElement.classList.remove('show');
    }, 5000);
}

function setButtonLoading(button, loading = true) {
    if (!button) return;

    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ==============================================================================
// FORM HANDLING
// ==============================================================================

function collectFormData() {
    const form = document.getElementById('intakeForm');
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (data[key]) {
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    });

    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key] = data[key].join(', ');
        }
    });

    return data;
}

function validateForm() {
    const form = document.getElementById('intakeForm');
    const fields = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    const errors = {};
    const checkedFields = new Set();

    fields.forEach(field => {
        if (!field.name) return;

        if (checkedFields.has(field.name)) {
            return;
        }

        let value = field.value.trim();

        if ((field.type === 'checkbox' || field.type === 'radio') && field.name) {
            const inputs = form.querySelectorAll(`[name="${field.name}"]`);
            checkedFields.add(field.name);

            if (validationRules[field.name]?.required) {
                const isChecked = Array.from(inputs).some(input => input.checked);
                value = isChecked ? 'selected' : '';
            } else {
                const isChecked = Array.from(inputs).some(input => input.checked);
                value = isChecked ? 'selected' : '';
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

async function handleFormSubmit(event) {
    event.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
        showAlert('Please fix the errors above', 'error');
        return;
    }

    const data = collectFormData();

    data.submitted_at = new Date().toISOString();
    data.user_agent = navigator.userAgent;

    const submitBtn = document.querySelector('#intakeForm [type="submit"]');
    setButtonLoading(submitBtn, true);

    try {
        if (!window.emailjs) {
            throw new Error('EmailJS library is not loaded.');
        }

        if (
            !EMAILJS_CONFIG.publicKey ||
            !EMAILJS_CONFIG.serviceId ||
            !EMAILJS_CONFIG.templateId
        ) {
            throw new Error('EmailJS configuration is incomplete.');
        }

        emailjs.init(EMAILJS_CONFIG.publicKey);

        const emailParams = {
            to_email: 'goode@naturalleegoode.com',
            from_name: data.fullName || 'Unknown',
            from_email: data.email || 'Not provided',
            phone: data.phone || 'Not provided',
            body_area: data.selectedBodyArea || 'Not selected',
            pain_side: data.painSide || 'Not specified',
            pain_duration: data.painDuration || 'Not specified',
            discomfort_type: data.discomfortType || 'Not specified',
            pain_level: data.painLevel || 'Not specified',
            triggers: data.triggers || 'None specified',
            notes: data.notes || 'No notes provided',
            wellness_goal: data.wellnessGoal || 'Not specified',
            consultation_preference: data.consultationPreference || 'Not specified',
            product_interest: data.productInterest || 'Not specified',
            submitted_at: data.submitted_at
        };

        await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            emailParams
        );

        showAlert('Form submitted successfully!', 'success');

        const form = document.getElementById('intakeForm');
        const thankYouMsg = document.getElementById('thankYouMessage');

        if (form && thankYouMsg) {
            form.style.display = 'none';
            thankYouMsg.style.display = 'block';
            thankYouMsg.classList.add('show');

            populateConfirmationScreen(data);
            thankYouMsg.scrollIntoView({ behavior: 'smooth' });
        }

        // Clear visible form fields after successful submission.
        // No data is persisted locally.
        if (form) {
            form.reset();
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

function populateConfirmationScreen(data) {
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryPhone = document.getElementById('summaryPhone');
    const summaryPainLevel = document.getElementById('summaryPainLevel');
    const summaryWellnessGoal = document.getElementById('summaryWellnessGoal');
    const summarySessions = document.getElementById('summarySessions');

    if (summaryName) {
        summaryName.textContent = data.fullName || 'Not provided';
    }

    if (summaryEmail) {
        summaryEmail.textContent = data.email || 'Not provided';
    }

    if (summaryPhone) {
        summaryPhone.textContent = data.phone || 'Not provided';
    }

    const painLevel = data.painLevel || 'Not provided';
    const painDisplay =
        painLevel !== 'Not provided'
            ? `${painLevel}/10 ${getPainLevelEmoji(painLevel)}`
            : 'Not provided';

    if (summaryPainLevel) {
        summaryPainLevel.textContent = painDisplay;
    }

    const goalsList = data.wellnessGoal
        ? data.wellnessGoal
              .split(', ')
              .map(g => g.charAt(0).toUpperCase() + g.slice(1))
              .join(', ')
        : 'Not provided';

    if (summaryWellnessGoal) {
        summaryWellnessGoal.textContent = goalsList;
    }

    const sessionMap = {
        'quick-check': 'Quick Pain Check (15 minutes)',
        'movement-relief': 'Movement & Relief Session (30 minutes)',
        'full-assessment': 'Full Wellness Assessment (60 minutes)'
    };

    const sessionDisplay =
        sessionMap[data.consultationPreference] ||
        data.consultationPreference ||
        'Not provided';

    if (summarySessions) {
        summarySessions.textContent = sessionDisplay;
    }

    initializeCalendly();
}

function getPainLevelEmoji(painLevel) {
    const level = parseInt(painLevel, 10);
    if (level === 0) return '😊';
    if (level <= 2) return '🙂';
    if (level <= 4) return '😐';
    if (level <= 6) return '😟';
    if (level <= 8) return '😣';
    return '😫';
}

function initializeCalendly() {
    const CALENDLY_URL = 'https://calendly.com/goode-naturalleegoode/ortho-pain-assessment-call';

    const container = document.getElementById('calendlyContainer');
    if (!container) return;

    container.innerHTML = '';

    const calDiv = document.createElement('div');
    calDiv.className = 'calendly-inline-widget';
    calDiv.setAttribute('data-url', CALENDLY_URL);
    container.appendChild(calDiv);

    if (!window.Calendly) {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = function () {
            // Widget auto-initializes from data-url
        };
        document.head.appendChild(script);
    }
}

function handleFormReset(event) {
    const confirmed = confirm('Are you sure you want to clear the form?');
    if (!confirmed) {
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

    form.addEventListener('submit', handleFormSubmit);
    form.addEventListener('reset', handleFormReset);

    const fields = form.querySelectorAll('input, select, textarea');

    fields.forEach(field => {
        field.addEventListener('blur', () => {
            let value;

            if (field.type === 'checkbox' || field.type === 'radio') {
                const inputs = form.querySelectorAll(`[name="${field.name}"]`);
                const isChecked = Array.from(inputs).some(input => input.checked);
                value = isChecked ? 'selected' : '';
            } else {
                value = field.value.trim();
            }

            const validation = validateField(field.name, value);

            if (validation.valid) {
                clearFieldError(field.name);
            } else {
                showFieldError(field.name, validation.message);
            }
        });
    });

    const painLevelSlider = document.getElementById('painLevel');
    const painLevelValue = document.getElementById('painLevelValue');

    if (painLevelSlider && painLevelValue) {
        painLevelSlider.addEventListener('input', e => {
            painLevelValue.textContent = e.target.value;
        });
    }

    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('blur', e => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }
});