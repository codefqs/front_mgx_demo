#!/bin/bash

echo "========================================"
echo "  停止所有 ngrok 进程"
echo "========================================"
echo ""

echo "正在查找 ngrok 进程..."
if pgrep -x ngrok > /dev/null 2>&1; then
    echo "找到 ngrok 进程，正在停止..."
    pkill -x ngrok
    if [ $? -eq 0 ]; then
        echo "✅ 已成功停止所有 ngrok 进程"
    else
        echo "❌ 停止 ngrok 进程失败"
    fi
else
    echo "ℹ️  未找到运行中的 ngrok 进程"
fi

echo ""

