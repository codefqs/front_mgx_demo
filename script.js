// Main JavaScript file for MGX website clone
// API_BASE_URL is set by config.js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

/**
 * Get request headers with JWT and user ID for authenticated requests
 */
function getAuthHeaders() {
    const currentUser = getCurrentUser();
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (currentUser && currentUser.jwt && currentUser.id) {
        headers['X-JWT-Token'] = currentUser.jwt;
        headers['X-User-ID'] = currentUser.id.toString();
    }
    
    return headers;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('MGX Website Clone - Ready!');
    
    // Check login status
    checkLoginStatus();
    
    // Initialize all event handlers
    initializeEventHandlers();
    initializeTabSwitching();
    initializeCardAnimations();
    initializeSidebar();
    initializeUserMenu();
    initializeBillingModal();
    
    // Load chat history
    loadChatHistory();
});

/**
 * Check if user is logged in and update UI
 */
function checkLoginStatus() {
    const currentUser = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userInfoNav = document.getElementById('userInfoNav');
    const userName = document.getElementById('userName');
    const userInitial = document.getElementById('userInitial');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserInitial = document.getElementById('sidebarUserInitial');
    
    console.log('Checking login status...', currentUser);
    
    if (currentUser) {
        // User is logged in
        console.log('User is logged in:', currentUser.name);
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userInfoNav) {
            userInfoNav.style.display = 'flex';
        }
        
        // Set user name and initial
        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        if (userName && currentUser.name) userName.textContent = currentUser.name;
        if (userInitial) userInitial.textContent = initial;
        if (sidebarUserName && currentUser.name) sidebarUserName.textContent = currentUser.name;
        if (sidebarUserInitial) sidebarUserInitial.textContent = initial;
    } else {
        // User is not logged in
        console.log('User is not logged in');
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (userInfoNav) userInfoNav.style.display = 'none';
    }
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    try {
        const user = localStorage.getItem('mgx_current_user');
        if (user) {
            return JSON.parse(user);
        }
        return null;
    } catch (error) {
        console.error('Error reading user from localStorage:', error);
        return null;
    }
}

/**
 * Initialize all event handlers using event delegation
 */
function initializeEventHandlers() {
    document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        
        const { action, ...data } = el.dataset;
        if (handlers[action]) {
            handlers[action](data, el);
        }
    });
    
    // Main send button
    const mainSendBtn = document.getElementById('mainSendBtn');
    if (mainSendBtn) {
        mainSendBtn.addEventListener('click', handleMainSend);
    }
    
    // Enter key in main input
    const mainInput = document.getElementById('mainInput');
    if (mainInput) {
        mainInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleMainSend();
            }
        });
    }
}

/**
 * Handle send from main page
 */
function handleMainSend() {
    const mainInput = document.getElementById('mainInput');
    const message = mainInput ? mainInput.value.trim() : '';
    
    if (message) {
        // Redirect to chat page with message
        window.location.href = `chat.html?message=${encodeURIComponent(message)}`;
    }
}

/**
 * Event handlers object
 */
