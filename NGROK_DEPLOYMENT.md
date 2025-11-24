# ngrok 部署指南

本指南帮助您通过 ngrok 将 MGX 应用暴露到公网，让外部用户访问。

## 📋 前置准备

### 1. 安装 ngrok

**Windows:**
1. 访问 https://ngrok.com/download
2. 下载 Windows 版本
3. 解压到任意目录（如 `C:\ngrok`）
4. 将 ngrok 目录添加到系统 PATH，或使用完整路径

**Linux/Mac:**
```bash
# 使用包管理器安装
# Ubuntu/Debian
sudo snap install ngrok

# Mac
brew install ngrok/ngrok/ngrok
```

### 2. 注册 ngrok 账号并获取 authtoken

1. 访问 https://dashboard.ngrok.com/signup 注册账号（免费版即可）
2. 登录后，在 https://dashboard.ngrok.com/get-started/your-authtoken 获取 authtoken
3. 配置 authtoken：

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 3. 确保服务运行

- **后端服务**: 运行在 `localhost:8080`
- **前端服务**: 运行在 `localhost:3000`
- **MySQL**: 运行在本地
- **MongoDB**: 运行在本地

---

## 🚀 快速部署（使用脚本）

### Windows

```bash
cd front_mgx_demo
start-ngrok.bat
```

### Linux/Mac

```bash
cd front_mgx_demo
chmod +x start-ngrok.sh
./start-ngrok.sh
```

---

## 📝 手动部署步骤

### 第一步：启动后端服务

```bash
cd go/src/mgx
go run application/main.go
```

确保后端在 `localhost:8080` 运行。

### 第二步：启动前端服务

打开新的终端窗口：

```bash
cd front_mgx_demo
npx http-server -p 3000
```

或者使用 Python：

```bash
python -m http.server 3000
```

### 第三步：启动 ngrok 隧道

**方式1：使用同一个 ngrok URL（推荐，更简单）**

如果前端和后端使用同一个 ngrok URL，只需要启动一个 ngrok 隧道：

```bash
# 启动后端 ngrok（前端也通过这个访问）
ngrok http 8080
```

然后配置前端服务器，将 API 请求代理到后端，或者直接使用当前域名。

**方式2：使用不同的 ngrok URL**

如果需要前端和后端使用不同的 ngrok URL：

**启动后端 ngrok 隧道：**
```bash
ngrok http 8080
```

**重要：** 记下生成的 URL，例如：
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
```

**启动前端 ngrok 隧道（新终端）：**
```bash
ngrok http 3000
```

**重要：** 记下生成的 URL，例如：
```
Forwarding   https://xyz789.ngrok-free.app -> http://localhost:3000
```

### 第五步：访问网站

**情况1：前端和后端使用不同的 ngrok URL**

访问前端 ngrok URL，并在 URL 后添加 `?api=` 参数：

```
https://xyz789.ngrok-free.app/index.html?api=https://abc123.ngrok-free.app
```

**情况2：前端和后端使用同一个 ngrok URL（推荐）**

如果前端和后端使用同一个 ngrok URL，直接访问即可，无需添加参数：

```
https://abc123.ngrok-free.app/index.html
```

系统会自动检测并使用当前域名作为 API 地址。

**完整示例：**
- 后端 ngrok URL: `https://abc123.ngrok-free.app`
- 前端 ngrok URL: `https://abc123.ngrok-free.app`（同一个）
- 访问地址: `https://abc123.ngrok-free.app/index.html`（无需参数）

或者：
- 后端 ngrok URL: `https://abc123.ngrok-free.app`
- 前端 ngrok URL: `https://xyz789.ngrok-free.app`（不同）
- 访问地址: `https://xyz789.ngrok-free.app/index.html?api=https://abc123.ngrok-free.app`

---

## 🔧 配置说明

### API 地址配置优先级

前端会自动按以下优先级选择 API 地址：

1. **URL 参数** (`?api=xxx`) - 最高优先级
2. **localStorage** - 之前保存的地址
3. **自动检测** - 根据当前域名判断

### 自动保存

首次通过 URL 参数访问后，API 地址会自动保存到浏览器的 localStorage，下次访问同一域名时无需再次添加参数。

### 清除保存的地址

如果需要清除保存的 API 地址，在浏览器控制台执行：

```javascript
localStorage.removeItem('mgx_api_url');
location.reload();
```

---

## ⚠️ 注意事项

### 1. ngrok 免费版限制

- **每次重启 ngrok，URL 会变化**
- **有连接数限制**（通常 40 个并发连接）
- **有带宽限制**
- **适合测试，不适合生产环境**

### 2. HTTPS

ngrok 自动提供 HTTPS，确保：
- 前端使用 `https://` 访问
- API 地址也使用 `https://`（ngrok 自动处理）

### 3. CORS 配置

后端已配置允许所有来源（`Access-Control-Allow-Origin: *`），ngrok 可以正常工作。

### 4. 数据库连接

确保 MySQL 和 MongoDB 在本地正常运行，ngrok 只转发 HTTP 请求，不转发数据库连接。

### 5. 防火墙

确保本地防火墙允许 8080 和 3000 端口。

