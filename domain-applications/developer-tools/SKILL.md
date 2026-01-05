---
name: developer-tools
description: CLI tools, SDKs, and developer experience patterns
domain: domain-applications
version: 1.0.0
tags: [cli, sdk, api-client, devtools, dx]
---

# Developer Tools

## Overview

Building command-line interfaces, SDKs, and tools that enhance developer experience.

---

## CLI Development

### CLI Framework (Commander)

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('myctl')
  .description('CLI tool for managing resources')
  .version('1.0.0');

// Simple command
program
  .command('init')
  .description('Initialize a new project')
  .option('-t, --template <name>', 'Template to use', 'default')
  .option('-d, --directory <path>', 'Target directory', '.')
  .action(async (options) => {
    const spinner = ora('Initializing project...').start();

    try {
      await initProject(options.template, options.directory);
      spinner.succeed(chalk.green('Project initialized successfully!'));
    } catch (error) {
      spinner.fail(chalk.red(`Failed: ${error.message}`));
      process.exit(1);
    }
  });

// Interactive command
program
  .command('create <name>')
  .description('Create a new resource')
  .action(async (name) => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select resource type:',
        choices: ['api', 'worker', 'database'],
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
      },
      {
        type: 'confirm',
        name: 'public',
        message: 'Make it public?',
        default: false,
      },
    ]);

    await createResource(name, answers);
    console.log(chalk.green(`Created ${answers.type}: ${name}`));
  });

// Subcommands
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('set <key> <value>')
  .description('Set a config value')
  .action(async (key, value) => {
    await setConfig(key, value);
    console.log(`Set ${key}=${value}`);
  });

configCmd
  .command('get <key>')
  .description('Get a config value')
  .action(async (key) => {
    const value = await getConfig(key);
    console.log(value);
  });

configCmd
  .command('list')
  .description('List all config values')
  .action(async () => {
    const config = await getAllConfig();
    console.table(config);
  });

// Global options
program
  .option('--debug', 'Enable debug mode')
  .option('--json', 'Output as JSON')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().debug) {
      process.env.DEBUG = 'true';
    }
  });

program.parse();
```

### CLI Output Formatting

```typescript
import Table from 'cli-table3';
import boxen from 'boxen';

// Table output
function printTable(data: Array<Record<string, any>>, columns: string[]) {
  const table = new Table({
    head: columns.map((c) => chalk.bold(c)),
    style: { head: ['cyan'] },
  });

  data.forEach((row) => {
    table.push(columns.map((col) => row[col] ?? ''));
  });

  console.log(table.toString());
}

// JSON output
function printJson(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

// Box output
function printBox(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      title,
      titleAlignment: 'center',
    })
  );
}

// Progress bar
import cliProgress from 'cli-progress';

async function withProgress<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  label: string
) {
  const bar = new cliProgress.SingleBar({
    format: `${label} |{bar}| {percentage}% | {value}/{total}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  bar.start(items.length, 0);

  for (const item of items) {
    await fn(item);
    bar.increment();
  }

  bar.stop();
}
```

---

## SDK Development

### TypeScript SDK

```typescript
// sdk/index.ts
export class MyServiceClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(options: { apiKey: string; baseUrl?: string }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.example.com';
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    return response.json();
  }

  // Resource: Users
  users = {
    list: (params?: ListUsersParams) =>
      this.request<PaginatedResponse<User>>('GET', '/users?' + qs(params)),

    get: (id: string) => this.request<User>('GET', `/users/${id}`),

    create: (data: CreateUserInput) =>
      this.request<User>('POST', '/users', data),

    update: (id: string, data: UpdateUserInput) =>
      this.request<User>('PUT', `/users/${id}`, data),

    delete: (id: string) => this.request<void>('DELETE', `/users/${id}`),
  };

  // Resource: Projects
  projects = {
    list: () => this.request<Project[]>('GET', '/projects'),
    get: (id: string) => this.request<Project>('GET', `/projects/${id}`),
    create: (data: CreateProjectInput) =>
      this.request<Project>('POST', '/projects', data),
  };
}

// Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// Usage
const client = new MyServiceClient({ apiKey: 'sk_...' });

const users = await client.users.list({ page: 1, limit: 10 });
const user = await client.users.create({ email: 'test@example.com', name: 'Test' });
```

### SDK with Retry and Rate Limiting

```typescript
import pRetry from 'p-retry';
import pThrottle from 'p-throttle';

class RobustClient {
  private throttle = pThrottle({
    limit: 100,
    interval: 60000, // 100 requests per minute
  });

  private async requestWithRetry<T>(
    fn: () => Promise<T>,
    options?: { retries?: number }
  ): Promise<T> {
    return pRetry(
      async () => {
        try {
          return await fn();
        } catch (error) {
          if (error instanceof ApiError) {
            // Don't retry client errors
            if (error.status >= 400 && error.status < 500) {
              throw new pRetry.AbortError(error);
            }
          }
          throw error;
        }
      },
      {
        retries: options?.retries ?? 3,
        onFailedAttempt: (error) => {
          console.log(
            `Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
          );
        },
      }
    );
  }

  private request = this.throttle(async <T>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> => {
    return this.requestWithRetry(async () => {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
        await sleep(delay);
        throw new Error('Rate limited, retrying...');
      }

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return response.json();
    });
  });
}
```

---

## API Documentation

### OpenAPI Spec Generation

```typescript
import { generateOpenApi } from '@ts-rest/open-api';
import { contract } from './contract';

const openApiDocument = generateOpenApi(contract, {
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API for managing resources',
  },
  servers: [
    { url: 'https://api.example.com', description: 'Production' },
    { url: 'https://staging-api.example.com', description: 'Staging' },
  ],
});

// Export for documentation tools
export { openApiDocument };
```

### Interactive Documentation

```tsx
// Using Swagger UI React
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

function ApiDocs() {
  return (
    <SwaggerUI
      url="/api/openapi.json"
      docExpansion="list"
      defaultModelsExpandDepth={3}
    />
  );
}

// Or Redoc
import { RedocStandalone } from 'redoc';

function ApiDocs() {
  return <RedocStandalone specUrl="/api/openapi.json" />;
}
```

---

## Developer Portal

```tsx
// API key management component
function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);

  async function createKey(name: string) {
    const key = await api.createApiKey({ name });
    // Show the secret only once
    showModal({
      title: 'API Key Created',
      content: (
        <div>
          <p>Save this key - it won't be shown again:</p>
          <code className="bg-gray-100 p-2 block">{key.secret}</code>
        </div>
      ),
    });
    setKeys([...keys, key]);
  }

  async function revokeKey(keyId: string) {
    await api.revokeApiKey(keyId);
    setKeys(keys.filter((k) => k.id !== keyId));
  }

  return (
    <div>
      <h2>API Keys</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created</th>
            <th>Last Used</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id}>
              <td>{key.name}</td>
              <td>{formatDate(key.createdAt)}</td>
              <td>{key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}</td>
              <td>
                <button onClick={() => revokeKey(key.id)}>Revoke</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => createKey(prompt('Key name:') || 'Unnamed')}>
        Create New Key
      </button>
    </div>
  );
}
```

---

## Related Skills

- [[api-design]] - API design patterns
- [[documentation]] - Technical writing
- [[automation-scripts]] - Build automation

