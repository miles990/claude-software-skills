# Contributing to Claude Software Skills

Thank you for your interest in contributing to Claude Software Skills! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or suggest features
- Check if a similar issue already exists before creating a new one
- Provide detailed descriptions with steps to reproduce (for bugs)

### Adding a New Skill

1. **Choose the right category**
   - `software-design/` - Architecture, design patterns, API design
   - `software-engineering/` - Code quality, testing, DevOps, security
   - `development-stacks/` - Frontend, backend, mobile, databases
   - `tools-integrations/` - Git, monitoring, automation
   - `domain-applications/` - E-commerce, SaaS, game dev
   - `programming-languages/` - Language-specific skills

2. **Create a directory**
   ```bash
   mkdir -p <category>/<skill-name>
   ```

3. **Add a SKILL.md file**
   - Use the [SKILL-TEMPLATE.md](docs/SKILL-TEMPLATE.md) as your starting point
   - Include practical examples and code snippets
   - Document best practices and common pitfalls
   - Add related skills references

4. **Submit a pull request**
   - Create a descriptive title
   - Explain what the skill covers
   - Reference any related issues

### Improving Existing Skills

- Fix typos, improve clarity, add examples
- Update outdated information
- Add new sections or patterns
- Include links to relevant resources

## Skill Guidelines

### Content Quality

- **Be Practical** - Focus on actionable, real-world knowledge
- **Include Examples** - Use real code snippets and scenarios
- **Show Tradeoffs** - Every pattern has costs and benefits
- **Stay Current** - Keep information up to date
- **Cross-Reference** - Link to related skills

### Code Examples

```markdown
### Good Example
- Shows complete, runnable code
- Includes comments explaining key parts
- Uses realistic variable names
- Demonstrates best practices

### Bad Example (marked as anti-pattern)
- Shows what to avoid
- Explains why it's problematic
- Shows the correct alternative
```

### Formatting

- Use proper Markdown formatting
- Include a YAML frontmatter with metadata
- Structure content with clear headings
- Use code blocks with language identifiers

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-skill`)
3. Make your changes
4. Test locally if applicable
5. Commit with conventional commit messages
6. Push to your fork
7. Create a pull request

### Commit Messages

Use conventional commits:

```
feat: add kubernetes deployment skill
fix: correct typo in api-design examples
docs: update contributing guidelines
refactor: reorganize testing-strategies sections
```

### Pull Request Template

```markdown
## Description
[Describe what this PR adds or changes]

## Type of Change
- [ ] New skill
- [ ] Skill improvement
- [ ] Bug fix
- [ ] Documentation update

## Checklist
- [ ] Follows SKILL-TEMPLATE.md format
- [ ] Includes practical examples
- [ ] No broken links
- [ ] Proper Markdown formatting
```

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and improve
- Focus on the content, not the person

## Questions?

Feel free to open an issue for any questions about contributing.

---

*Thank you for helping make Claude Software Skills better!*