---

## 🐛 故障排查

### 问题1：前端无法连接后端

**症状：** 打开网站后，API 请求失败

**解决：**
1. 检查后端 ngrok URL 是否正确
2. 检查 URL 参数格式：`?api=https://abc123.ngrok-free.app`（注意是 `https`）
3. 打开浏览器控制台（F12）查看错误信息
4. 检查后端 ngrok 窗口是否有错误

### 问题2：CORS 错误

**症状：** 浏览器控制台显示 CORS 相关错误

**解决：**
1. 检查后端 CORS 配置（应该允许所有来源）
2. 确保前端使用 HTTPS（ngrok 提供）
3. 检查请求头是否正确

### 问题3：ngrok 连接失败

**症状：** ngrok 无法启动或连接失败

**解决：**
1. 检查 ngrok authtoken 是否配置：`ngrok config add-authtoken YOUR_TOKEN`
2. 检查网络连接
3. 尝试重启 ngrok
4. 检查是否有其他程序占用端口

### 问题4：ngrok 端点已在线错误 (ERR_NGROK_334)

**症状：** 启动 ngrok 时出现错误：
```
ERROR: failed to start tunnel: The endpoint 'https://xxx.ngrok-free.dev' is already online.
ERROR: ERR_NGROK_334
```

**原因：** 已有 ngrok 进程在运行，或之前的隧道未正确关闭

**解决方法：**

**方法1：停止现有 ngrok 进程（推荐）**

**Windows:**
```bash
# 查看 ngrok 进程
tasklist | findstr ngrok

# 停止所有 ngrok 进程
taskkill /F /IM ngrok.exe
```

**Linux/Mac:**
```bash
# 查看 ngrok 进程
ps aux | grep ngrok

# 停止所有 ngrok 进程
pkill ngrok
# 或
killall ngrok
```

**方法2：使用不同的端口**

如果需要在同一台机器上运行多个 ngrok 隧道，可以使用不同的端口：

```bash
# 后端使用 8080
ngrok http 8080

# 前端使用 3000（在另一个终端）
ngrok http 3000
```

**方法3：使用 ngrok 的负载均衡功能**

如果需要多个隧道指向同一个端口，使用 `--pooling-enabled`：

```bash
ngrok http 8080 --pooling-enabled
```

**方法4：使用部署脚本**

部署脚本会自动检测并停止现有 ngrok 进程：

```bash
# Windows
start-ngrok.bat

# Linux/Mac
./start-ngrok.sh
```

### 问题4：ngrok URL 变化

**症状：** 每次重启 ngrok，URL 都会变化

**解决：**
- 这是 ngrok 免费版的正常行为
- 升级到付费版可以获得固定域名
- 或者使用其他工具（如 localtunnel、frp 等）

---

## 📊 测试清单

部署完成后，测试以下功能：

- [ ] 访问前端 ngrok URL（带 API 参数）
- [ ] 注册新用户
- [ ] 登录
- [ ] 发送消息
- [ ] 查看聊天历史
- [ ] 加载历史聊天记录

---

## 🔄 更新部署

如果需要更新代码：

1. **更新后端：**
   ```bash
   cd go/src/mgx
   go run application/main.go
   ```
   ngrok 会自动转发到新的后端实例

2. **更新前端：**
   ```bash
   cd front_mgx_demo
   # 更新文件后，刷新浏览器即可
   ```

3. **重启 ngrok：**
   - 如果 ngrok 断开，先停止现有进程：
     - Windows: 运行 `stop-ngrok.bat` 或 `taskkill /F /IM ngrok.exe`
     - Linux/Mac: 运行 `./stop-ngrok.sh` 或 `pkill ngrok`
   - 然后重新运行 `ngrok http 8080` 和 `ngrok http 3000`
   - **注意：** URL 会变化，需要更新访问地址

## 🛑 停止 ngrok

如果需要停止所有 ngrok 进程：

**Windows:**
```bash
cd front_mgx_demo
stop-ngrok.bat
```

或者手动：
```bash
taskkill /F /IM ngrok.exe
```

**Linux/Mac:**
```bash
cd front_mgx_demo
chmod +x stop-ngrok.sh
./stop-ngrok.sh
```

或者手动：
```bash
pkill ngrok
# 或
killall ngrok
```

---

## 🎯 生产环境建议

ngrok 适合测试和演示，不适合生产环境。生产环境建议：

1. **使用固定域名**（ngrok 付费版或其他服务）
2. **配置 SSL 证书**
3. **使用反向代理**（如 Nginx）
4. **配置防火墙和安全组**
5. **使用云服务器部署**

---

## 📞 快速参考

### 常用命令

```bash
# 启动后端 ngrok
ngrok http 8080

# 启动前端 ngrok
ngrok http 3000

# 查看 ngrok 配置
ngrok config check

# 查看 ngrok 状态（在 ngrok 窗口中）
# 访问 http://127.0.0.1:4040
```

### 访问格式

```
前端URL?api=后端URL

例如：
https://xyz789.ngrok-free.app/index.html?api=https://abc123.ngrok-free.app
```

---

**部署完成后，您的应用就可以通过公网访问了！** 🎉

