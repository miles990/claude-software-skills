#!/bin/bash
# ===========================================
# Common Bash Utilities Template
# Usage: source common-utils.sh
# ===========================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# ===========================================
# Colors & Formatting
# ===========================================

# Colors (check if terminal supports colors)
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  MAGENTA='\033[0;35m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  NC='\033[0m' # No Color
else
  RED='' GREEN='' YELLOW='' BLUE='' MAGENTA='' CYAN='' BOLD='' NC=''
fi

# Print functions
print_info()    { echo -e "${BLUE}ℹ${NC} $*"; }
print_success() { echo -e "${GREEN}✓${NC} $*"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $*"; }
print_error()   { echo -e "${RED}✗${NC} $*" >&2; }
print_step()    { echo -e "${CYAN}→${NC} $*"; }

# ===========================================
# Error Handling
# ===========================================

# Die with message
die() {
  print_error "$@"
  exit 1
}

# Cleanup on exit
cleanup() {
  # Add cleanup tasks here
  :
}
trap cleanup EXIT

# Error handler
on_error() {
  local line=$1
  print_error "Error on line $line"
}
trap 'on_error $LINENO' ERR

# ===========================================
# Checks & Validation
# ===========================================

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Require command or die
require_command() {
  local cmd=$1
  local install_hint=${2:-"Please install $cmd"}
  if ! command_exists "$cmd"; then
    die "$cmd is required. $install_hint"
  fi
}

# Check if running as root
is_root() {
  [[ $EUID -eq 0 ]]
}

# Require root
require_root() {
  if ! is_root; then
    die "This script must be run as root"
  fi
}

# Check if variable is set
is_set() {
  [[ -n "${!1:-}" ]]
}

# Require environment variable
require_env() {
  local var=$1
  if ! is_set "$var"; then
    die "Environment variable $var is required"
  fi
}

# ===========================================
# User Interaction
# ===========================================

# Confirm action (default yes)
confirm() {
  local prompt=${1:-"Continue?"}
  local default=${2:-"y"}

  if [[ $default == "y" ]]; then
    read -rp "$prompt [Y/n] " response
    [[ -z $response || $response =~ ^[Yy] ]]
  else
    read -rp "$prompt [y/N] " response
    [[ $response =~ ^[Yy] ]]
  fi
}

# Prompt for input
prompt() {
  local prompt=$1
  local default=${2:-""}
  local result

  if [[ -n $default ]]; then
    read -rp "$prompt [$default]: " result
    echo "${result:-$default}"
  else
    read -rp "$prompt: " result
    echo "$result"
  fi
}

# Select from options
select_option() {
  local prompt=$1
  shift
  local options=("$@")

  PS3="$prompt "
  select opt in "${options[@]}"; do
    if [[ -n $opt ]]; then
      echo "$opt"
      break
    fi
  done
}

# ===========================================
# File Operations
# ===========================================

# Create directory if not exists
ensure_dir() {
  local dir=$1
  [[ -d $dir ]] || mkdir -p "$dir"
}

# Backup file
backup_file() {
  local file=$1
  local backup="${file}.bak.$(date +%Y%m%d_%H%M%S)"
  if [[ -f $file ]]; then
    cp "$file" "$backup"
    print_info "Backed up $file to $backup"
  fi
}

# Safe file write (atomic)
safe_write() {
  local file=$1
  local content=$2
  local tmp="${file}.tmp.$$"

  echo "$content" > "$tmp"
  mv "$tmp" "$file"
}

# ===========================================
# String Operations
# ===========================================

# Trim whitespace
trim() {
  local var="$*"
  var="${var#"${var%%[![:space:]]*}"}"
  var="${var%"${var##*[![:space:]]}"}"
  echo -n "$var"
}

# Lowercase
lowercase() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Uppercase
uppercase() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

# ===========================================
# Date/Time
# ===========================================

# ISO timestamp
timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Human-readable date
date_human() {
  date +"%Y-%m-%d %H:%M:%S"
}

# ===========================================
# Networking
# ===========================================

# Wait for port to be available
wait_for_port() {
  local host=$1
  local port=$2
  local timeout=${3:-30}
  local start=$(date +%s)

  print_step "Waiting for $host:$port..."
  while ! nc -z "$host" "$port" 2>/dev/null; do
    if (( $(date +%s) - start > timeout )); then
      die "Timeout waiting for $host:$port"
    fi
    sleep 1
  done
  print_success "$host:$port is available"
}

# Get public IP
get_public_ip() {
  curl -s https://ifconfig.me || curl -s https://api.ipify.org
}

# ===========================================
# JSON (requires jq)
# ===========================================

# Get JSON value
json_get() {
  local json=$1
  local key=$2
  echo "$json" | jq -r "$key"
}

# ===========================================
# Retry Logic
# ===========================================

# Retry command with exponential backoff
retry() {
  local max_attempts=${1:-3}
  local delay=${2:-1}
  shift 2
  local cmd=("$@")

  local attempt=1
  while (( attempt <= max_attempts )); do
    if "${cmd[@]}"; then
      return 0
    fi

    if (( attempt < max_attempts )); then
      print_warning "Attempt $attempt failed, retrying in ${delay}s..."
      sleep "$delay"
      delay=$((delay * 2))
    fi
    ((attempt++))
  done

  print_error "Command failed after $max_attempts attempts"
  return 1
}

# ===========================================
# Script Info
# ===========================================

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get script name
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# ===========================================
# Usage Example
# ===========================================

# main() {
#   require_command "jq" "brew install jq"
#   require_env "API_KEY"
#
#   print_info "Starting script..."
#
#   if confirm "Proceed with operation?"; then
#     print_step "Executing..."
#     # Do work
#     print_success "Done!"
#   fi
# }
#
# main "$@"
