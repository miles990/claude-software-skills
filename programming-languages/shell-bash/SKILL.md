---
name: shell-bash
description: Shell scripting and Bash programming patterns
domain: programming-languages
version: 1.0.0
tags: [bash, shell, scripting, automation, cli]
---

# Shell & Bash Scripting

## Overview

Shell scripting patterns for automation, system administration, and CLI tools.

---

## Script Fundamentals

### Script Structure

```bash
#!/usr/bin/env bash
#
# Script: backup.sh
# Description: Backup files to remote server
# Usage: ./backup.sh [options] <source> <destination>
#

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'        # Safer word splitting

# Constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"

# Default values
VERBOSE=false
DRY_RUN=false
COMPRESS=true

# Cleanup on exit
cleanup() {
    local exit_code=$?
    # Cleanup temporary files
    rm -f "${TEMP_FILE:-}"
    exit "$exit_code"
}
trap cleanup EXIT

# Logging functions
log() {
    local level="$1"
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

info() { log "INFO" "$@"; }
warn() { log "WARN" "$@" >&2; }
error() { log "ERROR" "$@" >&2; }
debug() { [[ "$VERBOSE" == true ]] && log "DEBUG" "$@" || true; }

die() {
    error "$@"
    exit 1
}

# Usage
usage() {
    cat <<EOF
Usage: $SCRIPT_NAME [options] <source> <destination>

Options:
    -v, --verbose     Enable verbose output
    -n, --dry-run     Show what would be done
    -h, --help        Show this help message

Examples:
    $SCRIPT_NAME /data /backup
    $SCRIPT_NAME -v --dry-run /home/user /mnt/backup
EOF
}

# Main function
main() {
    parse_args "$@"
    validate_inputs
    perform_backup
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

### Argument Parsing

```bash
# Using getopts (POSIX)
parse_args_getopts() {
    while getopts ":vnh" opt; do
        case $opt in
            v) VERBOSE=true ;;
            n) DRY_RUN=true ;;
            h) usage; exit 0 ;;
            \?) die "Invalid option: -$OPTARG" ;;
            :) die "Option -$OPTARG requires an argument" ;;
        esac
    done
    shift $((OPTIND - 1))

    SOURCE="${1:-}"
    DESTINATION="${2:-}"
}

# Using manual parsing (supports long options)
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -n|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -c|--compress)
                COMPRESS=true
                shift
                ;;
            --no-compress)
                COMPRESS=false
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            --)
                shift
                break
                ;;
            -*)
                die "Unknown option: $1"
                ;;
            *)
                break
                ;;
        esac
    done

    # Positional arguments
    SOURCE="${1:-}"
    DESTINATION="${2:-}"
}

# Validation
validate_inputs() {
    [[ -z "$SOURCE" ]] && die "Source path is required"
    [[ -z "$DESTINATION" ]] && die "Destination path is required"
    [[ -e "$SOURCE" ]] || die "Source does not exist: $SOURCE"
}
```

---

## Variables and Data

### Variable Operations

```bash
# Variable assignment
name="John"
readonly CONSTANT="immutable"

# Default values
name="${name:-default}"        # Use default if unset or empty
name="${name:=default}"        # Assign default if unset or empty
name="${name:+alternative}"    # Use alternative if set and non-empty
name="${name:?error message}"  # Error if unset or empty

# String manipulation
str="Hello, World!"
echo "${str:0:5}"              # "Hello" (substring)
echo "${str: -6}"              # "World!" (last 6 chars)
echo "${#str}"                 # 13 (length)
echo "${str/World/Bash}"       # "Hello, Bash!" (replace first)
echo "${str//o/0}"             # "Hell0, W0rld!" (replace all)
echo "${str#Hello, }"          # "World!" (remove prefix)
echo "${str%!}"                # "Hello, World" (remove suffix)
echo "${str^^}"                # "HELLO, WORLD!" (uppercase)
echo "${str,,}"                # "hello, world!" (lowercase)

