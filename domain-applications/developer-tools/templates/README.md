# Developer Tools Templates

Templates for building developer tools and CLIs.

## Files

| Template | Purpose |
|----------|---------|
| `cli-boilerplate.ts` | Node.js CLI foundation |

## Usage

### Quick Start

```bash
# Create project
mkdir my-cli && cd my-cli
npm init -y

# Install dependencies
npm install commander chalk ora inquirer conf
npm install -D typescript @types/node @types/inquirer tsx

# Copy template
cp templates/cli-boilerplate.ts ./src/cli.ts

# Run
npx tsx src/cli.ts --help

# Build for distribution
npx tsc
chmod +x dist/cli.js
```

## CLI Features

| Feature | Library |
|---------|---------|
| Commands | Commander.js |
| Colors | Chalk |
| Spinners | Ora |
| Prompts | Inquirer |
| Config | Conf |

## Command Structure

```
my-cli
├── init              # Initialize configuration
├── run
│   ├── task <name>   # Run named task
│   └── batch         # Batch operations
└── config
    ├── get <key>     # Get config value
    ├── set <key> <value>
    ├── list          # Show all config
    └── reset         # Reset config
```

## Example Usage

```bash
# Initialize
my-cli init

# Run task
my-cli run task deploy --dry-run
my-cli run task build --force

# Batch processing
my-cli run batch --parallel 8

# Configuration
my-cli config get apiKey
my-cli config set format yaml
my-cli config list

# Global options
my-cli --verbose run task test
my-cli --config ./custom.json init
```

## Adding Commands

```typescript
// Simple command
program
  .command('hello <name>')
  .description('Say hello')
  .option('-l, --loud', 'Shout')
  .action((name, options) => {
    const greeting = `Hello, ${name}!`;
    console.log(options.loud ? greeting.toUpperCase() : greeting);
  });

// Command group
const db = program.command('db').description('Database operations');

db.command('migrate')
  .description('Run migrations')
  .action(async () => { /* ... */ });

db.command('seed')
  .description('Seed database')
  .action(async () => { /* ... */ });
```

## Interactive Prompts

```typescript
// Text input
const { name } = await inquirer.prompt([
  { type: 'input', name: 'name', message: 'Your name:' }
]);

// Selection
const { choice } = await inquirer.prompt([
  {
    type: 'list',
    name: 'choice',
    message: 'Select option:',
    choices: ['Option A', 'Option B', 'Option C']
  }
]);

// Confirmation
const { proceed } = await inquirer.prompt([
  { type: 'confirm', name: 'proceed', message: 'Continue?', default: false }
]);

// Password
const { secret } = await inquirer.prompt([
  { type: 'password', name: 'secret', message: 'API Key:' }
]);
```

## Progress Indicators

```typescript
// Spinner
const spinner = ora('Loading...').start();
await doWork();
spinner.succeed('Done!');
// spinner.fail('Error!');
// spinner.warn('Warning');
// spinner.info('Info');

// Progress updates
spinner.text = 'Processing item 5/10...';
```

## Output Helpers

```typescript
// Colored messages
console.log(chalk.green('Success!'));
console.log(chalk.red('Error!'));
console.log(chalk.yellow('Warning'));
console.log(chalk.blue('Info'));
console.log(chalk.bold('Bold text'));
console.log(chalk.dim('Dimmed'));

// Table output
table([
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'User' },
], ['name', 'role']);
```

## Package.json Setup

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "tsx src/cli.ts",
    "prepublishOnly": "npm run build"
  }
}
```

## Distribution

```bash
# Local testing
npm link
my-cli --help

# Publish to npm
npm publish

# Users install globally
npm install -g my-cli
```

## Testing

```typescript
import { program } from './cli';

describe('CLI', () => {
  it('runs task command', async () => {
    await program.parseAsync(['node', 'cli', 'run', 'task', 'test']);
    // assertions...
  });
});
```
