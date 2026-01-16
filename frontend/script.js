// Base URL for API
const API_BASE_URL = window.API_BASE_URL || 'https://meetcodeai-x3kr.onrender.com/api';

// ===== Authentication Management =====
const AuthManager = {
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    setToken(token) {
        localStorage.setItem('authToken', token);
    },
    
    removeToken() {
        localStorage.removeItem('authToken');
    },
    
    getUser() {
        const user = localStorage.getItem('authUser');
        return user ? JSON.parse(user) : null;
    },
    
    setUser(user) {
        localStorage.setItem('authUser', JSON.stringify(user));
    },
    
    removeUser() {
        localStorage.removeItem('authUser');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    logout() {
        this.removeToken();
        this.removeUser();
        this.updateUI();
        showNotification('success', 'Logged out successfully');
    },
    
    updateUI() {
        const authNavItem = document.getElementById('authNavItem');
        const userNavItem = document.getElementById('userNavItem');
        const userAvatar = document.getElementById('userAvatar');
        const adminDashboardLink = document.getElementById('adminDashboardLink');
        
        if (this.isAuthenticated()) {
            const user = this.getUser();
            authNavItem.style.display = 'none';
            userNavItem.style.display = 'flex';
            
            // Show user's first initial in avatar
            if (userAvatar && user && user.name) {
                const initial = user.name.charAt(0).toUpperCase();
                userAvatar.textContent = initial;
                userAvatar.title = user.name;
            }
            
            // Show admin dashboard link only for admins
            if (adminDashboardLink && user && user.role === 'admin') {
                adminDashboardLink.style.display = 'flex';
            } else if (adminDashboardLink) {
                adminDashboardLink.style.display = 'none';
            }
        } else {
            authNavItem.style.display = 'block';
            userNavItem.style.display = 'none';
        }
    }
};

// ===== Mobile Menu Toggle (Simple & Robust) =====
const initMobileMenu = () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Debug logging
    if (mobileMenuBtn) {
        mobileMenuBtn.style.cursor = 'pointer';
        mobileMenuBtn.style.transition = 'all 0.3s ease';
    }
    
    if (!mobileMenuBtn || !navLinks) {
        return;
    }
    
    // Click handler for menu button
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
    
    // Click handler for nav links
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const header = document.querySelector('header');
        if (header && !header.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// ===== Form Submission =====
// Form submission with API call
const initQuoteForm = () => {
    console.log('Initializing quote form...');
    const quoteForm = document.getElementById('quoteForm');
    console.log('Quote form element:', quoteForm);
    
    if (!quoteForm) {
        console.error('Quote form not found!');
        return;
    }
    
    console.log('Adding submit event listener to quote form');
    quoteForm.addEventListener('submit', async function(e) {
        console.log('Form submitted!');
        
                // Check if user is authenticated
                if (!AuthManager.isAuthenticated()) {
                    showNotification('error', 'Please login to request a quote');
                    document.getElementById('loginModal').style.display = 'flex';
                    return;
                }
        e.preventDefault();
        
        // Get selected services with null check
        const servicesSelect = document.getElementById('services');
        let selectedServices = ['website']; // Default value
        
        if (servicesSelect && servicesSelect.selectedOptions) {
            selectedServices = Array.from(servicesSelect.selectedOptions).map(option => option.value);
            if (selectedServices.length === 0) {
                selectedServices = ['website']; // Fallback to default
            }
        }
        
        console.log('Selected services:', selectedServices);
        
        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            agencyName: document.getElementById('agency').value,
            email: document.getElementById('email').value,
            services: selectedServices,
            budget: document.getElementById('budget').value,
            details: document.getElementById('details').value || ''
        };
        
        console.log('Submitting quote:', formData); // Debug log
        
        // Disable submit button and show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Send data to backend
            console.log('API_BASE_URL:', API_BASE_URL); // Debug URL
            console.log('Posting to:', `${API_BASE_URL}/quotes`); // Debug endpoint
            
            const response = await fetch(`${API_BASE_URL}/quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthManager.getToken()}`
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status); // Debug response
            console.log('Response ok:', response.ok); // Debug ok flag
            
            const data = await response.json();
            console.log('Response data:', data); // Debug full response
            
            if (response.ok) {
                // Show success message
                showNotification('success', data.message || 'Quote request submitted successfully!');
                
                // Reset form
                quoteForm.reset();
                
                // Show confirmation modal (optional)
                showConfirmationModal(data.data.quote);
            } else {
                // Show error message
                showNotification('error', data.message || 'Something went wrong. Please try again.');
                
                // Show validation errors if any
                if (data.errors) {
                    data.errors.forEach(error => {
                        showNotification('error', error.msg);
                    });
                }
            }
        } catch (error) {
            // Error handled - log for debugging
            console.error('Form submission error:', error); // Debug error
            showNotification('error', 'Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
};

// Initialize quote form on page load
console.log('Script loaded, DOM state:', document.readyState);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initQuoteForm();
        initAuth();
    });
} else {
    initQuoteForm();
    initAuth();
}

// ===== Authentication UI & Handlers =====
function initAuth() {
    AuthManager.updateUI();
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });
    }
    
    // Auto-show login modal on scroll (only once per session, not for logged-in users)
    window.addEventListener('scroll', () => {
        const isLoggedIn = AuthManager.getToken();
        const hasShownModal = sessionStorage.getItem('modalShown');
        
        if (!hasShownModal && window.scrollY > 300 && !isLoggedIn) {
            sessionStorage.setItem('modalShown', 'true');
            setTimeout(() => {
                loginModal.style.display = 'flex';
            }, 500);
        }
    });
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthManager.logout();
        });
    }
    
    if (closeLogin) closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    if (closeRegister) closeRegister.addEventListener('click', () => registerModal.style.display = 'none');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'flex';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showNotification('error', 'Please enter email and password');
                return;
            }
            
            try {
                const loginUrl = `${API_BASE_URL}/auth/login`;
                console.log('API_BASE_URL:', API_BASE_URL);
                console.log('Attempting login to:', loginUrl);
                
                const response = await fetch(loginUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);
                
                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.error('Failed to parse response:', parseError);
                    console.error('Response text:', await response.text());
                    showNotification('error', `Server error (${response.status}). Backend may be unavailable.`);
                    return;
                }
                
                console.log('Response data:', data);
                
                if (response.ok && data.token) {
                    AuthManager.setToken(data.token);
                    AuthManager.setUser({ 
                        email: data.data.user.email, 
                        name: data.data.user.name,
                        role: data.data.user.role
                    });
                    AuthManager.updateUI();
                    loginModal.style.display = 'none';
                    loginForm.reset();
                    sessionStorage.removeItem('modalShown');
                    showNotification('success', 'Logged in successfully!');
                    
                    // Check if user selected a plan
                    const selectedPlan = sessionStorage.getItem('selectedPlan');
                    
                    // Auto-redirect admin to dashboard
                    if (data.data.user.role === 'admin') {
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 500);
                    } else if (selectedPlan) {
                        // Redirect to checkout with plan
                        setTimeout(() => {
                            window.location.href = `checkout.html?plan=${selectedPlan}`;
                        }, 500);
                    }
                } else {
                    showNotification('error', data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                console.error('Error message:', error.message);
                if (error.message.includes('Failed to fetch')) {
                    showNotification('error', 'Cannot reach server. Ensure backend is running at meetcodeai.onrender.com');
                } else {
                    showNotification('error', `Error: ${error.message}`);
                }
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            
            if (password !== passwordConfirm) {
                showNotification('error', 'Passwords do not match');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                
                if (response.ok) {
                    AuthManager.setToken(data.token);
                    AuthManager.setUser({ 
                        email: data.data.user.email, 
                        name: data.data.user.name,
                        role: data.data.user.role
                    });
                    AuthManager.updateUI();
                    registerModal.style.display = 'none';
                    registerForm.reset();
                    showNotification('success', 'Account created successfully!');
                    
                    // Check if user selected a plan
                    const selectedPlan = sessionStorage.getItem('selectedPlan');
                    
                    // Auto-redirect admin to dashboard
                    if (data.data.user.role === 'admin') {
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 500);
                    } else if (selectedPlan) {
                        // Redirect to checkout with plan
                        setTimeout(() => {
                            window.location.href = `checkout.html?plan=${selectedPlan}`;
                        }, 500);
                    }
                } else {
                    // Show specific error message
                    let errorMsg = data.message || 'Registration failed';
                    if (data.errors && Array.isArray(data.errors)) {
                        errorMsg = data.errors.map(e => e.msg).join(', ');
                    }
                    showNotification('error', errorMsg);
                }
            } catch (error) {
                console.error('Registration error:', error);
                showNotification('error', 'Network error. Please try again.');
            }
        });
    }
    
    // User dropdown toggle
    const userAvatar = document.getElementById('userAvatar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const adminDashboardLink = document.getElementById('adminDashboardLink');
    
    if (userAvatar) {
        userAvatar.addEventListener('click', (e) => {
            e.preventDefault();
            const isVisible = dropdownMenu.style.display !== 'none';
            dropdownMenu.style.display = isVisible ? 'none' : 'flex';
            dropdownMenu.style.flexDirection = 'column';
        });
    }
    
    if (adminDashboardLink) {
        adminDashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'admin.html';
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (userAvatar && dropdownMenu && !e.target.closest('.user-dropdown')) {
            dropdownMenu.style.display = 'none';
        }
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) registerModal.style.display = 'none';
    });
    
    // Handle plan button clicks
    const planButtons = document.querySelectorAll('.plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = button.getAttribute('data-plan');
            sessionStorage.setItem('selectedPlan', plan);
            loginModal.style.display = 'flex';
        });
    });
}

