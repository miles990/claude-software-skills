# Documentation Templates

Templates for project documentation.

## Files

| Template | Purpose |
|----------|---------|
| `README-template.md` | Project README template |
| `CHANGELOG-template.md` | Changelog following Keep a Changelog |

## Usage

### README

```bash
# Copy template
cp templates/README-template.md ./README.md

# Edit and customize
# Replace placeholders with actual project info
```

### CHANGELOG

```bash
# Copy template
cp templates/CHANGELOG-template.md ./CHANGELOG.md

# Add entries as you release versions
```

## README Sections

### Essential
| Section | Purpose |
|---------|---------|
| Title & Badges | Project identity |
| Description | What & why |
| Quick Start | Get running fast |
| Installation | Full setup steps |
| Usage | Code examples |

### Recommended
| Section | Purpose |
|---------|---------|
| API Reference | Method docs |
| Configuration | Options & env vars |
| Development | Setup for contributors |
| Contributing | How to contribute |

### Optional
| Section | Purpose |
|---------|---------|
| FAQ | Common questions |
| Roadmap | Future plans |
| Troubleshooting | Known issues |
| Acknowledgments | Credits |

## CHANGELOG Format

Based on [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.0.0] - 2024-01-15

### Added
- New feature X

### Changed
- Updated Y behavior

### Fixed
- Bug in Z (#123)
```

### Change Types
| Type | When to Use |
|------|-------------|
| Added | New features |
| Changed | Existing feature changes |
| Deprecated | Soon to be removed |
| Removed | Removed in this version |
| Fixed | Bug fixes |
| Security | Security patches |

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 2.0.0  # Breaking changes
1.0.0 → 1.1.0  # New features
1.0.0 → 1.0.1  # Bug fixes
```

## Best Practices

### README
- Start with clear value proposition
- Include working code examples
- Keep Quick Start under 5 commands
- Use badges for status at a glance
- Link to detailed docs

### CHANGELOG
- Update with each release
- Use present tense ("Add" not "Added")
- Reference issue/PR numbers
- Keep unreleased section updated
- Link versions to GitHub comparisons

## Additional Templates

Consider also creating:

```
docs/
├── README.md           # Main docs index
├── CONTRIBUTING.md     # Contribution guide
├── CODE_OF_CONDUCT.md  # Community standards
├── SECURITY.md         # Security policy
├── ADR/                # Architecture decisions
│   └── 001-choice.md
└── api/                # API documentation
    └── endpoints.md
```
