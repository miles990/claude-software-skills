---
schema: "1.0"
name: flame-game-dev
version: "2.2.0"
description: Flame Engine 2D 遊戲開發完整指南 - 核心、系統、模板、部署
domain: game-development
triggers:
  keywords:
    primary: [flame, flame engine, flutter game, 2d game flutter, FlameGame]
    secondary: [SpriteComponent, SpriteAnimationComponent, collision detection flutter, flame_audio, flame_tiled]
  context_boost: [flutter, dart, mobile game, cross-platform game, hyper-casual, platformer, roguelike]
  context_penalty: [unity, godot, unreal, 3d game]
  priority: high
dependencies:
  prerequisites: [flutter, dart]
  related: [game-design, mobile]
author: miles990
---

# Flame Engine 2D Game Development

Flame Engine 遊戲開發完整指南，包含核心基礎、14 個遊戲系統、3 種遊戲類型模板。

## Sub-Skills Index

| Skill | Description | Reference Count |
|-------|-------------|-----------------|
| **flame-core** | 引擎核心基礎 | 10 references |
| **flame-systems** | 14 個遊戲系統 | 14 references |
| **flame-templates** | 遊戲類型模板 | 3 references |

## Quick Navigation

### flame-core (核心基礎)
```
components.md   - 組件生命週期、類型
input.md        - 觸控、鍵盤、搖桿
collision.md    - 碰撞檢測、Hitbox
camera.md       - 相機、HUD、視口
animation.md    - 精靈動畫、Effects
scenes.md       - RouterComponent、Overlays、UI
audio.md        - 音效、背景音樂
particles.md    - 粒子系統、特效
performance.md  - 效能優化、最佳實踐
debug.md        - 除錯模式、日誌
```

### flame-systems (遊戲系統)
```
quest.md        - 任務系統         achievement.md - 成就系統
dialogue.md     - 對話系統         shop.md        - 商店系統
localization.md - 多語言系統       crafting.md    - 製作系統
inventory.md    - 背包系統         procedural.md  - 程序生成
paperdoll.md    - 紙娃娃系統       multiplayer.md - 多人連線
combat.md       - 戰鬥系統         leveleditor.md - 關卡編輯器
skills.md       - 技能系統
saveload.md     - 存檔系統
```

### flame-templates (遊戲模板)
```
rpg.md          - 回合制/動作 RPG
platformer.md   - 橫向卷軸平台遊戲
roguelike.md    - 程序生成地下城
```

## AI Usage Guide

```
# 基礎問題
需要了解 Flame？      → 先讀 flame-core/SKILL.md
需要特定功能？        → 根據 flame-core 索引讀取對應 reference

# 系統實作
需要任務/對話系統？   → 讀 flame-systems/references/quest.md 或 dialogue.md
需要戰鬥系統？        → 讀 flame-systems/references/combat.md + skills.md
需要存檔功能？        → 讀 flame-systems/references/saveload.md
需要多人連線？        → 讀 flame-systems/references/multiplayer.md

# 完整遊戲
要做 RPG？           → 讀 flame-templates/references/rpg.md
要做平台遊戲？       → 讀 flame-templates/references/platformer.md
要做 Roguelike？     → 讀 flame-templates/references/roguelike.md

# 部署發布
要發布遊戲？         → 參考下方「部署平台」章節
```

## 適用場景

