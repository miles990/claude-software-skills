# Claude Software Skills

> 47 modular software development skills for Claude Code - from architecture to deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                  Claude Software Skills                         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   Software   │  │   Software   │  │ Development  │         │
│   │    Design    │  │ Engineering  │  │    Stacks    │         │
│   │      6       │  │      7       │  │      8       │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │    Tools &   │  │   Domain     │  │ Programming  │         │
│   │ Integrations │  │ Applications │  │  Languages   │         │
│   │      6       │  │      8       │  │     12       │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│                   Total: 47 skill modules                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🤖 Auto-Dev: Automated Development Workflow

一鍵設定 GitHub Actions 自動開發流程，讓 Claude 幫你完成開發任務。

### 快速安裝

**使用 API Key：**
```bash
curl -fsSL https://raw.githubusercontent.com/miles990/claude-software-skills/main/scripts/setup-auto-dev-apikey.sh | bash
```

**使用 Claude Max（OAuth）：**
```bash
curl -fsSL https://raw.githubusercontent.com/miles990/claude-software-skills/main/scripts/setup-auto-dev-max.sh | bash
```

### 安裝後設定

| 版本 | 設定方式 |
|------|----------|
| API Key | 到 [console.anthropic.com](https://console.anthropic.com/settings/keys) 取得 Key，設定到 GitHub Secrets `ANTHROPIC_API_KEY` |
| Claude Max | 執行 `claude /install-github-app` 自動設定 OAuth Token |

### 使用方式

- **Issue 觸發**：建立 Issue → 加上 `auto-dev` label
- **留言觸發**：在任何 Issue/PR 留言 `@claude [指令]`

詳細文檔：[AUTO-DEV.md](.github/AUTO-DEV.md)

---

## Features

- **MCP Compatible** - Works with Claude Code, Cursor, and other MCP clients
- **Semantic Search** - Claude automatically finds relevant skills for your task
- **Cross-Domain Integration** - Skills work together seamlessly
- **Best Practices Built-In** - Each skill includes patterns and anti-patterns
- **Modular Architecture** - Use only what you need

## Installation

### Option 1: Claude Code (Recommended)

```bash
# Clone to your skills directory
git clone https://github.com/user/claude-software-skills.git ~/.claude/skills/software-skills
```

Claude will automatically discover and use the skills when relevant to your tasks.

### Option 2: With MCP Server

This repository is compatible with [claude-skills-mcp](https://github.com/K-Dense-AI/claude-skills-mcp):

```bash
# Install the MCP server
pip install claude-skills-mcp

# Add this repository as a skill source
# The server will load skills from ~/.claude/skills/
```

### Option 3: Cursor IDE

Add to your Cursor MCP settings:
```json
{
  "mcpServers": {
    "software-skills": {
      "command": "npx",
      "args": ["-y", "claude-skills-mcp"],
      "env": {
        "SKILLS_PATH": "/path/to/claude-software-skills"
      }
    }
  }
}
```

### Option 4: Manual Reference

Simply clone and reference the SKILL.md files in your prompts:
```bash
git clone https://github.com/user/claude-software-skills.git
```

## Skill Categories

### 1. Software Design (6 skills)
- `architecture-patterns` - Microservices, monolith, event-driven, hexagonal
- `design-patterns` - GoF patterns, SOLID principles, DRY/KISS
- `api-design` - REST, GraphQL, gRPC, OpenAPI
- `system-design` - Scalability, high availability, distributed systems
- `data-design` - Data modeling, normalization, schema design
- `ux-principles` - Usability, accessibility, design systems

### 2. Software Engineering (7 skills)
- `code-quality` - Clean code, refactoring, code review
- `testing-strategies` - Unit, integration, E2E, TDD/BDD
- `devops-cicd` - CI/CD pipelines, GitOps, infrastructure as code
- `performance-optimization` - Profiling, caching, optimization
- `security-practices` - OWASP, authentication, encryption
- `reliability-engineering` - SRE, chaos engineering, observability
- `documentation` - Technical writing, API docs, architecture docs

### 3. Development Stacks (8 skills)
- `frontend` - React, Vue, Angular, Svelte, Next.js
- `backend` - Node.js, Python, Go, Rust frameworks
- `mobile` - React Native, Flutter, iOS, Android
- `database` - PostgreSQL, MongoDB, Redis, Elasticsearch
- `cloud-platforms` - AWS, GCP, Azure, Vercel
- `ai-ml-integration` - LLM APIs, embeddings, vector DBs
- `realtime-systems` - WebSocket, SSE, message queues
- `edge-iot` - Edge computing, IoT protocols

### 4. Tools & Integrations (6 skills)
- `git-workflows` - Branching strategies, hooks, conventional commits
- `project-management` - Agile, Scrum, Kanban, issue tracking
- `development-environment` - Docker, VS Code, debugging
- `monitoring-logging` - Prometheus, Grafana, structured logging
- `api-tools` - Postman, curl, API testing
- `automation-scripts` - Make, npm scripts, task runners

### 5. Domain Applications (8 skills)
- `application-patterns` - MVC, CQRS, event sourcing
- `e-commerce` - Shopping cart, payments, inventory
- `saas-platforms` - Multi-tenancy, billing, user management
- `content-platforms` - CMS, media handling, search
- `communication-systems` - Email, notifications, chat
- `developer-tools` - CLI tools, SDKs, plugins
- `game-development` - Game loop, physics, rendering
- `desktop-apps` - Electron, Tauri, native apps

### 6. Programming Languages (12 skills)
- `javascript-typescript` - Modern JS/TS, Node.js ecosystem
- `python` - Python best practices, async, typing
- `go` - Go idioms, concurrency, performance
- `rust` - Ownership, lifetimes, safe concurrency
- `java-kotlin` - JVM ecosystem, Spring, Android
- `csharp-dotnet` - .NET ecosystem, ASP.NET, LINQ
- `cpp` - Modern C++, memory management, performance
- `ruby` - Ruby idioms, Rails, metaprogramming
- `php` - Modern PHP, Laravel, Composer
- `swift` - iOS/macOS development, SwiftUI
- `shell-bash` - Scripting, automation, CLI tools
- `sql` - Query optimization, database design

## Usage Examples

```
User: Help me design a microservices architecture for an e-commerce platform

Claude: [Automatically uses architecture-patterns + e-commerce + api-design skills]
```

```
User: Review this Python code for performance issues

Claude: [Automatically uses python + performance-optimization + code-quality skills]
```

```
User: Set up CI/CD for a React + Node.js monorepo

Claude: [Automatically uses devops-cicd + frontend + backend + git-workflows skills]
```

## Directory Structure

```
claude-software-skills/
├── .claude-plugin/          # Plugin configuration
│   └── marketplace.json
├── .github/
│   └── workflows/           # CI/CD automation
│       └── release.yml
├── software-design/         # Architecture & design skills
├── software-engineering/    # Development practices
├── development-stacks/      # Tech stack skills
├── tools-integrations/      # Developer tools
├── domain-applications/     # Domain-specific patterns
├── programming-languages/   # Language-specific skills
├── docs/
│   ├── SKILL-TEMPLATE.md    # Template for new skills
│   └── software-skills.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## How It Works

Each skill module contains a `SKILL.md` file with:

1. **Metadata** - Name, description, tags for semantic search
2. **Key Concepts** - Core knowledge and terminology
3. **Best Practices** - Recommended approaches with examples
4. **Common Pitfalls** - What to avoid and why
5. **Patterns & Anti-patterns** - Do's and don'ts with code
6. **Tools & Resources** - Recommended tools and references
7. **Decision Guide** - When to use this skill

When you describe a task, Claude:
1. Searches for relevant skills using semantic matching
2. Loads the appropriate SKILL.md files
3. Applies the knowledge to your specific context
4. Follows best practices while avoiding common pitfalls

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding a New Skill

1. Create a directory under the appropriate category
2. Add a `SKILL.md` following our [template](docs/SKILL-TEMPLATE.md)
3. Include practical examples and best practices
4. Submit a pull request

## License

MIT License - See [LICENSE](LICENSE) for details.

## Related Projects

- [claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) - Scientific research skills
- [claude-skills-mcp](https://github.com/K-Dense-AI/claude-skills-mcp) - MCP server for skill discovery

---

*Built for developers, by developers, with Claude*
