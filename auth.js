// Authentication JavaScript
// API_BASE_URL is set by config.js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page loaded');
    
    // Initialize event handlers
    initializeAuthHandlers();
});

/**
 * Initialize authentication event handlers
 */
function initializeAuthHandlers() {
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Google auth buttons
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        
        const { action } = el.dataset;
        if (action === 'googleRegister' || action === 'googleLogin') {
            handleGoogleAuth(action);
        }
    });
}

/**
 * Handle user registration
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const terms = formData.get('terms');
    
    // Remove any existing error messages
    removeMessage();
    
    // Validation
    if (!username || username.length < 3) {
        showError('用户名至少需要 3 个字符');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('请输入有效的邮箱地址');
        return;
    }
    
    if (password.length < 6) {
        showError('密码至少需要 6 个字符');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('两次输入的密码不一致');
        return;
    }
    
    if (!terms) {
        showError('请同意服务条款和隐私政策');
        return;
    }
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/create_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            showError(errorData.error || '注册失败，请稍后重试');
            return;
        }
        
        const userData = await response.json();
        
        // Show success message
        showSuccess('注册成功！正在跳转到主页...');
        
        // Cache user information in browser
        setCurrentUser(userData);
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Registration error:', error);
        showError('网络错误，请检查服务器是否运行');
    }
}

/**
 * Handle user login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Remove any existing error messages
    removeMessage();
    
    // Validation
    if (!validateEmail(email)) {
        showError('请输入有效的邮箱地址');
        return;
    }
    
    if (!password) {
        showError('请输入密码');
        return;
    }
    
    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            showError(errorData.error || '登录失败，用户名或密码错误');
            return;
        }
        
        const userData = await response.json();
        
        // Show success message
        showSuccess('登录成功！正在跳转到主页...');
        
        // Cache user information in browser
        setCurrentUser(userData);
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Login error:', error);
        showError('网络错误，请检查服务器是否运行');
    }
}

/**
 * Handle Google authentication
 */
function handleGoogleAuth(action) {
    const actionText = action === 'googleRegister' ? '注册' : '登录';
    showError(`Google ${actionText}功能暂未实现，请使用邮箱${actionText}`);
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Simple password hashing (for demo purposes only)
 * In production, use proper server-side hashing
 */
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

/**
 * Get all users from localStorage (deprecated, kept for compatibility)
 */
function getUsers() {
    const users = localStorage.getItem('mgx_users');
    return users ? JSON.parse(users) : [];
}

/**
 * Set current user in localStorage
 */
function setCurrentUser(user) {
    // Cache user information including JWT token
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        jwt: user.jwt,
        credits: user.credits || 0
    };
    localStorage.setItem('mgx_current_user', JSON.stringify(userData));
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const user = localStorage.getItem('mgx_current_user');
    return user ? JSON.parse(user) : null;
}

/**
 * Show error message
 */
function showError(message) {
    removeMessage();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(errorDiv, form.firstChild);
}

/**
 * Show success message
 */
function showSuccess(message) {
    removeMessage();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);
}

/**
 * Remove any existing messages
 */
function removeMessage() {
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

/**
 * Add input validation feedback
 */
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value && !this.checkValidity()) {
            this.style.borderColor = '#dc2626';
        } else if (this.value) {
            this.style.borderColor = '#16a34a';
        } else {
            this.style.borderColor = '';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.style.borderColor) {
            this.style.borderColor = '';
        }
    });
});