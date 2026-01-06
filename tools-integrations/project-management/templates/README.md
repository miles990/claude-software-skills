# Project Management Templates

GitHub issue and PR templates for consistent project workflows.

## Files

| Template | Purpose |
|----------|---------|
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug report template |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Feature request template |
| `.github/PULL_REQUEST_TEMPLATE.md` | Pull request template |

## Usage

```bash
# Copy all templates
mkdir -p .github/ISSUE_TEMPLATE
cp templates/.github/ISSUE_TEMPLATE/* .github/ISSUE_TEMPLATE/
cp templates/.github/PULL_REQUEST_TEMPLATE.md .github/
```

## How It Works

### Issue Templates

When users create a new issue on GitHub:
1. They'll see a template selection screen
2. Choosing "Bug Report" or "Feature Request" pre-fills the issue body
3. Labels are automatically applied

### PR Template

When creating a Pull Request:
1. The template automatically populates the PR description
2. Provides a checklist for the author
3. Structures information for reviewers

## Customization

### Adding More Issue Templates

Create new `.md` files in `.github/ISSUE_TEMPLATE/`:

```yaml
---
name: Security Vulnerability
about: Report a security issue
title: '[SECURITY] '
labels: security
assignees: 'security-team'
---

## Description
...
```

### Issue Template Config

Create `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Questions
    url: https://github.com/org/repo/discussions
    about: Use Discussions for questions
```

## Best Practices

### For Bug Reports

- Always include environment details
- Provide clear reproduction steps
- Attach screenshots/logs when possible

### For Feature Requests

- Explain the problem being solved
- List use cases
- Consider alternatives

### For Pull Requests

- Link to related issues
- Describe testing approach
- Include screenshots for UI changes
