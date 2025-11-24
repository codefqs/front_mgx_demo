@echo off
chcp 65001 >nul
echo ========================================
echo   MGX ngrok 快速部署脚本
echo ========================================
echo.

echo [1/5] 检查后端服务...
curl -s http://localhost:8080/login >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 后端服务未运行在 localhost:8080
    echo.
    echo 请先启动后端服务：
    echo   cd go/src/mgx
    echo   go run application/main.go
    echo.
    pause
    exit /b 1
)
echo ✅ 后端服务运行中

echo.
echo [2/5] 检查前端服务...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  前端服务未运行在 localhost:3000
    echo 正在启动前端服务...
    start /b npx http-server -p 3000 >nul 2>&1
    timeout /t 3 >nul
    echo ✅ 前端服务已启动
) else (
    echo ✅ 前端服务运行中
)

echo.
echo [3/5] 检查并启动 ngrok 隧道...
echo.
echo 提示：如果前端和后端使用同一个 ngrok URL，只需要启动一个隧道
echo 如果使用不同的 URL，需要启动两个隧道
echo.
set /p USE_SAME_URL="前端和后端使用同一个 ngrok URL? (Y/N，默认Y): "
if /i "%USE_SAME_URL%"=="N" (
    echo.
    echo 启动后端 ngrok 隧道...
    tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo ⚠️  检测到已有 ngrok 进程在运行
        echo 正在停止现有 ngrok 进程...
        taskkill /F /IM ngrok.exe >nul 2>&1
        timeout /t 2 >nul
        echo ✅ 已停止现有 ngrok 进程
    )
    start "后端 ngrok" cmd /k "ngrok http 8080"
    timeout /t 3 >nul
    
    echo.
    echo 启动前端 ngrok 隧道...
    start "前端 ngrok" cmd /k "ngrok http 3000"
    timeout /t 2 >nul
    set BACKEND_URL=后端ngrok的URL
    set FRONTEND_URL=前端ngrok的URL
) else (
    echo.
    echo 启动 ngrok 隧道（前端和后端共用）...
    tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo ⚠️  检测到已有 ngrok 进程在运行
        echo 正在停止现有 ngrok 进程...
        taskkill /F /IM ngrok.exe >nul 2>&1
        timeout /t 2 >nul
        echo ✅ 已停止现有 ngrok 进程
    )
    start "ngrok" cmd /k "ngrok http 8080"
    timeout /t 3 >nul
    set BACKEND_URL=ngrok的URL
    set FRONTEND_URL=ngrok的URL
)

echo.
echo [5/5] 部署完成！
echo.
echo ========================================
echo   下一步操作
echo ========================================
echo.
echo 1. 在 ngrok 窗口中，找到 "Forwarding" 行
echo    例如: https://abc123.ngrok-free.app -^> http://localhost:8080
echo.
if "%USE_SAME_URL%"=="N" (
    echo 2. 记下后端 ngrok URL（例如: https://abc123.ngrok-free.app）
    echo.
    echo 3. 记下前端 ngrok URL（例如: https://xyz789.ngrok-free.app）
    echo.
    echo 4. 访问前端时，在 URL 后添加参数：
    echo    ?api=后端ngrok的URL
    echo.
    echo    例如：
    echo    https://xyz789.ngrok-free.app/index.html?api=https://abc123.ngrok-free.app
) else (
    echo 2. 记下 ngrok URL（例如: https://abc123.ngrok-free.app）
    echo.
    echo 3. 直接访问，无需添加参数：
    echo    https://abc123.ngrok-free.app/index.html
    echo.
    echo    ✅ 系统会自动使用当前域名作为 API 地址
)
echo.
echo 5. 首次访问后，API 地址会自动保存到浏览器，下次访问无需添加参数
echo.
echo ========================================
pause

