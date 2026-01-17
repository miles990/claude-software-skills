# Claude Software Skills

> 55 modular software development skills for Claude Code - from architecture to deployment

[![Skills](https://img.shields.io/badge/skills-55-blue)](./README.md)
[![Categories](https://img.shields.io/badge/categories-6-green)](./README.md)
[![Plugin](https://img.shields.io/badge/Claude_Code-Plugin-orange)](https://code.claude.com/docs/en/discover-plugins)

```
┌─────────────────────────────────────────────────────────────────┐
│                  Claude Software Skills                         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   Software   │  │   Software   │  │ Development  │         │
│   │    Design    │  │ Engineering  │  │    Stacks    │         │
│   │      6       │  │      8       │  │      8       │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │    Tools &   │  │   Domain     │  │ Programming  │         │
│   │ Integrations │  │ Applications │  │  Languages   │         │
│   │      9       │  │     12       │  │     12       │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│              AI 自動識別任務 → 載入對應領域知識                 │
└─────────────────────────────────────────────────────────────────┘
```

## Features

- **MCP Compatible** - Works with Claude Code, Cursor, and other MCP clients
- **Semantic Search** - Claude automatically finds relevant skills for your task
- **Cross-Domain Integration** - Skills work together seamlessly
- **Best Practices Built-In** - Each skill includes patterns and anti-patterns
- **Modular Architecture** - Use only what you need
- **Sharp Edges** - Proactive warnings about common pitfalls with detection patterns
- **Validations** - Executable code quality rules with regex/ast patterns
- **Collaboration** - Skills declare relationships for smart delegation and context passing

## Installation

### Plugin Marketplace (Recommended)

```bash
# 1. Add marketplace (GitHub format: owner/repo)
/plugin marketplace add miles990/claude-software-skills

# 2. Open plugin management interface, view available plugins in Discover tab
/plugin

# 3. Install specific skills (choose what you need)
/plugin install frontend@claude-software-skills
/plugin install backend@claude-software-skills
/plugin install api-design@claude-software-skills

# Or mention skill name in conversation, Claude will auto-load
```

**Supported GitHub formats:**
```bash
# Short format (recommended)
/plugin marketplace add miles990/claude-software-skills

# HTTPS URL
/plugin marketplace add https://github.com/miles990/claude-software-skills.git

# Specify branch or tag
/plugin marketplace add miles990/claude-software-skills#main
```

**Plugin commands:**
| Command | Description |
|---------|-------------|
| `/plugin` | Open interactive plugin management interface |
| `/plugin install <name>@<marketplace>` | Install specific plugin |
| `/plugin disable <name>@<marketplace>` | Temporarily disable plugin |
| `/plugin uninstall <name>@<marketplace>` | Completely remove plugin |

## Available Skills

### Software Design (6 skills)

| Skill | Description |
|-------|-------------|
| `architecture-patterns` | Software architecture patterns and best practices |
| `design-patterns` | Classic and modern software design patterns |
| `api-design` | RESTful, GraphQL, gRPC, and API best practices |
| `system-design` | Scalability, availability, and distributed systems design |
| `data-design` | Data modeling, schema design, and data architecture |
| `ux-principles` | User experience design principles for developers |

### Software Engineering (8 skills)

| Skill | Description |
|-------|-------------|
| `code-quality` | Clean code principles, SOLID, and code review practices |
| `testing-strategies` | Unit, integration, E2E testing and TDD practices |
| `devops-cicd` | CI/CD pipelines, infrastructure as code, and deployment |
| `performance-optimization` | Profiling, optimization techniques, and best practices |
| `security-practices` | OWASP Top 10, authentication, and secure coding |
| `reliability-engineering` | SRE principles, observability, and incident management |
| `documentation` | Technical writing, API docs, and documentation best practices |
| `internationalization` | i18n/l10n architecture design and multi-language support |

### Development Stacks (8 skills)

| Skill | Description |
|-------|-------------|
| `frontend` | Modern frontend with React, Vue, and web technologies |
| `backend` | Backend with Node.js, Express, NestJS, and server patterns |
| `mobile` | Mobile with React Native, Flutter, and native patterns |
| `database` | Database design, SQL, NoSQL, and data management |
| `cloud-platforms` | AWS, GCP, Azure services and cloud-native development |
| `ai-ml-integration` | AI/ML APIs, LLM integration, and intelligent apps |
| `realtime-systems` | WebSocket, real-time communication, event-driven |
| `edge-iot` | Edge computing, IoT protocols, and embedded systems |

### Tools & Integrations (9 skills)

| Skill | Description |
|-------|-------------|
| `git-workflows` | Git version control, branching, and collaboration |
| `project-management` | Agile, Scrum, Kanban, and issue tracking |
| `development-environment` | IDE setup, dev containers, and local development |
| `monitoring-logging` | Application monitoring, logging, and alerting |
| `api-tools` | API testing, documentation, and development tools |
| `automation-scripts` | Build automation, task runners, and scripting |
| `auto-dev-setup` | Auto-Dev workflow for Human-in-the-Loop automation |
| `claude-code-plugin` | Claude Code Plugin development and marketplace management |
| `claude-code-sdk` | Claude Code SDK for AI-powered applications |

### Domain Applications (12 skills)

| Skill | Description |
|-------|-------------|
| `application-patterns` | Common application development patterns |
| `e-commerce` | E-commerce platforms, payments, shopping cart |
| `saas-platforms` | SaaS architecture, multi-tenancy, subscriptions |
| `content-platforms` | CMS, blogging platforms, content management |
| `communication-systems` | Email, notifications, messaging systems |
| `developer-tools` | CLI tools, SDKs, developer experience |
| `game-development` | Game development patterns and architectures |
| `flame` | Flame Engine 2D game development for Flutter |
| `flame-core` | Flame Engine core - components, input, collision |
| `flame-systems` | Flame Engine 14 game systems |
| `flame-templates` | Game templates - RPG, Platformer, Roguelike |
| `desktop-apps` | Desktop apps with Electron and Tauri |

### Programming Languages (12 skills)

| Skill | Description |
|-------|-------------|
| `javascript-typescript` | Modern JavaScript and TypeScript patterns |
| `python` | Python programming patterns and best practices |
| `go` | Go programming patterns and idioms |
| `rust` | Rust patterns and ownership concepts |
| `java-kotlin` | Java and Kotlin programming patterns |
| `csharp-dotnet` | C# and .NET development patterns |
| `cpp` | Modern C++ programming patterns and idioms |
| `ruby` | Ruby programming patterns and idioms |
| `php` | Modern PHP programming patterns |
| `swift` | Swift patterns for iOS and macOS |
| `shell-bash` | Shell scripting and Bash programming |
| `sql` | SQL patterns for database querying and design |

## Other Installation Methods

### Clone to Skills Directory

```bash
# Clone to your skills directory
git clone https://github.com/miles990/claude-software-skills.git ~/.claude/skills/software-skills
```

Claude will automatically discover and use the skills when relevant to your tasks.

### With MCP Server

This repository is compatible with [claude-skills-mcp](https://github.com/K-Dense-AI/claude-skills-mcp):

```bash
# Install the MCP server
pip install claude-skills-mcp

# Add this repository as a skill source
# The server will load skills from ~/.claude/skills/
```

### Cursor IDE

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

### Manual Reference

Simply clone and reference the SKILL.md files in your prompts:
```bash
git clone https://github.com/miles990/claude-software-skills.git
```

## Auto-Dev: Automated Development Workflow

One-click setup for GitHub Actions automated development workflow, let Claude help you complete development tasks.

### Quick Setup

**Using API Key:**
```bash
curl -fsSL https://raw.githubusercontent.com/miles990/claude-software-skills/main/scripts/setup-auto-dev-apikey.sh | bash
```

**Using Claude Max (OAuth):**
```bash
curl -fsSL https://raw.githubusercontent.com/miles990/claude-software-skills/main/scripts/setup-auto-dev-max.sh | bash
```

### Post-Installation Setup

| Version | Setup Method |
|---------|--------------|
| API Key | Get Key from [console.anthropic.com](https://console.anthropic.com/settings/keys), set in GitHub Secrets `ANTHROPIC_API_KEY` |
| Claude Max | Run `claude /install-github-app` for auto OAuth Token setup |

### Usage

- **Issue Trigger**: Create Issue → Add `auto-dev` label
- **Comment Trigger**: Comment `@claude [instruction]` on any Issue/PR

Detailed docs: [AUTO-DEV.md](.github/AUTO-DEV.md)

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
│   └── marketplace.json     # Lists all 55 skills as individual plugins
├── .github/
│   └── workflows/           # CI/CD automation
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

- [claude-domain-skills](https://github.com/miles990/claude-domain-skills) - Non-technical domain skills
- [claude-skills-mcp](https://github.com/K-Dense-AI/claude-skills-mcp) - MCP server for skill discovery

---

*Built for developers, by developers, with Claude*
