---
schema: '1.0'
name: flame-game-dev
version: 1.1.0
description: Flame Engine 2D game development patterns and best practices for Flutter
keywords:
  - flame
  - flutter
  - dart
  - 2d-games
  - game-engine
  - mobile-games
triggers:
  keywords:
    primary: [flame, flame engine, flutter game, 2d game flutter, FlameGame]
    secondary: [SpriteComponent, SpriteAnimationComponent, collision detection flutter, flame_audio, flame_tiled]
  context_boost: [flutter, dart, mobile game, cross-platform game, hyper-casual, platformer]
  context_penalty: [unity, godot, unreal, 3d game, multiplayer server, backend]
  priority: high
dependencies:
  prerequisites: [flutter, dart]
  related: [mobile, game-development, game-design]
author: miles990
---
# Flame Engine 2D Game Development

## Overview

Flame is a modular 2D game engine built on Flutter, providing a complete set of tools for game development. This skill covers architecture patterns, component systems, and best practices for building games with Flame.

**Key Strengths**: Cross-platform (iOS, Android, Web, Desktop), Flutter hot reload, 60 FPS on mid-range devices, excellent for hyper-casual games, platformers, and puzzle games.

**Limitations**: 2D only (no 3D), no visual editor (code-only), smaller community than Unity/Godot.

---

## Should You Use Flame?

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flame Decision Tree                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Do you need 3D graphics?                                       │
│       │                                                         │
│       ├── YES → ❌ Use Unity/Unreal/Godot                       │
│       │                                                         │
│       └── NO → Is your team familiar with Flutter/Dart?         │
│                    │                                            │
│                    ├── NO → ❌ Consider Godot (GDScript) or     │
│                    │         Unity (C#) for easier onboarding   │
│                    │                                            │
│                    └── YES → Do you need a visual scene editor? │
│                                   │                             │
│                                   ├── YES → ❌ Use Godot/Unity  │
│                                   │                             │
│                                   └── NO → Is it primarily      │
│                                            multiplayer/MMO?     │
│                                                 │               │
│                                                 ├── YES → ⚠️    │
│                                                 │   Possible,   │
│                                                 │   but Unity   │
│                                                 │   has better  │
│                                                 │   netcode     │
│                                                 │               │
│                                                 └── NO →        │
│                                                     ✅ FLAME!   │
└─────────────────────────────────────────────────────────────────┘
```

### Use Flame ✅ When:

- Already familiar with Flutter/Dart ecosystem
- Building 2D games (casual, hyper-casual, platformer, puzzle)
- Need cross-platform deployment (iOS, Android, Web, Desktop)
- Want Flutter's hot reload for rapid iteration
- Prefer code-first approach over visual editors

### Avoid Flame ❌ When:

- Need 3D graphics or advanced shaders
- Team unfamiliar with Dart (learning curve)
- Require visual scene/level editor (Tiled helps but limited)
- Building competitive multiplayer (netcode ecosystem immature)
- Need large asset store / marketplace

---

## Mixin Quick Reference

| Need | Mixin | Example Usage |
|------|-------|---------------|
| Access game instance | `HasGameRef<MyGame>` | `game.camera.follow(this)` |
| Tap/click input | `TapCallbacks` | `onTapDown(TapDownEvent)` |
| Drag input | `DragCallbacks` | `onDragUpdate(DragUpdateEvent)` |
| Keyboard input | `KeyboardHandler` | `onKeyEvent(event, keysPressed)` |
| Collision callbacks | `CollisionCallbacks` | `onCollision(points, other)` |
| Enable collisions (Game) | `HasCollisionDetection` | Add to FlameGame class |
| Time scaling | `HasTimeScale` | `timeScale = 0.5` (slow-mo) |
| Hover events | `HoverCallbacks` | `onHoverEnter(PointerHoverInfo)` |
| Gamepad input | `HasGamepadEvents` | `onGamepadEvent(...)` |

### Component Class Quick Reference

| Need | Class | Key Features |
|------|-------|--------------|
| Base component | `Component` | Lifecycle, children |
| Position + size | `PositionComponent` | Transform, anchor, angle |
| Static image | `SpriteComponent` | Single sprite rendering |
| Animated sprite | `SpriteAnimationComponent` | Frame-based animation |
| Multiple animations | `SpriteAnimationGroupComponent<T>` | State machine animations |
| Text rendering | `TextComponent` | Fonts, styles |
| Parallax layers | `ParallaxComponent` | Scrolling backgrounds |
| Particle effects | `ParticleSystemComponent` | Explosions, dust, etc. |
| Shape rendering | `CircleComponent` / `RectangleComponent` | Debug, simple shapes |

---

## Quick Start

### Project Setup

```bash
# Create new Flutter project
flutter create my_game
cd my_game

# Add Flame dependencies
flutter pub add flame
flutter pub add flame_audio       # Optional: audio support
flutter pub add flame_tiled       # Optional: Tiled map support
flutter pub add flame_forge2d     # Optional: physics engine
```

### Project Structure

```
my_game/
  assets/
    images/
      player.png
      enemy.png
    audio/
      background.mp3
      jump.wav
    tiles/
      level1.tmx
  lib/
    main.dart
    game/
      my_game.dart
      components/
        player.dart
        enemy.dart
      worlds/
        game_world.dart
  pubspec.yaml
```

### pubspec.yaml Assets Configuration

```yaml
flutter:
  assets:
    - assets/images/
    - assets/audio/
    - assets/tiles/
```

### Minimal Game Setup

```dart
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    GameWidget(
      game: MyGame(),
    ),
  );
}