# Parameter expansion
filename="/path/to/file.tar.gz"
echo "${filename##*/}"         # "file.tar.gz" (basename)
echo "${filename%/*}"          # "/path/to" (dirname)
echo "${filename%%.*}"         # "/path/to/file" (remove all extensions)
echo "${filename%.gz}"         # "/path/to/file.tar" (remove last extension)
```

### Arrays

```bash
# Indexed arrays
declare -a fruits=("apple" "banana" "cherry")
fruits+=("date")               # Append
echo "${fruits[0]}"            # "apple" (first element)
echo "${fruits[-1]}"           # "date" (last element)
echo "${fruits[@]}"            # All elements
echo "${#fruits[@]}"           # 4 (length)
echo "${!fruits[@]}"           # 0 1 2 3 (indices)

# Iterate
for fruit in "${fruits[@]}"; do
    echo "$fruit"
done

# With indices
for i in "${!fruits[@]}"; do
    echo "$i: ${fruits[i]}"
done

# Associative arrays (bash 4+)
declare -A user=(
    [name]="John"
    [email]="john@example.com"
    [age]=30
)

echo "${user[name]}"           # "John"
echo "${!user[@]}"             # Keys: name email age
echo "${user[@]}"              # Values

# Iterate key-value
for key in "${!user[@]}"; do
    echo "$key: ${user[$key]}"
done

# Array slicing
echo "${fruits[@]:1:2}"        # "banana" "cherry" (from index 1, 2 elements)

# Array filtering (bash 4+)
evens=()
for n in "${numbers[@]}"; do
    (( n % 2 == 0 )) && evens+=("$n")
done
```

---

## Control Flow

### Conditionals

```bash
# Test operators
# Strings
[[ -z "$str" ]]                # Empty
[[ -n "$str" ]]                # Not empty
[[ "$a" == "$b" ]]             # Equal
[[ "$a" != "$b" ]]             # Not equal
[[ "$a" < "$b" ]]              # Less than (lexicographic)
[[ "$a" =~ ^[0-9]+$ ]]         # Regex match

# Numbers
[[ "$a" -eq "$b" ]]            # Equal
[[ "$a" -ne "$b" ]]            # Not equal
[[ "$a" -lt "$b" ]]            # Less than
[[ "$a" -le "$b" ]]            # Less than or equal
[[ "$a" -gt "$b" ]]            # Greater than
[[ "$a" -ge "$b" ]]            # Greater than or equal

# Files
[[ -e "$file" ]]               # Exists
[[ -f "$file" ]]               # Regular file
[[ -d "$dir" ]]                # Directory
[[ -r "$file" ]]               # Readable
[[ -w "$file" ]]               # Writable
[[ -x "$file" ]]               # Executable
[[ -s "$file" ]]               # Size > 0
[[ "$a" -nt "$b" ]]            # Newer than
[[ "$a" -ot "$b" ]]            # Older than

# If-elif-else
if [[ "$status" == "success" ]]; then
    echo "Success!"
elif [[ "$status" == "pending" ]]; then
    echo "Still pending..."
else
    echo "Failed"
fi

# Case statement
case "$command" in
    start|begin)
        start_service
        ;;
    stop|end)
        stop_service
        ;;
    restart)
        stop_service
        start_service
        ;;
    *)
        echo "Unknown command: $command"
        exit 1
        ;;
esac

# Short-circuit
[[ -f "$file" ]] && process_file "$file"
[[ -d "$dir" ]] || mkdir -p "$dir"
```

### Loops

```bash
# For loop
for item in item1 item2 item3; do
    echo "$item"
done

# C-style for
for ((i = 0; i < 10; i++)); do
    echo "$i"
done

# While loop
counter=0
while [[ $counter -lt 5 ]]; do
    echo "$counter"
    ((counter++))
done

# Read file line by line
while IFS= read -r line; do
    echo "$line"
done < "$file"

# Process command output
while IFS= read -r file; do
    echo "Processing: $file"
done < <(find . -name "*.txt")

# Until loop
until [[ -f "$lockfile" ]]; do
    sleep 1
done

# Break and continue
for i in {1..10}; do
    [[ $i -eq 5 ]] && continue
    [[ $i -eq 8 ]] && break
    echo "$i"
done
```

---

## Functions

```bash
# Basic function
greet() {
    local name="$1"
    echo "Hello, $name!"
}

