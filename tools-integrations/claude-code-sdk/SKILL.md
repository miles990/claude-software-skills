---
name: claude-code-sdk
description: Claude Code SDK integration for building AI-powered applications with OAuth and API Key authentication
domain: tools-integrations
subdomain: ai-agent-integration
version: 1.0.0
tags: [claude, anthropic, sdk, ai-agent, oauth, fastapi, streaming, sse]
triggers:
  keywords:
    primary: [claude-code-sdk, claude sdk, claude agent, anthropic sdk, claude integration]
    secondary: [ai agent, claude api, claude oauth, claude login, max plan]
  context_boost: [python, fastapi, backend, streaming, sse, authentication]
  context_penalty: [frontend only, browser direct]
  priority: high
---

# Claude Code SDK Integration

## Overview

Claude Code SDK (`claude-code-sdk`) 是 Anthropic 官方提供的 Python 套件，用於在應用程式中整合 Claude AI Agent 功能。它支援 OAuth 認證（透過 `claude login`）和 API Key 認證，讓開發者可以利用 Claude Max/Pro 訂閱或 API 計費方案。這個 SDK 是建立 AI-powered 應用程式的關鍵工具，特別適合需要程式碼生成、檔案操作、或多輪對話的場景。

## Key Concepts

### 認證方式

**Description**: Claude Code SDK 支援兩種認證方式
**Key Features**:
- **OAuth 認證**: 使用 `claude login` 後存儲在 `~/.claude/` 的憑證
- **API Key 認證**: 透過 `ANTHROPIC_API_KEY` 環境變數

**Use Cases**:
- OAuth：個人開發、有 Max/Pro 訂閱的用戶
- API Key：生產環境、需要計量計費的服務

### SDK 核心 API

**Description**: `query()` 函數是主要的非同步介面
**Key Features**:
- 非同步迭代器回傳訊息
- 支援 streaming 和完整回應
- 可配置工具權限和執行限制

**Use Cases**: 程式碼生成、檔案操作、研究任務、唯讀分析

### 工具類型 (ToolType)

**Description**: SDK 支援多種內建工具
**Key Features**:
- `READ`, `WRITE`, `EDIT` - 檔案操作
- `BASH` - 終端命令執行
- `GLOB`, `GREP` - 檔案搜尋
- `WEB_FETCH` - 網頁抓取

## Best Practices

1. **雙重認證檢查**
   - 同時支援 OAuth 和 API Key
   - 優先使用 OAuth（免費使用 Max/Pro 配額）
   - API Key 作為後備方案

```python
def check_auth_status() -> dict:
    status = {
        'api_key_set': bool(os.environ.get('ANTHROPIC_API_KEY')),
        'oauth_logged_in': False,
    }

    # 檢查 OAuth 登入狀態
    claude_dir = os.path.expanduser('~/.claude')
    if os.path.exists(claude_dir):
        auth_files = ['credentials.json', 'settings.json', '.credentials.json']
        for auth_file in auth_files:
            if os.path.exists(os.path.join(claude_dir, auth_file)):
                status['oauth_logged_in'] = True
                break

    # 只需要其中一種認證
    status['auth_available'] = status['api_key_set'] or status['oauth_logged_in']
    return status
```

2. **增加 Buffer Size**
   - 預設 buffer 太小，處理大型回應會出錯
   - 建議增加到 50MB

```python
try:
    from claude_code_sdk._internal.transport import subprocess_cli
    subprocess_cli._MAX_BUFFER_SIZE = 50 * 1024 * 1024  # 50MB
except Exception as e:
    print(f"Failed to patch SDK buffer size: {e}")
```

3. **使用 Singleton Pattern**
   - 避免重複初始化
   - 共享狀態和配置

```python
_claude_service: Optional['ClaudeCodeService'] = None

def get_claude_code() -> 'ClaudeCodeService':
    global _claude_service
    if _claude_service is None:
        _claude_service = ClaudeCodeService()
    return _claude_service
```

4. **預設配置模式**
   - 依據使用場景限制工具權限
   - 降低風險，提升安全性