class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Load assets and initialize game
    await images.loadAll(['player.png', 'enemy.png']);

    // Add components to world
    world.add(Player(position: Vector2(100, 100)));
  }
}
```

---

## Core Architecture

### Game Structure

```
FlameGame (Main Game Class)
  |-- World (Contains game entities)
  |     |-- Player
  |     |-- Enemy
  |     |-- Background
  |     +-- ...
  +-- CameraComponent
        |-- Viewfinder (What camera sees)
        |     +-- HUD elements
        +-- Viewport (Screen region)
```

### FlameGame vs Game

| Class | Use Case |
|-------|----------|
| `FlameGame` | Most games - includes component system, camera, input |
| `Game` | Custom engine - manual render/update, no built-in features |

### Game Lifecycle

```dart
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // 1. Called once when game loads
    // Load assets, initialize components
  }

  @override
  void onMount() {
    // 2. Called when added to widget tree
  }

  @override
  void update(double dt) {
    super.update(dt);
    // 3. Called every frame (dt = delta time in seconds)
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);
    // 4. Called every frame to draw
  }

  @override
  void onGameResize(Vector2 size) {
    super.onGameResize(size);
    // 5. Called when screen size changes
  }

  @override
  void onRemove() {
    // 6. Called when game is removed
  }
}
```

---

## Flame Component System (FCS)

### Component Hierarchy

| Component Type | Purpose | Key Features |
|----------------|---------|--------------|
| `Component` | Base class | Lifecycle, children |
| `PositionComponent` | Has position/size | Transform, anchor |
| `SpriteComponent` | Renders single image | Static visuals |
| `SpriteAnimationComponent` | Animated sprites | Frame-based animation |
| `TextComponent` | Render text | Fonts, styles |
| `ParallaxComponent` | Scrolling backgrounds | Multiple layers |

### Creating Components

```dart
class Player extends SpriteAnimationComponent
    with HasGameRef<MyGame>, CollisionCallbacks {

  Player({required Vector2 position})
      : super(
          position: position,
          size: Vector2.all(64),
          anchor: Anchor.center,
        );

  final double speed = 200;
  final Vector2 velocity = Vector2.zero();

  @override
  Future<void> onLoad() async {
    // Load sprite animation
    animation = await game.loadSpriteAnimation(
      'player.png',
      SpriteAnimationData.sequenced(
        amount: 4,           // Number of frames
        stepTime: 0.15,      // Time per frame
        textureSize: Vector2(32, 32),
      ),
    );

    // Add hitbox for collision
    add(RectangleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    position += velocity * dt;
  }

  void move(Vector2 direction) {
    velocity.setFrom(direction * speed);
  }
}
```

### Component Best Practices

**DO**:
- Use `HasGameRef<MyGame>` mixin to access game instance
- Load assets in `onLoad()`, not constructor
- Clean up resources in `onRemove()`
- Use `anchor` for positioning pivot point

**DON'T**:
- Store heavy assets in component constructors
- Forget to call `super.update(dt)`
- Add components synchronously in `onLoad()` - use `await`

---

## Input Handling

### Touch/Mouse Input

```dart
// Game-level input
class MyGame extends FlameGame with TapCallbacks, DragCallbacks {
  @override
  void onTapDown(TapDownEvent event) {
    // event.localPosition - relative to game
    // event.canvasPosition - relative to canvas
  }

  @override
  void onDragUpdate(DragUpdateEvent event) {
    player.move(event.localDelta);
  }
}

// Component-level input
class Button extends SpriteComponent with TapCallbacks {
  @override
  void onTapDown(TapDownEvent event) {
    // Only triggers if tap is within component bounds
    print('Button pressed!');
  }
}
```

### Keyboard Input

```dart
class Player extends SpriteComponent
    with HasGameRef, KeyboardHandler {

  int horizontalDirection = 0;
  bool jumping = false;

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keysPressed) {
    horizontalDirection = 0;

    // Arrow keys or WASD
    if (keysPressed.contains(LogicalKeyboardKey.arrowLeft) ||
        keysPressed.contains(LogicalKeyboardKey.keyA)) {
      horizontalDirection = -1;
    }
    if (keysPressed.contains(LogicalKeyboardKey.arrowRight) ||
        keysPressed.contains(LogicalKeyboardKey.keyD)) {
      horizontalDirection = 1;
    }

    jumping = keysPressed.contains(LogicalKeyboardKey.space);

    return true; // Event handled
  }

  @override
  void update(double dt) {
    super.update(dt);
    velocity.x = horizontalDirection * speed;
  }
}
```

### Joystick (Mobile)

```dart
class MyGame extends FlameGame {
  late JoystickComponent joystick;

