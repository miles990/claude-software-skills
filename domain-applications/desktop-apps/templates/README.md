# Desktop Apps Templates

Configuration templates for cross-platform desktop applications.

## Files

| Template | Purpose |
|----------|---------|
| `electron-main.ts` | Electron main process |
| `tauri.conf.json` | Tauri configuration |

## Framework Comparison

| Feature | Electron | Tauri |
|---------|----------|-------|
| Language | JavaScript | Rust + JS |
| Bundle Size | ~150MB | ~3MB |
| Memory | Higher | Lower |
| Native APIs | Via Node.js | Rust + Webview |
| Maturity | High | Growing |

## Electron Setup

### Quick Start

```bash
# Create project
npm create electron-vite@latest my-app

# Copy template
cp templates/electron-main.ts src/main/index.ts

# Install dependencies
npm install electron-updater
npm install -D electron electron-builder

# Run
npm run dev
```

### Features

| Feature | Implementation |
|---------|----------------|
| Window Management | BrowserWindow |
| System Tray | Tray + Menu |
| IPC | ipcMain/ipcRenderer |
| Auto Update | electron-updater |
| Security | CSP, sandboxing |

### IPC Channels

```typescript
// Main process
ipcMain.handle('app:info', () => ({ version: '1.0.0' }));

// Preload (contextBridge)
contextBridge.exposeInMainWorld('api', {
  getInfo: () => ipcRenderer.invoke('app:info'),
});

// Renderer
const info = await window.api.getInfo();
```

### Preload Script

```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // App
  getInfo: () => ipcRenderer.invoke('app:info'),

  // Store
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: unknown) => ipcRenderer.invoke('store:set', key, value),
  },

  // File system
  fs: {
    read: (path: string) => ipcRenderer.invoke('fs:read', path),
    write: (path: string, content: string) => ipcRenderer.invoke('fs:write', path, content),
  },

  // Dialogs
  dialog: {
    open: (options: any) => ipcRenderer.invoke('dialog:open', options),
    save: (options: any) => ipcRenderer.invoke('dialog:save', options),
  },

  // Events from main
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
});
```

## Tauri Setup

### Quick Start

```bash
# Create project
npm create tauri-app@latest

# Copy configuration
cp templates/tauri.conf.json src-tauri/tauri.conf.json

# Run
npm run tauri dev

# Build
npm run tauri build
```

### Key Configuration

| Section | Purpose |
|---------|---------|
| `allowlist` | Enabled APIs |
| `bundle` | App metadata, icons |
| `security.csp` | Content Security Policy |
| `updater` | Auto-update settings |
| `windows` | Window properties |

### Allowlist APIs

```json
{
  "allowlist": {
    "fs": { "readFile": true, "scope": ["$APP/*"] },
    "dialog": { "open": true, "save": true },
    "shell": { "open": true },
    "clipboard": { "all": true }
  }
}
```

### Tauri Commands (Rust)

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Calling from Frontend

```typescript
import { invoke } from '@tauri-apps/api/tauri';

const greeting = await invoke('greet', { name: 'World' });
```

## Project Structure

### Electron

```
my-app/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts      # Main process
│   │   └── preload.ts    # Preload script
│   └── renderer/         # React/Vue/etc
├── resources/
│   └── icons/
└── dist/
```

### Tauri

```
my-app/
├── package.json
├── src/                  # Frontend
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── icons/
│   └── src/
│       └── main.rs
└── dist/
```

## Distribution

### Electron Builder

```yaml
# electron-builder.yml
appId: com.example.myapp
productName: My App
directories:
  output: release
mac:
  target: [dmg, zip]
  category: public.app-category.developer-tools
win:
  target: [nsis, portable]
linux:
  target: [AppImage, deb]
```

### Tauri Build

```bash
# All platforms
npm run tauri build

# Specific target
npm run tauri build -- --target x86_64-apple-darwin
```

## Auto Updates

### Electron

```typescript
import { autoUpdater } from 'electron-updater';
autoUpdater.checkForUpdatesAndNotify();
```

### Tauri

Configure `updater` in tauri.conf.json with your update server endpoint.