```python
@dataclass
class AgentConfig:
    allowed_tools: List[str]
    max_turns: int = 30
    cwd: Optional[str] = None

    @classmethod
    def coding(cls) -> 'AgentConfig':
        """開發模式：完整權限"""
        return cls(
            allowed_tools=['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
            max_turns=50
        )

    @classmethod
    def research(cls) -> 'AgentConfig':
        """研究模式：可上網"""
        return cls(
            allowed_tools=['Read', 'Glob', 'Grep', 'WebFetch'],
            max_turns=20
        )

    @classmethod
    def readonly(cls) -> 'AgentConfig':
        """唯讀模式：最安全"""
        return cls(
            allowed_tools=['Read', 'Glob', 'Grep'],
            max_turns=10
        )
```

## Common Pitfalls

### Pitfall 1: 直接在前端呼叫 SDK

- **Problem**: claude-code-sdk 是 Python 套件，無法在瀏覽器中運行
- **Solution**: 必須建立後端 API 服務
- **Example**:

```python
# ❌ 錯誤：嘗試在前端使用
# JavaScript 無法直接使用 Python SDK

# ✅ 正確：建立 FastAPI 後端
from fastapi import FastAPI
from claude_code_sdk import query

app = FastAPI()

@app.post("/api/generate")
async def generate(prompt: str):
    result = []
    async for msg in query(prompt=prompt):
        result.append(msg)
    return {"result": result}
```

### Pitfall 2: 忘記處理非同步

- **Problem**: SDK 是非同步的，忘記 await 會導致錯誤
- **Solution**: 使用 async/await 或 asyncio

```python
# ❌ 錯誤
def run_sync():
    for msg in query(prompt="Hello"):  # TypeError
        print(msg)

# ✅ 正確
async def run_async():
    async for msg in query(prompt="Hello"):
        print(msg)
```

### Pitfall 3: 混淆 Claude API 和 Claude Code SDK

- **Problem**:
  - Claude API (`anthropic` 套件) - 直接 HTTP API，需要 API Key
  - Claude Code SDK (`claude-code-sdk`) - Agent 功能，支援 OAuth
- **Solution**: 根據需求選擇正確的套件

| 特性 | Claude API | Claude Code SDK |
|------|-----------|-----------------|
| 認證 | API Key only | OAuth + API Key |
| 功能 | 純對話 | Agent (檔案/終端操作) |
| 計費 | API 用量計費 | Max/Pro 訂閱可用 |
| 套件 | `anthropic` | `claude-code-sdk` |

## Patterns & Anti-Patterns

### Patterns (Do This)

**完整的服務封裝**:

```python
from dataclasses import dataclass, field
from typing import AsyncIterator, Optional, List, Dict, Any
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock

@dataclass
class ClaudeCodeService:
    """Claude Code 服務封裝"""

    async def run(self, prompt: str, config: Optional[AgentConfig] = None) -> Dict[str, Any]:
        """執行並收集完整結果"""
        options = ClaudeCodeOptions(
            allowed_tools=config.allowed_tools if config else None,
            max_turns=config.max_turns if config else 30,
            cwd=config.cwd
        )

        result_texts = []
        tool_calls = []

        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        result_texts.append(block.text)

        return {
            'status': 'success',
            'result': '\n'.join(result_texts),
            'tool_calls': tool_calls
        }

    async def stream(self, prompt: str, config: Optional[AgentConfig] = None) -> AsyncIterator[dict]:
        """串流執行，即時回傳"""
        options = ClaudeCodeOptions(
            allowed_tools=config.allowed_tools if config else None,
            max_turns=config.max_turns if config else 30
        )

        async for message in query(prompt=prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        yield {'type': 'text', 'content': block.text}
```

**FastAPI 串流端點**:

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/api/agent/stream")
async def agent_stream(prompt: str):
    async def event_generator():
        service = ClaudeCodeService()
        async for msg in service.stream(prompt):
            yield f"data: {json.dumps(msg)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### Anti-Patterns (Avoid This)