  @override
  Future<void> onLoad() async {
    joystick = JoystickComponent(
      knob: CircleComponent(radius: 30, paint: Paint()..color = Colors.blue),
      background: CircleComponent(radius: 60, paint: Paint()..color = Colors.grey),
      margin: const EdgeInsets.only(left: 40, bottom: 40),
    );

    camera.viewport.add(joystick); // Add to HUD
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (!joystick.delta.isZero()) {
      player.move(joystick.relativeDelta);
    }
  }
}
```

---

## Collision Detection

### Enable Collision System

```dart
class MyGame extends FlameGame with HasCollisionDetection {
  // Collision detection now active for all components with hitboxes
}
```

### Hitbox Types

| Hitbox | Shape | Use Case |
|--------|-------|----------|
| `RectangleHitbox` | Rectangle | Boxes, platforms |
| `CircleHitbox` | Circle | Balls, characters |
| `PolygonHitbox` | Custom polygon | Complex shapes |
| `ScreenHitbox` | Screen bounds | World boundaries |

### Collision Callbacks

```dart
class Player extends SpriteComponent with CollisionCallbacks {
  @override
  Future<void> onLoad() async {
    add(CircleHitbox());
  }

  @override
  void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollision(intersectionPoints, other);

    // Called every frame while colliding
    if (other is Enemy) {
      takeDamage();
    }
  }

  @override
  void onCollisionStart(Set<Vector2> intersectionPoints, PositionComponent other) {
    super.onCollisionStart(intersectionPoints, other);

    // Called once when collision begins
    if (other is Coin) {
      collectCoin(other);
    }
  }

  @override
  void onCollisionEnd(PositionComponent other) {
    super.onCollisionEnd(other);
    // Called once when collision ends
  }
}
```

### Platformer Collision Resolution

```dart
@override
void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
  if (other is PlatformBlock && intersectionPoints.length == 2) {
    // Calculate collision normal
    final mid = (intersectionPoints.elementAt(0) +
                 intersectionPoints.elementAt(1)) / 2;
    final collisionNormal = absoluteCenter - mid;
    final separationDistance = (size.x / 2) - collisionNormal.length;
    collisionNormal.normalize();

    // Check if landing on top
    if (Vector2(0, -1).dot(collisionNormal) > 0.9) {
      isOnGround = true;
      velocity.y = 0;
    }

    // Push out of collision
    position += collisionNormal.scaled(separationDistance);
  }
  super.onCollision(intersectionPoints, other);
}
```

---

## Camera System

### Camera Setup

```dart
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    final world = World();

    // Fixed resolution camera (game scales to screen)
    camera = CameraComponent.withFixedResolution(
      world: world,
      width: 800,
      height: 600,
    );

    // Add player
    final player = Player();
    world.add(player);

    // Camera follows player
    camera.follow(player, maxSpeed: 200, snap: false);

    // Set world bounds (camera won't go beyond)
    camera.setBounds(Rectangle.fromLTRB(0, 0, 3000, 1000));

    addAll([camera, world]);
  }
}
```

### Camera Effects

```dart
// Zoom
camera.viewfinder.zoom = 1.5;

