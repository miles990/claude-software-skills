# Shell/Bash Scripts

Utility scripts and templates for shell scripting.

## Files

| Script | Purpose |
|--------|---------|
| `common-utils.sh` | Common utility functions |

## Usage

### Source in Your Script

```bash
#!/bin/bash
source "$(dirname "$0")/common-utils.sh"

# Now use the functions
print_info "Starting..."
require_command "jq"
require_env "API_KEY"
```

### Copy Functions

Copy individual functions you need:

```bash
# Just colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Just confirm
confirm() {
  read -rp "$1 [Y/n] " response
  [[ -z $response || $response =~ ^[Yy] ]]
}
```

## Available Functions

### Output
| Function | Description |
|----------|-------------|
| `print_info` | Blue info message |
| `print_success` | Green success message |
| `print_warning` | Yellow warning |
| `print_error` | Red error (stderr) |
| `print_step` | Cyan step indicator |
| `die` | Print error and exit |

### Validation
| Function | Description |
|----------|-------------|
| `command_exists` | Check if command available |
| `require_command` | Die if command missing |
| `is_root` | Check if running as root |
| `require_root` | Die if not root |
| `require_env` | Die if env var not set |

### User Interaction
| Function | Description |
|----------|-------------|
| `confirm` | Yes/no confirmation |
| `prompt` | Prompt for input |
| `select_option` | Select from options |

### File Operations
| Function | Description |
|----------|-------------|
| `ensure_dir` | Create dir if not exists |
| `backup_file` | Create timestamped backup |
| `safe_write` | Atomic file write |

### String Operations
| Function | Description |
|----------|-------------|
| `trim` | Remove whitespace |
| `lowercase` | Convert to lowercase |
| `uppercase` | Convert to uppercase |

### Networking
| Function | Description |
|----------|-------------|
| `wait_for_port` | Wait for port availability |
| `get_public_ip` | Get public IP |

### Utility
| Function | Description |
|----------|-------------|
| `timestamp` | ISO timestamp |
| `retry` | Retry with backoff |

## Script Template

```bash
#!/bin/bash
# ===========================================
# Script: my-script.sh
# Description: What this script does
# Usage: ./my-script.sh [options]
# ===========================================

set -euo pipefail

# Source utilities
source "$(dirname "$0")/common-utils.sh"

# Configuration
readonly VERSION="1.0.0"
readonly CONFIG_FILE="${HOME}/.config/myapp/config"

# Show help
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] COMMAND

Options:
  -h, --help     Show this help
  -v, --version  Show version
  -d, --dry-run  Dry run mode

Commands:
  init     Initialize configuration
  run      Run the main task
  clean    Clean up

Examples:
  $(basename "$0") init
  $(basename "$0") -d run
EOF
}

# Parse arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)    usage; exit 0 ;;
    -v|--version) echo "v$VERSION"; exit 0 ;;
    -d|--dry-run) DRY_RUN=true; shift ;;
    *)            break ;;
  esac
done

# Main
main() {
  local command=${1:-""}

  case $command in
    init)
      print_step "Initializing..."
      ensure_dir "$(dirname "$CONFIG_FILE")"
      print_success "Done"
      ;;
    run)
      if $DRY_RUN; then
        print_info "[DRY RUN] Would execute task"
      else
        print_step "Running task..."
        # Do work
        print_success "Complete"
      fi
      ;;
    clean)
      if confirm "Remove all data?"; then
        rm -rf "$CONFIG_FILE"
        print_success "Cleaned"
      fi
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
```

## Best Practices

### Strict Mode
```bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'        # Safer word splitting
```

### Quoting
```bash
# Always quote variables
echo "$variable"
rm -rf "${dir}/"

# Use arrays for commands with spaces
cmd=("docker" "run" "-v" "/path:/path")
"${cmd[@]}"
```

### Checking
```bash
# File exists
[[ -f "$file" ]] && echo "exists"

# Directory exists
[[ -d "$dir" ]] && echo "exists"

# String not empty
[[ -n "$var" ]] && echo "not empty"

# String empty
[[ -z "$var" ]] && echo "empty"
```
