#!/bin/bash

# Docker Compose 兼容性包装脚本
# 使用 docker compose 命令代替 docker-compose

# 检查是否支持 docker compose
if docker compose version &> /dev/null; then
    docker compose "$@"
elif docker-compose --version &> /dev/null; then
    docker-compose "$@"
else
    echo "Error: Neither 'docker compose' nor 'docker-compose' is available"
    exit 1
fi