// Camera shake
extension CameraShake on CameraComponent {
  void shake({double intensity = 10.0, double duration = 0.5}) {
    viewfinder.add(
      SequenceEffect([
        MoveEffect.by(Vector2(intensity, intensity),
            EffectController(duration: 0.05)),
        MoveEffect.by(Vector2(-intensity * 2, -intensity),
            EffectController(duration: 0.05)),
        MoveEffect.by(Vector2(intensity, 0),
            EffectController(duration: 0.05)),
      ]),
    );
  }
}

// Usage
game.camera.shake(intensity: 15);
```

### HUD Elements

```dart
// Add HUD to camera viewport (stays on screen)
camera.viewport.add(
  TextComponent(
    text: 'Score: 0',
    position: Vector2(20, 20),
    textRenderer: TextPaint(
      style: TextStyle(color: Colors.white, fontSize: 24),
    ),
  ),
);
```

---

## Sprite Animation

### Loading Animations

```dart
// From sprite sheet (frames in sequence)
animation = await game.loadSpriteAnimation(
  'character_spritesheet.png',
  SpriteAnimationData.sequenced(
    amount: 8,                    // Number of frames
    stepTime: 0.1,                // Seconds per frame
    textureSize: Vector2(32, 32), // Size of each frame
    texturePosition: Vector2.zero(), // Start position in sheet
    loop: true,
  ),
);

// From individual files
animation = SpriteAnimation.fromFrameData(
  await game.images.load('explosion.png'),
  SpriteAnimationData.sequenced(amount: 12, stepTime: 0.05, loop: false),
);

// Variable frame times
animation = SpriteAnimation.spriteList(
  [sprite1, sprite2, sprite3],
  stepTimes: [0.1, 0.2, 0.15],
);
```

### Animation State Machine

```dart
class Player extends SpriteAnimationGroupComponent<PlayerState>
    with HasGameRef {

  @override
  Future<void> onLoad() async {
    animations = {
      PlayerState.idle: await _loadAnimation('idle.png', 4, 0.2),
      PlayerState.run: await _loadAnimation('run.png', 8, 0.1),
      PlayerState.jump: await _loadAnimation('jump.png', 2, 0.15),
      PlayerState.fall: await _loadAnimation('fall.png', 2, 0.15),
    };

    current = PlayerState.idle;
  }

  Future<SpriteAnimation> _loadAnimation(String file, int frames, double stepTime) async {
    return game.loadSpriteAnimation(
      file,
      SpriteAnimationData.sequenced(
        amount: frames,
        stepTime: stepTime,
        textureSize: Vector2(32, 32),
      ),
    );
  }

  @override
  void update(double dt) {
    super.update(dt);
    _updateAnimationState();
  }

  void _updateAnimationState() {
    if (velocity.y < 0) {
      current = PlayerState.jump;
    } else if (velocity.y > 0) {
      current = PlayerState.fall;
    } else if (velocity.x.abs() > 0) {
      current = PlayerState.run;
    } else {
      current = PlayerState.idle;
    }
  }
}