```python
# ❌ 不要在每次請求都建立新服務
@app.post("/api/generate")
async def bad_generate(prompt: str):
    service = ClaudeCodeService()  # 每次都新建
    return await service.run(prompt)

# ❌ 不要忽略錯誤處理
async def bad_run(prompt: str):
    async for msg in query(prompt=prompt):  # 可能拋出異常
        print(msg)

# ❌ 不要給予過多權限
config = AgentConfig(
    allowed_tools=['Read', 'Write', 'Edit', 'Bash', 'WebFetch'],  # 全開
    max_turns=100  # 太多
)
```

## Tools & Resources

| Tool | Purpose | Link |
|------|---------|------|
| claude-code-sdk | 官方 Python SDK | `pip install claude-code-sdk` |
| Claude Code CLI | 命令列工具 | `npm install -g @anthropic-ai/claude-code` |
| FastAPI | 後端框架 | [fastapi.tiangolo.com](https://fastapi.tiangolo.com) |

## Decision Guide

Use Claude Code SDK when:
- [x] 需要 Agent 功能（檔案操作、終端命令）
- [x] 想使用 Max/Pro 訂閱而非 API 計費
- [x] 建立需要多輪互動的 AI 應用
- [x] 需要串流即時回應

Consider alternatives when:
- [ ] 只需要簡單對話 → 使用 `anthropic` 套件
- [ ] 純前端應用 → 使用 `anthropic` + `anthropic-dangerous-direct-browser-access`
- [ ] 不需要 Agent 功能 → 使用標準 Claude API

## Examples

### Example 1: 完整後端服務

**Context**: 建立一個可以利用 Claude Max 訂閱的後端 API

**Implementation**:

```python
# backend/main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, TextBlock

app = FastAPI()

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    max_turns: int = 30

def check_auth():
    """檢查認證狀態"""
    api_key = bool(os.environ.get('ANTHROPIC_API_KEY'))
    oauth = os.path.exists(os.path.expanduser('~/.claude/credentials.json'))
    return api_key or oauth

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "auth_available": check_auth()
    }

@app.post("/api/generate")
async def generate(request: GenerateRequest):
    if not check_auth():
        raise HTTPException(401, "請先執行 claude login 或設置 ANTHROPIC_API_KEY")

    options = ClaudeCodeOptions(max_turns=request.max_turns)
    results = []

    async for message in query(prompt=request.prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    results.append(block.text)

    return {"result": "\n".join(results)}

@app.post("/api/stream")
async def stream(request: GenerateRequest):
    if not check_auth():
        raise HTTPException(401, "未認證")

    async def event_generator():
        options = ClaudeCodeOptions(max_turns=request.max_turns)
        async for message in query(prompt=request.prompt, options=options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        yield f"data: {json.dumps({'text': block.text})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**requirements.txt**:
```
fastapi>=0.100.0
uvicorn>=0.23.0
claude-code-sdk>=0.1.0
python-dotenv>=1.0.0
```

**Explanation**: 這個後端會自動檢測 OAuth 或 API Key 認證，支援一般請求和串流回應。

### Example 2: 前端整合

**Context**: 前端呼叫後端 API

**Implementation**:

```javascript
// 一般請求
async function generate(prompt) {
    const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.result;
}

// 串流請求
async function streamGenerate(prompt, onChunk) {
    const response = await fetch('http://localhost:8000/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                const data = JSON.parse(line.slice(6));
                onChunk(data.text);
            }
        }
    }
}
```

### Example 3: Docker 部署

**Context**: 容器化部署包含 Claude Code CLI

**Implementation**:

```dockerfile
# Dockerfile
FROM python:3.11-slim

# 安裝 Node.js (Claude Code CLI 需要)
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# 安裝 Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ~/.claude:/root/.claude:ro  # 掛載 OAuth 憑證
```

## Related Skills

- [[api-design]] - 設計 REST API 端點
- [[backend]] - Python/FastAPI 後端開發
- [[devops-cicd]] - Docker 部署和 CI/CD
- [[security-practices]] - API 認證和安全

## References

- [Claude Code SDK GitHub](https://github.com/anthropics/claude-code)
- [Anthropic API Documentation](https://docs.anthropic.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
