// Chat Page JavaScript
// API_BASE_URL is set by config.js
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Markdown 渲染辅助函数
function renderMarkdown(text) {
    if (typeof marked === 'undefined') {
        console.warn('marked.js 未加载，使用纯文本');
        return escapeHtml(text);
    }
    
    try {
        return marked.parse(text);
    } catch (e) {
        console.error('Markdown 解析错误:', e);
        return escapeHtml(text);
    }
}

// 流式消息渲染缓存
const streamingRenderCache = new Map();

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
    console.log('Chat page loaded');
    
    // Check login status
    checkLoginStatus();
    
    // Initialize chat
    initializeChat();
    
    // Initialize sidebar
    initializeSidebar();
    
    // Initialize user menu
    initializeUserMenu();
    
    // Initialize billing modal
    initializeBillingModal();
    
    // Initialize event handlers
    initializeEventHandlers();
    
    // Load initial message if provided
    loadInitialMessage();
    
    // Load chat history
    loadChatHistory();
    
    // Update credits display
    updateCreditsDisplay();
});

let currentChatId = null;
let messages = [];

/**
 * Check if user is logged in
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
    
    if (currentUser) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userInfoNav) userInfoNav.style.display = 'flex';
        
        // Set user name and initial
        const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        if (userName && currentUser.name) userName.textContent = currentUser.name;
        if (userInitial) userInitial.textContent = initial;
        if (sidebarUserName && currentUser.name) sidebarUserName.textContent = currentUser.name;
        if (sidebarUserInitial) sidebarUserInitial.textContent = initial;
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (userInfoNav) userInfoNav.style.display = 'none';
    }
}

/**
 * Get current user from localStorage
 */
function getCurrentUser() {
    const user = localStorage.getItem('mgx_current_user');
    return user ? JSON.parse(user) : null;
}

/**
 * Initialize event handlers using event delegation
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
}

/**
 * Event handlers object
 */
const handlers = {
    // Toggle language selector
    toggleLang: (data, el) => {
        const currentLang = el.querySelector('span').textContent;
        const newLang = currentLang === '中文' ? 'EN' : '中文';
        el.querySelector('span').textContent = newLang;
        
        el.style.transform = 'scale(0.95)';
        setTimeout(() => {
            el.style.transform = 'scale(1)';
        }, 100);
    },
    
    // Add file button
    addFile: () => {
        showNotification('文件上传功能');
    },
    
    // Open emoji picker
    openEmoji: () => {
        showNotification('表情选择器');
    },
    
    // New chat
    newChat: () => {
        createNewChat();
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
 * Initialize chat functionality
 */
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    // Send message on button click
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

/**
 * Load initial message from URL parameter
 */
function loadInitialMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get('chatId');
    const initialMessage = urlParams.get('message');
    
    // If chatId is provided, load that chat
    if (chatId) {
        loadChat(chatId);
        return;
    }
    
    // If message is provided, create new chat and send message
    if (initialMessage) {
        // Don't set currentChatId here - it will be created by backend
        // Set input value and send
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = initialMessage;
            setTimeout(() => {
                sendMessage();
            }, 500);
        }
    }
}

/**
 * Send message with streaming response
 */
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    
    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        window.location.href = 'login.html';
        return;
    }
    
    // Hide welcome message
    const welcome = document.querySelector('.chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }
    
    // Add user message
    addMessage('user', message);
    
    // Create AI message container for streaming
    const aiMessageElement = createStreamingMessage();
    
    // Prepare request body
    // 如果是新对话，将第一条消息作为 title
    const requestBody = {
        chat_id: currentChatId || '',  // 如果为空，后端会自动创建新对话
        user_id: currentUser.id.toString(),
        title: currentChatId ? '' : message.substring(0, 50),  // 新对话时使用消息作为 title
        message: message
    };
    
    // Send streaming request
    try {
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Read stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const jsonData = JSON.parse(data);
                        if (jsonData.type === 'chat_id' && jsonData.chat_id) {
                            // 更新当前聊天 ID
                            currentChatId = jsonData.chat_id;
                        } else if (jsonData.type === 'content' && jsonData.content) {
                            appendToStreamingMessage(aiMessageElement, jsonData.content);
                        } else if (jsonData.type === 'error') {
                            appendToStreamingMessage(aiMessageElement, `\n\n错误: ${jsonData.error}`);
                            break;
                        } else if (jsonData.type === 'done') {
                            // Streaming complete
                            break;
                        }
                    } catch (e) {
                        console.error('Failed to parse SSE data:', e);
                    }
                }
            }
        }
        
        // Chat is already saved by backend during streaming
        // Just refresh the history list
        updateChatHistory();
        
    } catch (error) {
        console.error('Streaming error:', error);
        appendToStreamingMessage(aiMessageElement, `\n\n错误: ${error.message}`);
    }
}

