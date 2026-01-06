# Python Templates

Modern Python project configuration templates.

## Files

| Template | Purpose |
|----------|---------|
| `pyproject.toml` | Complete project config (PEP 621) |
| `requirements.txt` | Pip dependencies |
| `requirements-dev.txt` | Development dependencies |

## Usage

### Modern Setup (pyproject.toml)

```bash
cp templates/pyproject.toml ./pyproject.toml

# Edit name, description, dependencies
# Install in editable mode
pip install -e ".[dev]"
```

### Traditional Setup (requirements.txt)

```bash
cp templates/requirements.txt ./requirements.txt
cp templates/requirements-dev.txt ./requirements-dev.txt

pip install -r requirements-dev.txt
```

## Project Structure

```
my-project/
├── pyproject.toml
├── src/
│   └── my_project/
│       ├── __init__.py
│       └── main.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
└── README.md
```

## Included Tools

### Ruff (Linter + Formatter)

```bash
# Lint
ruff check .

# Format
ruff format .

# Fix issues
ruff check --fix .
```

### Mypy (Type Checker)

```bash
mypy src/
```

### Pytest

```bash
# Run tests
pytest

# With coverage
pytest --cov=src --cov-report=html
```

## Key Configuration

### pyproject.toml Sections

| Section | Purpose |
|---------|---------|
| `[project]` | Metadata, dependencies |
| `[tool.ruff]` | Linting rules |
| `[tool.mypy]` | Type checking |
| `[tool.pytest]` | Test configuration |
| `[tool.coverage]` | Coverage settings |

### Ruff Rules

- `E/W`: pycodestyle (PEP 8)
- `F`: Pyflakes
- `I`: isort (imports)
- `B`: flake8-bugbear
- `UP`: pyupgrade

## Virtual Environment

```bash
# Create
python -m venv .venv

# Activate
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Install
pip install -e ".[dev]"
```

## Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Setup hooks
pre-commit install

# Run manually
pre-commit run --all-files
```
