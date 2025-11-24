#!/bin/bash

echo "========================================"
echo "  MGX ngrok 快速部署脚本"
echo "========================================"
echo ""

# 检查后端服务
echo "[1/5] 检查后端服务..."
if curl -s http://localhost:8080/login > /dev/null 2>&1; then
    echo "✅ 后端服务运行中"
else
    echo "❌ 后端服务未运行在 localhost:8080"
    echo ""
    echo "请先启动后端服务："
    echo "  cd go/src/mgx"
    echo "  go run application/main.go"
    echo ""
    exit 1
fi

# 检查前端服务
echo ""
echo "[2/5] 检查前端服务..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务运行中"
else
    echo "⚠️  前端服务未运行在 localhost:3000"
    echo "正在启动前端服务..."
    cd "$(dirname "$0")"
    npx http-server -p 3000 > /dev/null 2>&1 &
    sleep 3
    echo "✅ 前端服务已启动"
fi

# 启动 ngrok
echo ""
echo "[3/5] 检查并启动 ngrok 隧道..."
echo ""
echo "提示：如果前端和后端使用同一个 ngrok URL，只需要启动一个隧道"
echo "如果使用不同的 URL，需要启动两个隧道"
echo ""
read -p "前端和后端使用同一个 ngrok URL? (Y/N，默认Y): " USE_SAME_URL
USE_SAME_URL=${USE_SAME_URL:-Y}

# 检查是否有 ngrok 进程在运行
if pgrep -x ngrok > /dev/null 2>&1; then
    echo "⚠️  检测到已有 ngrok 进程在运行"
    echo "正在停止现有 ngrok 进程..."
    pkill -x ngrok
    sleep 2
    echo "✅ 已停止现有 ngrok 进程"
fi

if [[ "$USE_SAME_URL" =~ ^[Nn]$ ]]; then
    # 使用不同的 URL
    echo ""
    echo "启动后端 ngrok 隧道..."
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "ngrok http 8080; exec bash" 2>/dev/null
    elif command -v xterm &> /dev/null; then
        xterm -e "ngrok http 8080" &
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e 'tell app "Terminal" to do script "ngrok http 8080"' 2>/dev/null
    else
        echo "请手动在新终端运行: ngrok http 8080"
    fi
    
    sleep 3
    
    echo ""
    echo "启动前端 ngrok 隧道..."
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "ngrok http 3000; exec bash" 2>/dev/null
    elif command -v xterm &> /dev/null; then
        xterm -e "ngrok http 3000" &
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e 'tell app "Terminal" to do script "ngrok http 3000"' 2>/dev/null
    else
        echo "请手动在新终端运行: ngrok http 3000"
    fi
else
    # 使用同一个 URL
    echo ""
    echo "启动 ngrok 隧道（前端和后端共用）..."
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "ngrok http 8080; exec bash" 2>/dev/null
    elif command -v xterm &> /dev/null; then
        xterm -e "ngrok http 8080" &
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e 'tell app "Terminal" to do script "ngrok http 8080"' 2>/dev/null
    else
        echo "请手动在新终端运行: ngrok http 8080"
    fi
fi

sleep 3

echo ""
echo "[5/5] 部署完成！"
echo ""
echo "========================================"
echo "  下一步操作"
echo "========================================"
echo ""
if [[ "$USE_SAME_URL" =~ ^[Nn]$ ]]; then
    echo "1. 在两个 ngrok 窗口中，找到 'Forwarding' 行"
    echo "   例如: https://abc123.ngrok-free.app -> http://localhost:8080"
    echo ""
    echo "2. 记下后端 ngrok URL（例如: https://abc123.ngrok-free.app）"
    echo ""
    echo "3. 记下前端 ngrok URL（例如: https://xyz789.ngrok-free.app）"
    echo ""
    echo "4. 访问前端时，在 URL 后添加参数："
    echo "   ?api=后端ngrok的URL"
    echo ""
    echo "   例如："
    echo "   https://xyz789.ngrok-free.app/index.html?api=https://abc123.ngrok-free.app"
else
    echo "1. 在 ngrok 窗口中，找到 'Forwarding' 行"
    echo "   例如: https://abc123.ngrok-free.app -> http://localhost:8080"
    echo ""
    echo "2. 记下 ngrok URL（例如: https://abc123.ngrok-free.app）"
    echo ""
    echo "3. 直接访问，无需添加参数："
    echo "   https://abc123.ngrok-free.app/index.html"
    echo ""
    echo "   ✅ 系统会自动使用当前域名作为 API 地址"
fi
echo ""
echo "5. 首次访问后，API 地址会自动保存到浏览器，下次访问无需添加参数"
echo ""
echo "========================================"

