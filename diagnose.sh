#!/bin/bash

# AI Creative Hub 部署诊断和修复脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AI Creative Hub 部署诊断工具${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查 Docker
echo -e "\n${GREEN}[1/6] 检查 Docker 安装...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker 已安装${NC}"
    docker --version
else
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo -e "${YELLOW}请安装 Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# 2. 检查 Docker Compose
echo -e "\n${GREEN}[2/6] 检查 Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
    docker-compose --version
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose (V2) 已安装${NC}"
    alias docker-compose='docker compose'
else
    echo -e "${RED}❌ Docker Compose 未安装${NC}"
    echo -e "${YELLOW}请安装 Docker Compose: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

# 3. 检查配置文件
echo -e "\n${GREEN}[3/6] 检查配置文件...${NC}"

if [ ! -f .docker.env ]; then
    echo -e "${RED}❌ .docker.env 文件不存在${NC}"
    echo -e "${YELLOW}正在创建 .docker.env...${NC}"
    cp .docker.env.example .docker.env || {
        echo -e "${RED}❌ 无法创建 .docker.env${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ .docker.env 已创建${NC}"
else
    echo -e "${GREEN}✅ .docker.env 已存在${NC}"
fi

if [ ! -f .env ]; then
    echo -e "${RED}❌ .env 文件不存在${NC}"
    echo -e "${YELLOW}正在创建 .env...${NC}"
    cp .env.example .env || {
        echo -e "${RED}❌ 无法创建 .env${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ .env 已创建${NC}"
else
    echo -e "${GREEN}✅ .env 已存在${NC}"
fi

# 4. 检查 docker-compose.yml 语法
echo -e "\n${GREEN}[4/6] 检查 docker-compose.yml 语法...${NC}"
if docker-compose config &> /dev/null; then
    echo -e "${GREEN}✅ docker-compose.yml 语法正确${NC}"
else
    echo -e "${RED}❌ docker-compose.yml 语法错误${NC}"
    docker-compose config
    exit 1
fi

# 5. 检查端口占用
echo -e "\n${GREEN}[5/6] 检查端口占用...${NC}"
PORTS=("8000" "3000" "5432" "6379")
PORTS_OK=true

for port in "${PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${YELLOW}⚠️  端口 $port 已被占用${NC}"
        PORTS_OK=false
    else
        echo -e "${GREEN}✅ 端口 $port 可用${NC}"
    fi
done

if [ "$PORTS_OK" = false ]; then
    echo -e "${YELLOW}注意: 某些端口已被占用，可能导致启动失败${NC}"
fi

# 6. 清理旧容器
echo -e "\n${GREEN}[6/6] 清理旧容器...${NC}"
echo -e "${YELLOW}停止并移除旧容器...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✅ 旧容器已清理${NC}"

# 诊断完成
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  诊断完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}下一步操作：${NC}"
echo ""
echo -e "1. ${YELLOW}启动服务:${NC}"
echo -e "   docker-compose up -d"
echo ""
echo -e "2. ${YELLOW}查看日志:${NC}"
echo -e "   docker-compose logs -f"
echo ""
echo -e "3. ${YELLOW}检查状态:${NC}"
echo -e "   docker-compose ps"
echo ""
echo -e "4. ${YELLOW}初始化数据库:${NC}"
echo -e "   docker-compose exec backend alembic upgrade head"
echo ""
echo -e "5. ${YELLOW}测试访问:${NC}"
echo -e "   curl http://localhost:8000/health"
echo ""