# Function with return value
is_valid_email() {
    local email="$1"
    [[ "$email" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]
}

# Check return value
if is_valid_email "test@example.com"; then
    echo "Valid email"
fi

# Function with output capture
get_user_count() {
    wc -l < /etc/passwd
}
count=$(get_user_count)

# Function with array parameter
process_files() {
    local -a files=("$@")
    for file in "${files[@]}"; do
        echo "Processing: $file"
    done
}
process_files file1.txt file2.txt file3.txt

# Function with named reference (bash 4.3+)
modify_array() {
    local -n arr=$1
    arr+=("new_element")
}

my_array=("a" "b" "c")
modify_array my_array
echo "${my_array[@]}"  # "a b c new_element"

# Error handling in functions
safe_divide() {
    local dividend="$1"
    local divisor="$2"

    if [[ "$divisor" -eq 0 ]]; then
        echo "Error: Division by zero" >&2
        return 1
    fi

    echo $((dividend / divisor))
}

result=$(safe_divide 10 2) && echo "Result: $result"
```

---

## Text Processing

```bash
# grep - search patterns
grep "error" logfile.txt                    # Find lines with "error"
grep -i "error" logfile.txt                 # Case-insensitive
grep -E "error|warning" logfile.txt         # Extended regex
grep -v "debug" logfile.txt                 # Invert match
grep -c "error" logfile.txt                 # Count matches
grep -l "error" *.log                       # List files with matches
grep -r "TODO" src/                         # Recursive search

# sed - stream editor
sed 's/old/new/' file.txt                   # Replace first occurrence
sed 's/old/new/g' file.txt                  # Replace all
sed -i.bak 's/old/new/g' file.txt           # In-place with backup
sed '/pattern/d' file.txt                   # Delete matching lines
sed -n '10,20p' file.txt                    # Print lines 10-20
sed 's/^/prefix: /' file.txt                # Add prefix

# awk - field processing
awk '{print $1}' file.txt                   # First field
awk -F: '{print $1}' /etc/passwd            # Custom delimiter
awk '{sum += $1} END {print sum}' data.txt  # Sum first column
awk 'NR > 1' file.txt                       # Skip header
awk '$3 > 100 {print $1, $3}' data.txt      # Conditional print
awk '{print NR": "$0}' file.txt             # Add line numbers

# cut - extract fields
cut -d: -f1 /etc/passwd                     # First field
cut -c1-10 file.txt                         # Characters 1-10
cut -d, -f1,3 data.csv                      # Fields 1 and 3

# sort and uniq
sort file.txt                               # Sort lines
sort -n numbers.txt                         # Numeric sort
sort -r file.txt                            # Reverse sort
sort -t: -k3 -n /etc/passwd                 # Sort by field
uniq file.txt                               # Remove adjacent duplicates
sort file.txt | uniq -c                     # Count occurrences
sort file.txt | uniq -d                     # Show duplicates only

# tr - translate characters
echo "hello" | tr 'a-z' 'A-Z'               # Uppercase
tr -d '\r' < file.txt                       # Remove carriage returns
tr -s ' ' < file.txt                        # Squeeze spaces

# xargs - build commands
find . -name "*.txt" | xargs wc -l
find . -name "*.log" -print0 | xargs -0 rm
echo "a b c" | xargs -n1 echo
cat urls.txt | xargs -P4 -I{} curl {}       # Parallel execution
```

---

## Process Management

```bash
# Background processes
long_running_command &
pid=$!                                      # Get PID of last background job
wait $pid                                   # Wait for specific process

# Run multiple in background and wait
for file in *.txt; do
    process_file "$file" &
done
wait                                        # Wait for all

# Parallel processing with xargs
find . -name "*.jpg" -print0 | xargs -0 -P4 -I{} convert {} {}.png

# Job control
jobs                                        # List jobs
fg %1                                       # Bring job 1 to foreground
bg %1                                       # Resume job 1 in background
kill %1                                     # Kill job 1

# Process substitution
diff <(sort file1.txt) <(sort file2.txt)
while read -r line; do
    echo "$line"
done < <(command_that_outputs)

# Command groups
{ cmd1; cmd2; cmd3; } > output.txt          # Group and redirect
( cd /tmp && cmd1; cmd2 )                   # Subshell (doesn't affect current shell)

# Coprocesses
coproc my_coproc { while read -r line; do echo "Got: $line"; done; }
echo "Hello" >&"${my_coproc[1]}"
read -r response <&"${my_coproc[0]}"
```

---

## Related Skills

- [[automation-scripts]] - Build automation
- [[devops-cicd]] - CI/CD pipelines
- [[development-environment]] - Environment setup
