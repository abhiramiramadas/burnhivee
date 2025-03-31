document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = 'http://127.0.0.1:5000';
    const DEFAULT_PROFILE_IMAGE = 'assets/default-profile.png';

    // DOM Elements
    const loadingSkeleton = document.getElementById('loading-skeleton');
    const profileCard = document.getElementById('profile-card');
    const profileImage = document.getElementById('profileImage');
    const usernameEl = document.getElementById('username');
    const emailEl = document.getElementById('email');
    const logoutBtn = document.getElementById('logout');
    const editProfileBtn = document.getElementById('editProfile');

    // Check if elements exist before using them
    if (!logoutBtn || !editProfileBtn) {
        console.error('Required elements not found!');
        return;
    }

    // Check authentication
    function checkAuth() {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData) {
            showError('You need to login first!', true);
            return null;
        }
        return userData;
    }

    // Load profile data
    async function loadProfile() {
        const userData = checkAuth();
        if (!userData) return;

        try {
            displayUserInfo(userData);
            await fetchProfileData();
            await fetchUserStats();
        } catch (error) {
            console.error('Profile load error:', error);
            showError('Failed to load profile data', false);
        } finally {
            loadingSkeleton.style.display = 'none';
            profileCard.style.display = 'block';
        }
    }

    // Display user info
    function displayUserInfo(userData) {
        if (usernameEl) usernameEl.textContent = `Welcome, ${userData.username}`;
        if (emailEl) emailEl.textContent = userData.email || 'No email provided';
        if (profileImage) profileImage.src = userData.profileImage || DEFAULT_PROFILE_IMAGE;
    }

    // Fetch profile data from API
    async function fetchProfileData() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) throw new Error('Profile fetch failed');
            
            const data = await response.json();
            displayUserInfo(data);
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }

    // Fetch user stats from API
    async function fetchUserStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user-stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) throw new Error('Stats fetch failed');
            
            const data = await response.json();
            updateStatsUI(data);
        } catch (error) {
            console.error('Stats error:', error);
            showError('Could not load stats', false);
        }
    }

    // Update stats display
    function updateStatsUI(stats) {
        if (!stats) return;
        
        animateValue('stat-activities', 0, stats.activities || 0, 1000);
        animateValue('stat-calories', 0, stats.calories || 0, 1000);
        animateValue('stat-workouts', 0, stats.workouts || 0, 1000);
    }

    // Animate number values
    function animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Show error message
    function showError(message, fatal = true) {
        console.error(message);
        
        const errorEl = document.createElement('div');
        errorEl.className = 'profile-error';
        errorEl.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                      stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>${message}</span>
        `;
        
        if (profileCard) profileCard.prepend(errorEl);
        
        if (fatal) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    }

    // Event Handlers
    function setupLogout() {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }

    function setupEditProfile() {
        editProfileBtn.addEventListener('click', function() {
            window.location.href = 'edit-profile.html';
        });
    }

    // Initialize
    function init() {
        console.log('Initializing profile page...');
        setupLogout();
        setupEditProfile();
        loadProfile();
    }

    init();
});