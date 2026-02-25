#!/bin/bash

# AI Creative Hub 简化部署脚本

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AI Creative Hub 快速部署${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 运行诊断
echo -e "\n${GREEN}[1/4] 运行诊断...${NC}"
./diagnose.sh

# 2. 启动服务
echo -e "\n${GREEN}[2/4] 启动服务...${NC}"
docker-compose up -d

# 3. 等待服务启动
echo -e "\n${GREEN}[3/4] 等待服务启动...${NC}"
sleep 15

# 4. 初始化数据库
echo -e "\n${GREEN}[4/4] 初始化数据库...${NC}"
if docker-compose exec -T backend alembic upgrade head; then
    echo -e "${GREEN}✅ 数据库初始化成功${NC}"
else
    echo -e "${YELLOW}⚠️  数据库初始化失败，请手动执行:${NC}"
    echo -e "   docker-compose exec backend alembic upgrade head"
fi

# 显示状态
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"

docker-compose ps

echo ""
echo -e "${GREEN}访问地址:${NC}"
echo -e "  前端: http://localhost:3000"
echo -e "  后端: http://localhost:8000"
echo -e "  健康检查: http://localhost:8000/health"
echo ""

echo -e "${GREEN}常用命令:${NC}"
echo -e "  查看日志: docker-compose logs -f"
echo -e "  停止服务: docker-compose down"
echo -e "  重启服务: docker-compose restart"
echo ""