// Helper function to show notifications
function showNotification(type, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Show confirmation modal with quote details
function showConfirmationModal(quoteData) {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-check-circle" style="color: #10b981;"></i> Quote Request Confirmed</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Thank you <strong>${quoteData.name}</strong>!</p>
                <p>Your quote request has been submitted successfully.</p>
                <div class="quote-summary">
                    <h4>Request Summary:</h4>
                    <ul>
                        <li><strong>Agency:</strong> ${quoteData.agencyName}</li>
                        <li><strong>Services:</strong> ${quoteData.services.join(', ')}</li>
                        <li><strong>Budget Range:</strong> ${quoteData.budget}</li>
                        <li><strong>Status:</strong> <span class="status-badge pending">${quoteData.status}</span></li>
                    </ul>
                </div>
                <p>We'll email you at <strong>${quoteData.email}</strong> within 24 hours with your custom quote.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="closeModal">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#closeModal').addEventListener('click', () => modal.remove());
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Add CSS for notifications and modal
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        max-width: 400px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .notification-success {
        background-color: #10b981;
    }
    
    .notification-error {
        background-color: #ef4444;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        margin-left: 15px;
    }
    
    .notification.fade-out {
        animation: slideOut 0.3s ease forwards;
    }
    
    .confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .modal-content {
        background-color: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        animation: modalFadeIn 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
    }
    
    .quote-summary {
        background-color: #f8fafc;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
    }
    
    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .status-badge.pending {
        background-color: #fbbf24;
        color: #92400e;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes modalFadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);