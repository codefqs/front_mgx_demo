@echo off
chcp 65001 >nul
echo ========================================
echo   停止所有 ngrok 进程
echo ========================================
echo.

echo 正在查找 ngrok 进程...
tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I /N "ngrok.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo 找到 ngrok 进程，正在停止...
    taskkill /F /IM ngrok.exe
    if %errorlevel% equ 0 (
        echo ✅ 已成功停止所有 ngrok 进程
    ) else (
        echo ❌ 停止 ngrok 进程失败，可能需要管理员权限
    )
) else (
    echo ℹ️  未找到运行中的 ngrok 进程
)

echo.
pause