/**
 * Create a streaming message element
 */
function createStreamingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const currentUser = getCurrentUser();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant streaming';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">MGX AI</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-text" data-raw-text=""></div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageDiv.querySelector('.message-text');
}

/**
 * Append content to streaming message (with markdown rendering)
 * 使用防抖和智能渲染来避免频繁更新导致的抖动
 */
let streamingRenderTimer = null;
let streamingRenderQueue = new Map();

function appendToStreamingMessage(element, content) {
    if (!element) return;
    
    // 获取当前内容
    const currentText = element.dataset.rawText || '';
    const newText = currentText + content;
    element.dataset.rawText = newText;
    
    // 存储到队列中，使用防抖延迟渲染
    streamingRenderQueue.set(element, newText);
    
    // 清除之前的定时器
    if (streamingRenderTimer) {
        clearTimeout(streamingRenderTimer);
    }
    
    // 检查是否在代码块中（需要更频繁的更新）
    const inCodeBlock = (newText.match(/```/g) || []).length % 2 === 1;
    
    // 如果在代码块中，延迟较短；否则延迟较长
    const delay = inCodeBlock ? 50 : 150;
    
    streamingRenderTimer = setTimeout(() => {
        streamingRenderQueue.forEach((text, el) => {
            // 检查是否有代码块
            const hasCodeBlock = text.includes('```');
            
            // 如果包含代码块，检查代码块是否完整
            let shouldRender = true;
            if (hasCodeBlock) {
                const codeBlockMatches = text.match(/```[\s\S]*?```/g);
                const allCodeBlocksComplete = codeBlockMatches && 
                    codeBlockMatches.length === (text.match(/```/g) || []).length / 2;
                
                // 如果代码块不完整，暂时不渲染 markdown，只显示纯文本
                if (!allCodeBlocksComplete) {
                    // 找到最后一个不完整的代码块位置
                    const lastCodeBlockStart = text.lastIndexOf('```');
                    if (lastCodeBlockStart !== -1) {
                        const beforeCodeBlock = text.substring(0, lastCodeBlockStart);
                        const inCodeBlockText = text.substring(lastCodeBlockStart);
                        
                        // 只渲染代码块之前的部分
                        if (beforeCodeBlock.trim()) {
                            el.innerHTML = renderMarkdown(beforeCodeBlock);
                            // 添加代码块预览（不渲染 markdown）
                            const codePreview = document.createElement('pre');
                            codePreview.className = 'code-preview';
                            codePreview.innerHTML = '<code>' + escapeHtml(inCodeBlockText.replace(/```/g, '')) + '</code>';
                            el.appendChild(codePreview);
                        } else {
                            // 如果只有代码块，直接显示
                            el.innerHTML = '<pre class="code-preview"><code>' + escapeHtml(inCodeBlockText.replace(/```/g, '')) + '</code></pre>';
                        }
                        shouldRender = false;
                    }
                }
            }
            
            if (shouldRender) {
                // 完整渲染 markdown
                el.innerHTML = renderMarkdown(text);
                
                // 高亮代码块（只高亮未高亮的）
                if (typeof hljs !== 'undefined') {
                    setTimeout(() => {
                        el.querySelectorAll('pre code').forEach((block) => {
                            if (!block.classList.contains('hljs') && !block.parentElement.classList.contains('code-preview')) {
                                try {
                                    hljs.highlightElement(block);
                                } catch (e) {
                                    console.warn('代码高亮失败:', e);
                                }
                            }
                        });
                    }, 10);
                }
            }
        });
        
        streamingRenderQueue.clear();
        scrollToBottom();
    }, delay);
    
    // 立即更新滚动位置（不等待渲染）
    scrollToBottom();
}

