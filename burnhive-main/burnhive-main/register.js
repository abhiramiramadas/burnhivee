document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = 'http://127.0.0.1:5000'; // Local development server
    
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.querySelector('input[name="terms"]');
    
    if (registerForm) {
        // Password strength indicator
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });

        // Form submission
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // Validate inputs
            if (!username || !email || !password || !confirmPassword) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            if (!termsCheckbox.checked) {
                showAlert('You must accept the terms and conditions', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                showAlert('Password must be at least 8 characters', 'error');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Creating Account...</span>';
                
                // Make API request
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('Registration successful! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (error.message.includes('Failed to fetch')) {
                    showAlert('Cannot connect to the server. Please make sure the server is running at http://127.0.0.1:5000', 'error');
                } else {
                    showAlert('An error occurred during registration. Please try again.', 'error');
                }
            } finally {
                // Reset button state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Create Account</span>';
            }
        });
    }
     
   // Password toggle functionality
   const togglePasswords = document.querySelectorAll('.toggle-password');
   togglePasswords.forEach(toggle => {
       toggle.addEventListener('click', function () {
           const passwordInput = this.closest('.input-wrapper').querySelector('input');
           const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
           passwordInput.setAttribute('type', type);

           // Toggle eye icon (if applicable)
           this.classList.toggle('visible');
       });
   });
    
    // Password strength calculation
    function updatePasswordStrength(password) {
        const strengthMeter = document.querySelector('.strength-meter');
        const strengthText = document.querySelector('.strength-text');
        
        if (!password) {
            strengthText.textContent = 'Password strength';
            strengthMeter.querySelectorAll('.strength-segment').forEach(segment => {
                segment.style.backgroundColor = '#e0e0e0';
            });
            return;
        }
        
        // Calculate strength
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^A-Za-z0-9]/)) strength++;
        
        // Update UI
        const segments = strengthMeter.querySelectorAll('.strength-segment');
        segments.forEach((segment, index) => {
            if (index < strength) {
                segment.style.backgroundColor = getStrengthColor(strength);
            } else {
                segment.style.backgroundColor = '#e0e0e0';
            }
        });
        
        strengthText.textContent = getStrengthText(strength);
    }
    
    function getStrengthColor(strength) {
        switch(strength) {
            case 1: return '#ff5252'; // Weak
            case 2: return '#ffb74d'; // Moderate
            case 3: return '#4caf50'; // Strong
            case 4: return '#2e7d32'; // Very strong
            default: return '#e0e0e0';
        }
    }
    
    function getStrengthText(strength) {
        switch(strength) {
            case 1: return 'Weak';
            case 2: return 'Moderate';
            case 3: return 'Strong';
            case 4: return 'Very strong';
            default: return 'Password strength';
        }
    }
    
    // Show alert message
    function showAlert(message, type) {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert-message ${type}`;
        alert.textContent = message;
        alert.setAttribute('role', 'alert');
        
        // Insert before form
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alert, form);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
});