enum PlayerState { idle, run, jump, fall }
```

---

## Effects System

### Built-in Effects

```dart
// Movement
component.add(MoveEffect.to(
  Vector2(200, 300),
  EffectController(duration: 1.0, curve: Curves.easeInOut),
));

// Scale
component.add(ScaleEffect.to(
  Vector2.all(2.0),
  EffectController(duration: 0.5),
));

// Rotation
component.add(RotateEffect.by(
  pi * 2, // Full rotation
  EffectController(duration: 1.0),
));

// Opacity
component.add(OpacityEffect.fadeOut(
  EffectController(duration: 0.3),
));

// Color
component.add(ColorEffect(
  Colors.red,
  EffectController(duration: 0.2),
));

// Sequence multiple effects
component.add(SequenceEffect([
  MoveEffect.by(Vector2(0, -50), EffectController(duration: 0.2)),
  MoveEffect.by(Vector2(0, 50), EffectController(duration: 0.2)),
]));

// Parallel effects
component.add(
  MoveEffect.to(target, EffectController(duration: 1.0)),
);
component.add(
  ScaleEffect.to(Vector2.all(0.5), EffectController(duration: 1.0)),
);
```

### Effect Controllers

```dart
// Repeating
EffectController(duration: 0.5, repeatCount: 3)

// Infinite
EffectController(duration: 0.5, infinite: true)

// Reverse (ping-pong)
EffectController(duration: 0.5, reverseDuration: 0.5)

// Delay before start
EffectController(duration: 0.5, startDelay: 1.0)

// Custom curves
EffectController(duration: 0.5, curve: Curves.bounceOut)
```

---

## Audio

### Setup

```bash
flutter pub add flame_audio
```

### Playing Audio

```dart
import 'package:flame_audio/flame_audio.dart';

class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Preload audio
    await FlameAudio.audioCache.loadAll([
      'background.mp3',
      'jump.wav',
      'coin.wav',
    ]);
  }

  void playBackgroundMusic() {
    FlameAudio.bgm.play('background.mp3', volume: 0.5);
  }

  void playSoundEffect(String sound) {
    FlameAudio.play(sound, volume: 0.8);
  }

  void stopMusic() {
    FlameAudio.bgm.stop();
  }
}
```

---

## Game State & Overlays

### Overlay System

```dart
void main() {
  runApp(
    GameWidget(
      game: MyGame(),
      overlayBuilderMap: {
        'MainMenu': (context, game) => MainMenuWidget(game as MyGame),
        'PauseMenu': (context, game) => PauseMenuWidget(game as MyGame),
        'GameOver': (context, game) => GameOverWidget(game as MyGame),
      },
      initialActiveOverlays: const ['MainMenu'],
    ),
  );
}

class MyGame extends FlameGame {
  void startGame() {
    overlays.remove('MainMenu');
    // Initialize game
  }

  void pauseGame() {
    pauseEngine();
    overlays.add('PauseMenu');
  }

  void resumeGame() {
    overlays.remove('PauseMenu');
    resumeEngine();
  }

  void gameOver() {
    pauseEngine();
    overlays.add('GameOver');
  }
}

