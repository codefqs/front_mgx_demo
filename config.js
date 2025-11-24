// API 配置
// 自动检测环境并设置 API 地址

(function() {
    // 获取当前主机名和 URL 参数
    const hostname = window.location.hostname;
    const protocol = window.location.protocol; // http: 或 https:
    const urlParams = new URLSearchParams(window.location.search);
    
    // 默认配置
    const defaultApiUrl = 'http://localhost:8080';
    
    // 优先级1: URL 参数中指定的 API 地址
    const apiUrlFromParam = urlParams.get('api');
    if (apiUrlFromParam) {
        window.API_BASE_URL = apiUrlFromParam;
        // 保存到 localStorage
        localStorage.setItem('mgx_api_url', apiUrlFromParam);
        console.log('✅ 使用 URL 参数指定的 API 地址:', apiUrlFromParam);
        return;
    }
    
    // 优先级2: localStorage 中保存的 API 地址
    const savedApiUrl = localStorage.getItem('mgx_api_url');
    if (savedApiUrl) {
        window.API_BASE_URL = savedApiUrl;
        console.log('✅ 使用保存的 API 地址:', savedApiUrl);
        return;
    }
    
    // 优先级3: 根据当前域名自动判断
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // 本地开发环境
        window.API_BASE_URL = defaultApiUrl;
        console.log('✅ 本地开发环境，使用默认 API 地址:', defaultApiUrl);
    } else if (hostname.includes('ngrok') || hostname.includes('ngrok-free') || hostname.includes('ngrok.io')) {
        // ngrok 环境：前后端使用不同的 ngrok URL
        // 如果没有通过 URL 参数或 localStorage 指定后端地址，显示警告
        const currentOrigin = protocol + '//' + hostname;
        
        // 如果没有保存的后端地址，使用当前域名（前端地址）并显示警告
        window.API_BASE_URL = currentOrigin;
        console.warn('⚠️  检测到 ngrok 环境（前端）');
        console.warn('⚠️  当前使用前端域名作为 API 地址:', currentOrigin);
        console.warn('💡 如果后端使用不同的 ngrok URL，请在 URL 后添加参数：?api=后端ngrok地址');
        console.warn('💡 例如：' + window.location.href.split('?')[0] + '?api=https://后端ngrok地址.ngrok-free.app');
        console.warn('💡 指定后，地址会自动保存，下次访问无需再次添加参数');
        
        // 在页面上显示提示
        setTimeout(() => {
            if (!document.getElementById('api-warning')) {
                const warningDiv = document.createElement('div');
                warningDiv.id = 'api-warning';
                warningDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; max-width: 400px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
                warningDiv.innerHTML = `
                    <div style="font-weight: bold; color: #92400e; margin-bottom: 8px; font-size: 16px;">⚠️ 后端 API 地址未指定</div>
                    <div style="color: #78350f; font-size: 14px; margin-bottom: 12px; line-height: 1.5;">如果后端使用不同的 ngrok URL，请在浏览器地址栏的 URL 后添加：</div>
                    <div style="color: #78350f; font-size: 12px; background: white; padding: 10px; border-radius: 4px; margin-bottom: 12px; font-family: monospace; word-break: break-all; border: 1px solid #fbbf24;">?api=后端ngrok地址</div>
                    <div style="color: #78350f; font-size: 12px; margin-bottom: 12px; line-height: 1.4;">例如：<span style="font-family: monospace; background: #fef3c7; padding: 2px 4px; border-radius: 2px;">?api=https://abc123.ngrok-free.app</span></div>
                    <button onclick="this.parentElement.remove()" style="background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%; font-weight: 500;">知道了</button>
                `;
                document.body.appendChild(warningDiv);
            }
        }, 500);
    } else {
        // 其他环境（生产环境等）
        // 假设后端和前端在同一域名下
        const currentOrigin = protocol + '//' + hostname;
        window.API_BASE_URL = currentOrigin;
        console.log('✅ 使用当前域名作为 API 地址:', currentOrigin);
    }
})();