根據 [Filip Hráček 的 Benchmark 測試](https://filiph.net/text/benchmarking-flutter-flame-unity-godot.html)，Flame 與其他引擎比較：

### Flame 優勢
| 項目 | Flame | Unity/Godot |
|------|-------|-------------|
| **啟動時間** | 最快 | 較慢 |
| **包體大小** | 較小 | 較大 |
| **學習曲線** | Flutter 開發者友善 | 需學習新工具 |
| **跨平台** | 一套代碼 6 平台 | 需平台適配 |
| **熱重載** | 支援 | 部分支援 |

### Flame 限制
| 項目 | Flame | Unity/Godot |
|------|-------|-------------|
| **最大實體數** | ~數百個 | 數千個 |
| **3D 支援** | 無 | 完整 |
| **物理引擎** | 基礎 (Forge2D) | 完整 |
| **編輯器** | 無視覺化編輯器 | 完整 IDE |

### 推薦使用 Flame
- ✅ **休閒遊戲**：卡牌、解謎、益智、問答
- ✅ **Hyper-casual**：簡單機制、快速遊玩
- ✅ **故事驅動**：視覺小說、互動故事
- ✅ **2D 平台遊戲**：橫向卷軸、Metroidvania
- ✅ **回合制遊戲**：戰棋、RPG、桌遊
- ✅ **Flutter App 內嵌遊戲**：小遊戲、互動元素

### 不推薦使用 Flame
- ❌ **大量實體**：彈幕、RTS、大規模戰鬥
- ❌ **3D 遊戲**：任何需要 3D 渲染的遊戲
- ❌ **物理密集**：複雜物理模擬、賽車
- ❌ **AAA 級遊戲**：高畫質、複雜特效

## Quick Start

```bash
flutter create my_game && cd my_game
flutter pub add flame
flutter pub add flame_audio       # 選用
flutter pub add flame_tiled       # 選用
```

```dart
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

void main() => runApp(GameWidget(game: MyGame()));

class MyGame extends FlameGame with HasCollisionDetection {
  @override
  Future<void> onLoad() async {
    camera.viewfinder.anchor = Anchor.topLeft;
    // 開始建構你的遊戲！
  }
}
```

## 部署平台

Flame 基於 Flutter，支援多平台部署：

| 平台 | 發布管道 | 指令 |
|------|----------|------|
| **iOS** | App Store | `flutter build ios --release` |
| **Android** | Google Play | `flutter build apk --release` |
| **Web** | itch.io / GitHub Pages | `flutter build web --release` |
| **macOS** | App Store / 獨立 | `flutter build macos --release` |
| **Windows** | Steam / 獨立 | `flutter build windows --release` |
| **Linux** | Steam / 獨立 | `flutter build linux --release` |

### 發布到 itch.io (Web)

```bash
# 1. 建置 Web 版本
flutter build web --release --web-renderer canvaskit

# 2. 上傳 build/web 資料夾到 itch.io

# 3. itch.io 設置
#    - Kind of project: HTML
#    - Embed options: Click to launch in fullscreen
```

### 發布到 Google Play (Android)

```bash
# 1. 建立 keystore
keytool -genkey -v -keystore ~/my-game.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-game

# 2. 設定 android/key.properties
storePassword=<password>
keyPassword=<password>
keyAlias=my-game
storeFile=/Users/you/my-game.jks

# 3. 建置 App Bundle
flutter build appbundle --release

# 4. 上傳 build/app/outputs/bundle/release/app-release.aab
```

### 發布到 Steam (Desktop)

```bash
# 1. 建置 Desktop 版本
flutter build windows --release  # 或 macos / linux

# 2. 使用 Steamworks SDK 打包
#    - 設定 app_build.vdf
#    - 上傳到 Steam Partner

# 3. 建議加入 Steam 成就整合
#    flutter pub add steamworks
```

## Dependency Graph

```
flame/ (本索引)
    │
    ├── flame-core (核心基礎)
    │   └── 10 reference files
    │
    ├── flame-systems (遊戲系統)
    │   └── 14 reference files
    │
    └── flame-templates (遊戲模板)
        └── 3 reference files
```

## Best Practices

1. **按需載入** - 只讀取需要的 reference，節省 token
2. **核心優先** - 先熟悉 flame-core，再擴展系統
3. **模板參考** - 用模板作為起點，按需添加系統
4. **模組化** - 每個系統獨立，可組合使用

## Version History

- v2.2.0 - 新增適用場景、Benchmark 數據
- v2.1.0 - 新增 Audio、Particles、Performance、部署指南
- v2.0.0 - 重構為模組化架構
- v1.0.0 - 初始版本