/**
 * Scroll chat messages to bottom
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * Add message to chat
 */
function addMessage(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    const currentUser = getCurrentUser();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    let avatarContent = '';
    let name = '';
    
    if (role === 'user') {
        const initial = currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        avatarContent = initial;
        name = currentUser && currentUser.name ? currentUser.name : '用户';
    } else {
        avatarContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
        </svg>`;
        name = 'MGX AI';
    }
    
    // 对于 AI 消息，渲染 markdown；对于用户消息，使用纯文本
    let messageContent;
    if (role === 'assistant') {
        // AI 消息：渲染 markdown
        messageContent = renderMarkdown(content);
    } else {
        // 用户消息：使用纯文本（转义 HTML）
        messageContent = escapeHtml(content);
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">${name}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-text">${messageContent}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // 高亮代码块（如果是 AI 消息）
    if (role === 'assistant' && typeof hljs !== 'undefined') {
        setTimeout(() => {
            messageDiv.querySelectorAll('pre code').forEach((block) => {
                if (!block.classList.contains('hljs')) {
                    try {
                        hljs.highlightElement(block);
                    } catch (e) {
                        console.warn('代码高亮失败:', e);
                    }
                }
            });
        }, 10);
    }
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to messages array
    messages.push({
        role,
        content,
        timestamp: now.toISOString()
    });
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">MGX AI</span>
            </div>
            <div class="message-text">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Generate AI response (simulated)
 */
function generateAIResponse(userMessage) {
    const responses = [
        '我理解您的需求。让我来帮助您解决这个问题。',
        '这是一个很好的问题！根据您的描述，我建议...',
        '我已经分析了您的请求。这里有几个建议供您参考。',
        '感谢您的提问。让我为您详细解释一下。',
        '基于您提供的信息，我认为最佳方案是...',
        '我明白了。让我们一步步来解决这个问题。'
    ];
    
    // Simple response selection based on message content
    if (userMessage.includes('网站') || userMessage.includes('页面')) {
        return '我可以帮您创建一个现代化的网站。请告诉我您需要什么样的功能和设计风格？';
    } else if (userMessage.includes('帮助') || userMessage.includes('问题')) {
        return '我很乐意帮助您！请详细描述一下您遇到的问题，我会尽力为您提供解决方案。';
    } else {
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

/**
 * Save current chat to localStorage
 */
function saveChat() {
    if (!currentChatId || messages.length === 0) return;
    
    const chats = getChats();
    const existingChatIndex = chats.findIndex(c => c.id === currentChatId);
    
    const chatData = {
        id: currentChatId,
        title: messages[0].content.substring(0, 50),
        messages: messages,
        updatedAt: new Date().toISOString()
    };
    
    if (existingChatIndex >= 0) {
        chats[existingChatIndex] = chatData;
    } else {
        chats.unshift(chatData);
    }
    
    // Keep only last 20 chats
    if (chats.length > 20) {
        chats.splice(20);
    }
    
    localStorage.setItem('mgx_chats', JSON.stringify(chats));
}

/**
 * Get all chats from localStorage
 */
function getChats() {
    const chats = localStorage.getItem('mgx_chats');
    return chats ? JSON.parse(chats) : [];
}

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
            
            // Highlight current chat
            if (chatBox.id === currentChatId) {
                item.classList.add('active');
            }
            
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
            item.dataset.chatId = chatBox.id;
            item.addEventListener('click', () => {
                // Load chat from backend API
                loadChat(chatBox.id);
            });
            historyList.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load chat history:', error);
        historyList.innerHTML = '<div class="history-item" style="opacity: 0.5; cursor: default;">加载失败</div>';
    }
}

/**
 * Update chat history display
 */
function updateChatHistory() {
    loadChatHistory();
}

/**
 * Load a specific chat from backend API
 */
async function loadChat(chatId) {
    // Clear chat messages
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Show loading state
    chatMessages.innerHTML = '<div style="text-align: center; padding: 2rem; opacity: 0.5;">加载中...</div>';
    
    // Hide welcome
    const welcome = document.querySelector('.chat-welcome');
    if (welcome) {
        welcome.style.display = 'none';
    }
    
    try {
        // Call backend API to get chat content
        const response = await fetch(`${API_BASE_URL}/chat/get`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                chat_id: chatId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const chatBox = await response.json();
        
        // Set current chat
        currentChatId = chatId;
        
        // Convert chatBox.messages to messages array format
        messages = [];
        if (chatBox.messages && chatBox.messages.length > 0) {
            messages = chatBox.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            }));
        }
        
        // Clear and display messages
        chatMessages.innerHTML = '';
        
        if (messages.length > 0) {
            messages.forEach(msg => {
                addMessageToDisplay(msg.role, msg.content, msg.timestamp);
            });
            
            // Scroll to bottom after loading messages
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        } else {
            // If no messages, show welcome
            if (welcome) {
                welcome.style.display = 'block';
            }
        }
        
        // Update history highlighting
        updateChatHistory();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    } catch (error) {
        console.error('Failed to load chat:', error);
        chatMessages.innerHTML = '<div style="text-align: center; padding: 2rem; opacity: 0.5;">加载失败，请重试</div>';
    }
}

/**
 * Add message to display (without saving)
 */
function addMessageToDisplay(role, content, timestamp) {
    const chatMessages = document.getElementById('chatMessages');
    const currentUser = getCurrentUser();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const time = new Date(timestamp);
    const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    let avatarContent = '';
    let name = '';
    
    if (role === 'user') {
        const initial = currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
        avatarContent = initial;
        name = currentUser && currentUser.name ? currentUser.name : '用户';
    } else {
        avatarContent = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
        </svg>`;
        name = 'MGX AI';
    }
    
    // 对于 AI 消息，渲染 markdown；对于用户消息，使用纯文本
    let messageContent;
    if (role === 'assistant') {
        // AI 消息：渲染 markdown
        messageContent = renderMarkdown(content);
        // 高亮代码块
        if (typeof hljs !== 'undefined') {
            setTimeout(() => {
                const codeBlocks = messageDiv.querySelectorAll('pre code');
                codeBlocks.forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 0);
        }
    } else {
        // 用户消息：使用纯文本（转义 HTML）
        messageContent = escapeHtml(content);
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarContent}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-name">${name}</span>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-text">${messageContent}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
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
    
    // Expand by default
    if (historyHeader) {
        historyHeader.classList.add('expanded');
    }
    if (chatHistory) {
        chatHistory.classList.add('expanded');
    }
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
 * Create new chat
 */
function createNewChat() {
    // Reset current chat
    currentChatId = null;
    messages = [];
    
    // Clear chat messages
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="chat-welcome">
            <div class="welcome-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="30" fill="url(#gradient2)" opacity="0.2"/>
                    <circle cx="32" cy="32" r="24" fill="url(#gradient2)"/>
                    <path d="M32 20v24M20 32h24" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    <defs>
                        <linearGradient id="gradient2" x1="0" y1="0" x2="64" y2="64">
                            <stop offset="0%" stop-color="#60a5fa"/>
                            <stop offset="100%" stop-color="#a78bfa"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h2>开始与 AI 对话</h2>
            <p>输入您的问题，我会尽力帮助您</p>
        </div>
    `;
    
    // Clear input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
    }
    
    // Update history
    updateChatHistory();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeSidebar();
    }
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
    
    // Simulate credits (in real app, this would come from backend)
    const totalCredits = 357.5;
    const remainingCredits = 317.13;
    const percentage = (remainingCredits / totalCredits) * 100;
    
    if (billingCreditsProgress) {
        billingCreditsProgress.style.width = `${percentage}%`;
    }
    
    if (billingCreditsAmount) {
        billingCreditsAmount.textContent = `${remainingCredits.toFixed(2)} / ${totalCredits.toFixed(2)}`;
    }
    
    if (billingCreditsTotal) {
        billingCreditsTotal.textContent = `${remainingCredits.toFixed(2)} 剩余`;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update credits display (simulated)
 */
function updateCreditsDisplay() {
    const creditsProgress = document.getElementById('creditsProgress');
    const creditsAmount = document.getElementById('creditsAmount');
    
    // Simulate credits (in real app, this would come from backend)
    const totalCredits = 500;
    const remainingCredits = 0;
    const percentage = (remainingCredits / totalCredits) * 100;
    
    if (creditsProgress) {
        creditsProgress.style.width = `${percentage}%`;
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
`;
document.head.appendChild(style);