const handlers = {
    // Close announcement banner
    closeAnnouncement: () => {
        const announcement = document.querySelector('.announcement');
        if (announcement) {
            announcement.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => {
                announcement.remove();
            }, 300);
        }
    },
    
    // Toggle language selector
    toggleLang: (data, el) => {
        const currentLang = el.querySelector('span').textContent;
        const newLang = currentLang === '中文' ? 'EN' : '中文';
        el.querySelector('span').textContent = newLang;
        
        // Add a subtle animation
        el.style.transform = 'scale(0.95)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 100);
    },
    
    // Add file button
    addFile: () => {
        console.log('Add file clicked');
        showNotification('文件上传功能');
    },
    
    // Open emoji picker
    openEmoji: () => {
        console.log('Emoji picker clicked');
        showNotification('表情选择器');
    },
    
    // Toggle model selector
    toggleModel: (data, el) => {
        console.log('Model selector clicked');
        showNotification('模型选择器');
        
        // Add visual feedback
        el.style.transform = 'scale(0.98)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 100);
    },
    
    // Send message (handled by handleMainSend)
    sendMessage: handleMainSend,
    
    // Feature buttons
    createSlides: () => {
        console.log('Create slides clicked');
        showNotification('创建幻灯片');
    },
    
    deepResearch: () => {
        console.log('Deep research clicked');
        showNotification('深度研究');
    },
    
    createBlog: () => {
        console.log('Create blog clicked');
        showNotification('创建博客');
    },
    
    orgCenter: () => {
        console.log('Org center clicked');
        showNotification('组织中心');
    },
    
    prototype: () => {
        console.log('Prototype clicked');
        showNotification('原型设计');
    },
    
    // Tab switching
    switchTab: (data, el) => {
        const tabName = data.tab;
        switchToTab(tabName, el);
    },
    
    // New chat
    newChat: () => {
        window.location.href = 'chat.html';
    },
    
    // Toggle history
    toggleHistory: (data, el) => {
        el.classList.toggle('expanded');
        const chatHistory = document.getElementById('chatHistory');
        if (chatHistory) {
            chatHistory.classList.toggle('expanded');
        }
    },
    
    // Toggle user menu
    toggleUserMenu: (data, el) => {
        const userMenu = document.getElementById('userMenu');
        const menuButton = el;
        
        if (userMenu) {
            const isExpanded = userMenu.classList.contains('expanded');
            
            if (isExpanded) {
                userMenu.classList.remove('expanded');
                menuButton.classList.remove('expanded');
            } else {
                userMenu.classList.add('expanded');
                menuButton.classList.add('expanded');
            }
        }
    },
    
    // Open settings
    openSettings: () => {
        showNotification('设置功能');
    },
    
    // Open billing modal
    openBilling: () => {
        const billingModal = document.getElementById('billingModal');
        if (billingModal) {
            billingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateBillingCredits();
        }
    },
    
    // Close billing modal
    closeBilling: () => {
        const billingModal = document.getElementById('billingModal');
        if (billingModal) {
            billingModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // Open help
    openHelp: () => {
        showNotification('帮助中心');
    },
    
    // Open redeem
    openRedeem: () => {
        showNotification('兑换功能');
    },
    
    // Open preferences
    openPreferences: () => {
        showNotification('偏好设置');
    },
    
    // Logout
    logout: () => {
        // Clear user data
        localStorage.removeItem('mgx_current_user');
        
        // Close sidebar
        closeSidebar();
        
        // Show notification
        showNotification('已退出登录');
        
        // Refresh page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },
    
    // Switch billing tab
    switchBillingTab: (data, el) => {
        const tabName = data.tab;
        switchBillingTab(tabName, el);
    }
};

/**
 * Initialize tab switching functionality
 */
function initializeTabSwitching() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        tab.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

/**
 * Switch to a specific tab
 */
function switchToTab(tabName, clickedTab) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.style.transform = 'translateY(0)';
    });
    
    // Add active class to clicked tab
    clickedTab.classList.add('active');
    
    // Update subtitle based on tab
    const subtitle = document.querySelector('.showcase-subtitle');
    const subtitles = {
        discover: 'MGX 社区发现',
        featured: 'MGX 团队精选案例',
        liked: '您喜欢的项目'
    };
    
    if (subtitle && subtitles[tabName]) {
        subtitle.style.opacity = '0';
        setTimeout(() => {
            subtitle.textContent = subtitles[tabName];
            subtitle.style.opacity = '1';
        }, 150);
    }
    
    console.log(`Switched to ${tabName} tab`);
}

/**
 * Initialize card animations
 */
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    // Add staggered entrance animation
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Add click handler for cards
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.card-title').textContent;
            console.log('Card clicked:', title);
            showNotification(`查看项目: ${title}`);
        });
    });
}

/**
 * Initialize sidebar functionality
 */
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarTrigger = document.getElementById('sidebarTrigger');
    const historyHeader = document.querySelector('.sidebar-section-header');
    const chatHistory = document.getElementById('chatHistory');
    
    // Open sidebar on hover over trigger area
    if (sidebarTrigger) {
        sidebarTrigger.addEventListener('mouseenter', openSidebar);
    }
    
    // Close sidebar on overlay click
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
    // Expand history by default
    if (historyHeader) {
        historyHeader.classList.add('expanded');
    }
    if (chatHistory) {
        chatHistory.classList.add('expanded');
    }
    
    // Update credits display
    updateCreditsDisplay();
}

/**
 * Open sidebar
 */
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
}

/**
 * Close sidebar
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const userMenu = document.getElementById('userMenu');
    const menuButton = document.querySelector('.user-card-menu');
    
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    
    // Also close user menu if open
    if (userMenu) userMenu.classList.remove('expanded');
    if (menuButton) menuButton.classList.remove('expanded');
}

/**
 * Initialize user menu
 */
function initializeUserMenu() {
    // Theme toggle buttons
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            const theme = this.dataset.theme;
            
            // Remove active class from all theme icons
            themeIcons.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked icon
            this.classList.add('active');
            
            showNotification(`切换到${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}主题`);
        });
    });
}

/**
 * Initialize billing modal
 */
function initializeBillingModal() {
    // Plan select dropdowns
    const planSelects = document.querySelectorAll('.billing-plan-select');
    planSelects.forEach(select => {
        select.addEventListener('change', function() {
            const credits = this.value;
            showNotification(`已选择 ${credits} 积分/月`);
        });
    });
    
    // Plan buttons
    const planButtons = document.querySelectorAll('.billing-plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            const planCard = this.closest('.billing-plan-card');
            const planName = planCard.querySelector('.billing-plan-name').textContent;
            
            if (this.classList.contains('current')) {
                showNotification(`您当前使用的是 ${planName} 套餐`);
            } else {
                showNotification(`升级到 ${planName} 套餐`);
            }
        });
    });
}

