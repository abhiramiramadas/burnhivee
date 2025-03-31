document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = 'http://127.0.0.1:5000';
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate inputs
            if (!username || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Signing In...</span>';
                
                // Make API request
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify({
                        username: data.username,
                        email: data.email || `${data.username}@burnhive.com`,
                        profileImage: data.profileImage || 'assets/default-profile.png'
                    }));
                    
                    // Redirect to profile
                    window.location.href = 'profile.html';
                } else {
                    // Show error message
                    showAlert(data.message || 'Invalid credentials', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Network error. Please try again.', 'error');
            } finally {
                // Reset button state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Sign In</span>';
            }
        });
    }
    
    // Password toggle functionality
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = this.closest('.input-wrapper').querySelector('input');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Change icon
            const icon = this.querySelector('svg');
            if (type === 'password') {
                icon.innerHTML = '<path d="M12 5C5 5 1 12 1 12C1 12 5 19 12 19C19 19 23 12 23 12C23 12 19 5 12 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            } else {
                icon.innerHTML = '<path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
            }
        });
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