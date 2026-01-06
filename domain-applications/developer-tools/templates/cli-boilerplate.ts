#!/usr/bin/env node
/**
 * CLI Boilerplate Template
 * Usage: Foundation for building Node.js CLI tools
 *
 * Features:
 * - Command structure with subcommands
 * - Flag/option parsing
 * - Interactive prompts
 * - Config file support
 * - Colored output
 * - Progress indicators
 *
 * Install dependencies:
 * npm install commander chalk ora inquirer conf
 * npm install -D @types/node @types/inquirer
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Conf from 'conf';

// ===========================================
// Configuration
// ===========================================

const config = new Conf<{
  apiKey?: string;
  defaultFormat: string;
  verbose: boolean;
}>({
  projectName: 'my-cli',
  defaults: {
    defaultFormat: 'json',
    verbose: false,
  },
});

// ===========================================
// CLI Setup
// ===========================================

const program = new Command();

program
  .name('my-cli')
  .description('CLI tool description')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --config <path>', 'Path to config file')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      config.set('verbose', true);
    }
  });

// ===========================================
// Commands
// ===========================================

// Init command
program
  .command('init')
  .description('Initialize configuration')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        validate: (input: string) => input.length > 0 || 'API key is required',
      },
      {
        type: 'list',
        name: 'format',
        message: 'Default output format:',
        choices: ['json', 'yaml', 'table'],
        default: 'json',
      },
    ]);

    config.set('apiKey', answers.apiKey);
    config.set('defaultFormat', answers.format);

    console.log(chalk.green('✓ Configuration saved'));
  });

// Run command with subcommands
const run = program.command('run').description('Run operations');

run
  .command('task <name>')
  .description('Run a named task')
  .option('-f, --force', 'Force execution')
  .option('--dry-run', 'Preview without executing')
  .action(async (name: string, options: { force?: boolean; dryRun?: boolean }) => {
    const spinner = ora(`Running task: ${name}`).start();

    try {
      if (options.dryRun) {
        spinner.info(`Would run task: ${name}`);
        return;
      }

      // Simulate async operation
      await sleep(2000);

      spinner.succeed(`Task ${chalk.bold(name)} completed`);
    } catch (error) {
      spinner.fail(`Task failed: ${(error as Error).message}`);
      process.exit(1);
    }
  });

run
  .command('batch')
  .description('Run batch operations')
  .option('-p, --parallel <n>', 'Parallel execution count', '4')
  .action(async (options: { parallel: string }) => {
    const items = ['item1', 'item2', 'item3'];
    const parallel = parseInt(options.parallel, 10);

    console.log(chalk.blue(`Processing ${items.length} items (${parallel} parallel)`));

    for (const item of items) {
      const spinner = ora(`Processing ${item}`).start();
      await sleep(500);
      spinner.succeed();
    }

    console.log(chalk.green('\n✓ Batch completed'));
  });

// Config command
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('get <key>')
  .description('Get config value')
  .action((key: string) => {
    const value = config.get(key);
    if (value !== undefined) {
      console.log(value);
    } else {
      console.log(chalk.yellow(`Config key "${key}" not found`));
    }
  });

configCmd
  .command('set <key> <value>')
  .description('Set config value')
  .action((key: string, value: string) => {
    config.set(key, value);
    console.log(chalk.green(`✓ Set ${key}=${value}`));
  });

configCmd
  .command('list')
  .description('List all config values')
  .action(() => {
    const all = config.store;
    console.log(JSON.stringify(all, null, 2));
  });

configCmd
  .command('reset')
  .description('Reset configuration')
  .action(async () => {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Reset all configuration?',
        default: false,
      },
    ]);

    if (confirm) {
      config.clear();
      console.log(chalk.green('✓ Configuration reset'));
    }
  });

// ===========================================
// Output Helpers
// ===========================================

function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  const prefix = {
    info: chalk.blue('ℹ'),
    warn: chalk.yellow('⚠'),
    error: chalk.red('✗'),
    success: chalk.green('✓'),
  };
  console.log(`${prefix[level]} ${message}`);
}

function table(data: Record<string, unknown>[], columns: string[]) {
  const widths = columns.map((col) => {
    const maxLen = Math.max(col.length, ...data.map((row) => String(row[col] || '').length));
    return maxLen;
  });

  // Header
  const header = columns.map((col, i) => col.padEnd(widths[i])).join(' | ');
  console.log(chalk.bold(header));
  console.log('-'.repeat(header.length));

  // Rows
  for (const row of data) {
    const line = columns.map((col, i) => String(row[col] || '').padEnd(widths[i])).join(' | ');
    console.log(line);
  }
}

// ===========================================
// Utilities
// ===========================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isVerbose(): boolean {
  return config.get('verbose') ?? false;
}

function debug(message: string) {
  if (isVerbose()) {
    console.log(chalk.gray(`[DEBUG] ${message}`));
  }
}

// ===========================================
// Error Handling
// ===========================================

process.on('uncaughtException', (error) => {
  console.error(chalk.red(`\nFatal error: ${error.message}`));
  if (isVerbose()) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red(`\nUnhandled rejection: ${reason}`));
  process.exit(1);
});

// ===========================================
// Run CLI
// ===========================================

program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Export for testing
export { program, config, log, table, debug };