/**
 * Switch billing tab
 */
function switchBillingTab(tabName, clickedTab) {
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.billing-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to clicked tab
    clickedTab.classList.add('active');
    
    // Show/hide content
    const plansContent = document.getElementById('plansContent');
    const paymentsContent = document.getElementById('paymentsContent');
    
    if (tabName === 'plans') {
        if (plansContent) plansContent.style.display = 'block';
        if (paymentsContent) paymentsContent.style.display = 'none';
    } else if (tabName === 'payments') {
        if (plansContent) plansContent.style.display = 'none';
        if (paymentsContent) paymentsContent.style.display = 'block';
    }
}

/**
 * Update billing credits display
 */
function updateBillingCredits() {
    const billingCreditsProgress = document.getElementById('billingCreditsProgress');
    const billingCreditsAmount = document.getElementById('billingCreditsAmount');
    const billingCreditsTotal = document.getElementById('billingCreditsTotal');
    
    // Get credits from current user or use default
    const currentUser = getCurrentUser();
    const totalCredits = 357.5; // Default total credits
    const remainingCredits = currentUser && currentUser.credits !== undefined ? currentUser.credits : 0;
    const percentage = totalCredits > 0 ? (remainingCredits / totalCredits) * 100 : 0;
    
    if (billingCreditsProgress) {
        billingCreditsProgress.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    if (billingCreditsAmount) {
        billingCreditsAmount.textContent = `${remainingCredits.toFixed(2)} / ${totalCredits.toFixed(2)}`;
    }
    
    if (billingCreditsTotal) {
        billingCreditsTotal.textContent = `${remainingCredits.toFixed(2)} 剩余`;
    }
}

/**
 * Load chat history into sidebar
 */
/**
 * Load chat history from backend API
 */
async function loadChatHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
        historyList.innerHTML = '<div class="history-item" style="opacity: 0.5; cursor: default;">请先登录</div>';
        return;
    }
    
    // Show loading state
    historyList.innerHTML = '<div class="history-item" style="opacity: 0.5; cursor: default;">加载中...</div>';
    
    try {
        // Call backend API to get chat history
        const response = await fetch(`${API_BASE_URL}/chat/search`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: currentUser.id.toString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const chatBoxes = await response.json();
        
        if (!chatBoxes || chatBoxes.length === 0) {
            historyList.innerHTML = '<div class="history-item" style="opacity: 0.5; cursor: default;">暂无聊天记录</div>';
            return;
        }
        
        // Clear and populate history list
        historyList.innerHTML = '';
        chatBoxes.forEach((chatBox, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            // Use title from backend, fallback to default if not available
            let title = chatBox.title || '新对话';
            
            // If title is still empty, try to use first message or date
            if (!title || title === '') {
                if (chatBox.messages && chatBox.messages.length > 0) {
                    const firstMessage = chatBox.messages[0];
                    if (firstMessage && firstMessage.content) {
                        title = firstMessage.content.substring(0, 30);
                        if (firstMessage.content.length > 30) {
                            title += '...';
                        }
                    }
                } else if (chatBox.created_at) {
                    const date = new Date(chatBox.created_at * 1000);
                    const dateStr = date.toLocaleDateString('zh-CN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    title = `对话 ${dateStr}`;
                } else {
                    title = `对话 ${index + 1}`;
                }
            }
            
            item.textContent = title;
            item.addEventListener('click', () => {
                // 跳转到聊天页面，传递 chatId
                window.location.href = `chat.html?chatId=${chatBox.id}`;
            });
            historyList.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load chat history:', error);
        historyList.innerHTML = '<div class="history-item" style="opacity: 0.5; cursor: default;">加载失败</div>';
    }
}

/**
 * Get all chats from localStorage
 */
function getChats() {
    const chats = localStorage.getItem('mgx_chats');
    return chats ? JSON.parse(chats) : [];
}

/**
 * Update credits display
 */
function updateCreditsDisplay() {
    const creditsProgress = document.getElementById('creditsProgress');
    const creditsAmount = document.getElementById('creditsAmount');
    
    // Get credits from current user or use default
    const currentUser = getCurrentUser();
    const totalCredits = 500; // Default total credits
    const remainingCredits = currentUser && currentUser.credits !== undefined ? currentUser.credits : 0;
    const percentage = totalCredits > 0 ? (remainingCredits / totalCredits) * 100 : 0;
    
    if (creditsProgress) {
        creditsProgress.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    if (creditsAmount) {
        creditsAmount.textContent = `${remainingCredits.toFixed(2)} 剩余`;
    }
}

/**
 * Show notification (simple toast-like notification)
 */
function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, rgba(167, 139, 250, 0.95), rgba(96, 165, 250, 0.95));
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        font-size: 0.9375rem;
        font-weight: 500;
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Add CSS animations for notifications
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOutDown {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

/**
 * Add smooth scroll behavior
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});