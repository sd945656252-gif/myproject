# AI Router - Intelligent API Routing System

## 概述

AI Router 是一个智能路由系统，用于管理多个 AI 提供商的 API 调用，实现优先级路由、自动降级和错误恢复。

## 核心特性

### 1. 优先级路由
- 按预定义的优先级顺序尝试不同的提供商
- 优先使用免费/开源 API，再使用商业 API
- 最后降级到本地 ComfyUI

### 2. 自动降级 (Fallback)
- 当首选提供商失败时，自动切换到下一个可用提供商
- 记录降级历史，返回给前端用户
- 支持禁用降级模式

### 3. 健康检查
- 定期检查所有提供商的健康状态
- 记录失败次数，自动标记不健康的提供商
- 自动恢复健康的提供商

### 4. 参数校验
- 在调用前验证参数完整性
- 跨模型参数格式转换
- 自动填充默认值

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│  (ImageService, VideoService, AudioService, etc.)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Router                            │
│  • Priority Queue Manager                               │
│  • Provider Selection Algorithm                         │
│  • Fallback Engine                                       │
│  • Health Checker                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Provider Layer (Integrations)               │
│  • HuggingFace  • OpenAI  • Jimeng  • Kling            │
│  • Suno  • Minimax  • ComfyUI (local)                   │
└─────────────────────────────────────────────────────────┘
```

## 支持的提供商

### 1. HuggingFace
- **任务类型**: 图像生成、图生图、文本生成
- **优势**: 免费开源、多种模型选择
- **模型**: Stable Diffusion XL, InstructPix2Pix, GPT-2

### 2. OpenAI
- **任务类型**: 图像生成、文本生成、TTS
- **优势**: 质量高、API 稳定
- **模型**: DALL-E 3, GPT-4, TTS-1

### 3. Jimeng (ByteDance)
- **任务类型**: 图像生成、视频生成
- **优势**: 专为中文优化、Seedance 2.0
- **模型**: Jimeng-v1, Seedance 2.0

### 4. Kling AI
- **任务类型**: 视频生成、图生视频、视频转视频
- **优势**: 视频质量高、支持长视频
- **模型**: Kling 3.0

### 5. Suno
- **任务类型**: 音乐生成
- **优势**: 专业音乐生成
- **模型**: Suno-v3

### 6. Minimax
- **任务类型**: TTS、语音克隆
- **优势**: 中文语音效果好
- **模型**: Speech-01

## 使用示例

### 基本使用

```python
from app.core.ai_router import get_router, TaskType

# 获取路由实例
router = await get_router()

# 生成图像
result = await router.route(
    task_type=TaskType.IMAGE_GENERATION,
    params={
        "prompt": "A beautiful sunset",
        "width": 1024,
        "height": 1024,
    },
    fallback_enabled=True,
)

print(f"Provider: {result['routing']['provider']}")
print(f"Images: {result['images']}")
```

### 在服务层中使用

```python
class ImageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def text_to_image(self, request: TextToImageRequest):
        # 获取路由实例
        from app.core.ai_router import get_router
        router = await get_router()

        # 准备参数
        params = request.model_dump()

        # 路由请求
        result = await router.route(
            task_type=TaskType.IMAGE_GENERATION,
            params=params,
            fallback_enabled=True,
        )

        # 处理结果
        return result
```

### 获取提供商状态

```python
router = await get_router()
status = await router.get_provider_status()

for provider, health in status.items():
    print(f"{provider}: {health}")
```

## 优先级配置

优先级配置在 `app/core/router.py` 中定义：

```python
MODEL_PRIORITIES = {
    "image_generation": [
        {
            "provider": "huggingface",
            "model": "stabilityai/stable-diffusion-xl-base-1.0",
            "priority": 1,
            "cost": "free",
        },
        {
            "provider": "jimeng",
            "model": "jimeng-v1",
            "priority": 2,
            "cost": "paid",
        },
        {
            "provider": "openai",
            "model": "dall-e-3",
            "priority": 3,
            "cost": "paid",
        },
    ],
    # ... 更多配置
}
```

## 错误处理

### 自动重试
- 连接失败自动重试
- 超时自动切换提供商
- 限流自动降级

### 错误响应
```json
{
  "success": false,
  "error": "All providers failed",
  "attempted_providers": ["huggingface", "jimeng"],
  "routing": {
    "fallback_used": true,
    "message": "Successfully switched to openai"
  }
}
```

## API 端点

### 获取路由健康状态
```
GET /api/v1/router/health
```

响应：
```json
{
  "status": "healthy",
  "providers": {
    "huggingface": "healthy",
    "openai": "healthy",
    "jimeng": "degraded"
  },
  "total_providers": 3
}
```

### 获取优先级配置
```
GET /api/v1/router/priority
```

## 测试

运行测试脚本：
```bash
cd backend
python test_router.py
```

## 最佳实践

1. **始终启用降级**: 生产环境应该启用 fallback
2. **监控提供商状态**: 定期检查 `/api/v1/router/health`
3. **合理配置超时**: 根据任务类型设置合适的超时时间
4. **记录降级事件**: 监控降级频率，优化优先级配置

## 未来扩展

- [ ] 添加更多提供商 (Midjourney, Claude, 等)
- [ ] 支持负载均衡
- [ ] 智能成本优化
- [ ] A/B 测试支持
- [ ] 实时性能监控