// Flutter widget for overlay
class PauseMenuWidget extends StatelessWidget {
  final MyGame game;
  const PauseMenuWidget(this.game, {super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('PAUSED', style: TextStyle(fontSize: 48)),
          ElevatedButton(
            onPressed: game.resumeGame,
            child: const Text('Resume'),
          ),
        ],
      ),
    );
  }
}
```

---

## Bridge Packages

| Package | Purpose | Install |
|---------|---------|---------|
| `flame_audio` | Audio playback | `flutter pub add flame_audio` |
| `flame_tiled` | Tiled map editor support | `flutter pub add flame_tiled` |
| `flame_forge2d` | Box2D physics engine | `flutter pub add flame_forge2d` |
| `flame_rive` | Rive animations | `flutter pub add flame_rive` |
| `flame_lottie` | Lottie animations | `flutter pub add flame_lottie` |
| `flame_bloc` | State management | `flutter pub add flame_bloc` |
| `flame_riverpod` | State management | `flutter pub add flame_riverpod` |
| `flame_svg` | SVG rendering | `flutter pub add flame_svg` |

---

## Common Patterns

### Object Pooling

```dart
class BulletPool {
  final List<Bullet> _pool = [];
  final int _maxSize = 50;

  Bullet acquire(Vector2 position, Vector2 direction) {
    final bullet = _pool.isNotEmpty
        ? _pool.removeLast()
        : Bullet();

    bullet.reset(position, direction);
    return bullet;
  }

  void release(Bullet bullet) {
    if (_pool.length < _maxSize) {
      _pool.add(bullet);
    }
  }
}
```

### Spawner Component

```dart
class EnemySpawner extends Component with HasGameRef {
  late SpawnComponent spawner;

  @override
  Future<void> onLoad() async {
    spawner = SpawnComponent(
      factory: (index) => Enemy(
        position: Vector2(game.size.x + 50, Random().nextDouble() * game.size.y),
      ),
      period: 2.0,    // Spawn every 2 seconds
      selfPositioning: true,
    );
    add(spawner);
  }

  void startSpawning() => spawner.timer.start();
  void stopSpawning() => spawner.timer.stop();
}
```

### Parallax Background

```dart
class GameWorld extends World {
  @override
  Future<void> onLoad() async {
    final parallax = await ParallaxComponent.load(
      [
        ParallaxImageData('sky.png'),
        ParallaxImageData('mountains.png'),
        ParallaxImageData('trees.png'),
      ],
      baseVelocity: Vector2(20, 0),
      velocityMultiplierDelta: Vector2(1.5, 0),
    );
    add(parallax);
  }
}
```

---

## Performance Tips

1. **Use Sprite Sheets** - Combine sprites into atlases to reduce draw calls
2. **Object Pooling** - Reuse bullets, particles instead of creating/destroying
3. **Culling** - Remove off-screen components from tree
4. **Avoid allocations in update()** - Reuse Vector2 objects
5. **Profile with DevTools** - Flutter DevTools shows frame times
6. **Use `priority`** - Lower priority components render first (background)

```dart
// Set render priority
add(Background()..priority = 0);
add(Player()..priority = 10);
add(HUD()..priority = 100);
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Assets not loading | Check path in pubspec.yaml, run `flutter clean` |
| Component not visible | Check size, position, anchor, priority |
| Collision not working | Add `HasCollisionDetection` to game, add hitbox to component |
| Input not responding | Add correct mixin (`TapCallbacks`, etc.) |
| Animation not playing | Check frame count, stepTime, verify sprite sheet dimensions |
| Camera not following | Ensure player is in world, not game directly |

---

## Resources

- [Flame Docs](https://docs.flame-engine.org/latest/)
- [Flame GitHub](https://github.com/flame-engine/flame)
- [Awesome Flame](https://github.com/flame-engine/awesome-flame) - Community resources
- [Flame Tutorials](https://docs.flame-engine.org/latest/tutorials/tutorials.html)

## Related Skills

- [[game-development]] - General game patterns
- [[mobile]] - Flutter/Dart mobile development
- [[performance-optimization]] - General optimization
