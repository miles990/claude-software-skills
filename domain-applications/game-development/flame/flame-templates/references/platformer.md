# Platformer Game Template

## Project Structure

```
lib/
├── main.dart
├── game/
│   └── platformer_game.dart
├── player/
│   ├── player.dart
│   └── player_state.dart
├── world/
│   ├── platform.dart
│   ├── hazard.dart
│   └── level_loader.dart
├── collectibles/
│   ├── coin.dart
│   └── powerup.dart
├── enemies/
│   └── enemy.dart
└── ui/
    └── hud.dart
```

## Main Entry Point

```dart
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    GameWidget<PlatformerGame>(
      game: PlatformerGame(),
      overlayBuilderMap: {
        'hud': (_, game) => GameHUD(game: game),
        'pause': (_, game) => PauseMenu(game: game),
        'gameOver': (_, game) => GameOverScreen(game: game),
        'levelComplete': (_, game) => LevelCompleteScreen(game: game),
      },
      initialActiveOverlays: const ['hud'],
    ),
  );
}
```

## Core Game Class

```dart
class PlatformerGame extends FlameGame with HasCollisionDetection, HasKeyboardHandlerComponents {
  late Player player;
  late CameraComponent cam;

  int currentLevel = 1;
  int score = 0;
  int lives = 3;

  static const double gravity = 800;

  @override
  Future<void> onLoad() async {
    // Setup camera with fixed resolution
    camera.viewport = FixedResolutionViewport(resolution: Vector2(400, 240));
    camera.viewfinder.anchor = Anchor.center;

    await loadLevel(currentLevel);
  }

  Future<void> loadLevel(int levelNum) async {
    // Clear world
    world.removeAll(world.children);

    // Load level from Tiled
    final level = await TiledComponent.load(
      'level_$levelNum.tmx',
      Vector2.all(16),
    );
    world.add(level);

    // Parse objects from Tiled
    _parseLevel(level);

    // Add boundaries
    world.add(ScreenHitbox());

    // Follow player
    camera.follow(player, horizontalOnly: false, verticalOnly: false);
  }

  void _parseLevel(TiledComponent level) {
    final spawnLayer = level.tileMap.getLayer<ObjectGroup>('Spawns');

    for (final obj in spawnLayer?.objects ?? []) {
      switch (obj.class_) {
        case 'Player':
          player = Player(position: Vector2(obj.x, obj.y));
          world.add(player);
          break;
        case 'Coin':
          world.add(Coin(position: Vector2(obj.x, obj.y)));
          break;
        case 'Enemy':
          world.add(Enemy(position: Vector2(obj.x, obj.y)));
          break;
        case 'Goal':
          world.add(Goal(position: Vector2(obj.x, obj.y)));
          break;
      }
    }
  }

  void collectCoin() {
    score += 100;
  }

  void playerDied() {
    lives--;
    if (lives <= 0) {
      overlays.add('gameOver');
    } else {
      // Respawn at checkpoint
      player.respawn();
    }
  }

  void levelComplete() {
    overlays.add('levelComplete');
  }

  void nextLevel() {
    overlays.remove('levelComplete');
    currentLevel++;
    loadLevel(currentLevel);
  }
}
```

## Player Class

```dart
class Player extends SpriteAnimationGroupComponent<PlayerState>
    with HasGameRef<PlatformerGame>, CollisionCallbacks, KeyboardHandler {

  static const double moveSpeed = 150;
  static const double jumpForce = 300;
  static const double maxFallSpeed = 400;

  Vector2 velocity = Vector2.zero();
  bool isOnGround = false;
  bool isFacingRight = true;
  int _horizontalInput = 0;

  Vector2 _spawnPoint = Vector2.zero();

  Player({required Vector2 position})
      : super(
          position: position,
          size: Vector2(32, 32),
          anchor: Anchor.bottomCenter,
        ) {
    _spawnPoint = position.clone();
  }

  @override
  Future<void> onLoad() async {
    animations = {
      PlayerState.idle: await _loadAnim('idle', 4, 0.15),
      PlayerState.run: await _loadAnim('run', 6, 0.1),
      PlayerState.jump: await _loadAnim('jump', 1, 0.1),
      PlayerState.fall: await _loadAnim('fall', 1, 0.1),
    };
    current = PlayerState.idle;

    add(RectangleHitbox(
      size: Vector2(20, 30),
      position: Vector2(6, 2),
    ));
  }

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keys) {
    _horizontalInput = 0;

    if (keys.contains(LogicalKeyboardKey.keyA) ||
        keys.contains(LogicalKeyboardKey.arrowLeft)) {
      _horizontalInput = -1;
    }
    if (keys.contains(LogicalKeyboardKey.keyD) ||
        keys.contains(LogicalKeyboardKey.arrowRight)) {
      _horizontalInput = 1;
    }

    // Jump
    if ((keys.contains(LogicalKeyboardKey.space) ||
         keys.contains(LogicalKeyboardKey.keyW) ||
         keys.contains(LogicalKeyboardKey.arrowUp)) &&
        isOnGround) {
      _jump();
    }

    return true;
  }

  void _jump() {
    velocity.y = -jumpForce;
    isOnGround = false;
    current = PlayerState.jump;
  }

  @override
  void update(double dt) {
    super.update(dt);

    // Horizontal movement
    velocity.x = _horizontalInput * moveSpeed;

    // Flip sprite
    if (_horizontalInput != 0) {
      isFacingRight = _horizontalInput > 0;
      scale.x = isFacingRight ? 1 : -1;
    }

    // Apply gravity
    velocity.y += PlatformerGame.gravity * dt;
    velocity.y = velocity.y.clamp(-jumpForce, maxFallSpeed);

    // Apply velocity
    position += velocity * dt;

    // Update animation
    _updateAnimation();

    // Death check (fell off map)
    if (position.y > game.size.y + 100) {
      game.playerDied();
    }
  }

  void _updateAnimation() {
    if (!isOnGround) {
      current = velocity.y < 0 ? PlayerState.jump : PlayerState.fall;
    } else if (velocity.x.abs() > 1) {
      current = PlayerState.run;
    } else {
      current = PlayerState.idle;
    }
  }

  @override
  void onCollision(Set<Vector2> intersectionPoints, PositionComponent other) {
    if (other is Platform) {
      _resolvePlatformCollision(intersectionPoints, other);
    }
    super.onCollision(intersectionPoints, other);
  }

  void _resolvePlatformCollision(Set<Vector2> points, Platform platform) {
    if (points.length < 2) return;

    final mid = (points.first + points.last) / 2;
    final collisionNormal = position - mid;
    collisionNormal.normalize();

    // Landing on top
    if (collisionNormal.y < -0.5 && velocity.y > 0) {
      isOnGround = true;
      velocity.y = 0;
      position.y = platform.position.y;
    }
    // Hitting from below
    else if (collisionNormal.y > 0.5 && velocity.y < 0) {
      velocity.y = 0;
    }
    // Hitting from side
    else {
      final pushBack = collisionNormal.x > 0 ? 1 : -1;
      position.x += pushBack * 2;
    }
  }

  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    if (other is Coin) {
      other.collect();
      game.collectCoin();
    }
    if (other is Enemy) {
      // Check if stomping
      if (velocity.y > 0 && position.y < other.position.y) {
        other.stomp();
        velocity.y = -jumpForce * 0.5; // Bounce
      } else {
        // Take damage
        game.playerDied();
      }
    }
    if (other is Hazard) {
      game.playerDied();
    }
    if (other is Goal) {
      game.levelComplete();
    }
    super.onCollisionStart(points, other);
  }

  void respawn() {
    position = _spawnPoint.clone();
    velocity = Vector2.zero();
  }
}

enum PlayerState { idle, run, jump, fall }
```

## Platform Class

```dart
class Platform extends PositionComponent with CollisionCallbacks {
  Platform({
    required Vector2 position,
    required Vector2 size,
  }) : super(position: position, size: size);

  @override
  Future<void> onLoad() async {
    add(RectangleHitbox()..collisionType = CollisionType.passive);
  }
}

class MovingPlatform extends Platform {
  final Vector2 moveDistance;
  final double moveSpeed;

  Vector2 _startPos = Vector2.zero();
  double _progress = 0;
  int _direction = 1;

  MovingPlatform({
    required super.position,
    required super.size,
    required this.moveDistance,
    this.moveSpeed = 50,
  });

  @override
  Future<void> onLoad() async {
    await super.onLoad();
    _startPos = position.clone();
  }

  @override
  void update(double dt) {
    super.update(dt);

    _progress += moveSpeed * dt * _direction;

    if (_progress >= moveDistance.length) {
      _progress = moveDistance.length;
      _direction = -1;
    } else if (_progress <= 0) {
      _progress = 0;
      _direction = 1;
    }

    final normalized = moveDistance.normalized();
    position = _startPos + normalized * _progress;
  }
}
```

## Collectible Classes

```dart
class Coin extends SpriteAnimationComponent with CollisionCallbacks, HasGameRef {
  bool isCollected = false;

  Coin({required Vector2 position})
      : super(
          position: position,
          size: Vector2.all(16),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    animation = await game.loadSpriteAnimation(
      'coin.png',
      SpriteAnimationData.sequenced(
        amount: 4,
        stepTime: 0.1,
        textureSize: Vector2.all(16),
      ),
    );
    add(CircleHitbox()..collisionType = CollisionType.passive);
  }

  void collect() {
    if (isCollected) return;
    isCollected = true;

    // Play collect animation
    add(SequenceEffect([
      ScaleEffect.to(Vector2.all(1.5), EffectController(duration: 0.1)),
      OpacityEffect.fadeOut(EffectController(duration: 0.1)),
      RemoveEffect(),
    ]));
  }
}

class PowerUp extends SpriteComponent with CollisionCallbacks, HasGameRef {
  final PowerUpType type;

  PowerUp({required Vector2 position, required this.type})
      : super(position: position, size: Vector2.all(24), anchor: Anchor.center);

  @override
  Future<void> onLoad() async {
    sprite = await game.loadSprite('powerup_${type.name}.png');
    add(RectangleHitbox()..collisionType = CollisionType.passive);
  }
}

enum PowerUpType { speedBoost, doubleJump, invincible }
```

## Enemy Class

```dart
class Enemy extends SpriteAnimationComponent with CollisionCallbacks, HasGameRef {
  final double patrolDistance;
  final double speed;

  Vector2 _startPos = Vector2.zero();
  int _direction = 1;
  bool _isStomped = false;

  Enemy({
    required Vector2 position,
    this.patrolDistance = 100,
    this.speed = 50,
  }) : super(position: position, size: Vector2(32, 32), anchor: Anchor.bottomCenter);

  @override
  Future<void> onLoad() async {
    animation = await game.loadSpriteAnimation(
      'enemy_walk.png',
      SpriteAnimationData.sequenced(amount: 4, stepTime: 0.15, textureSize: Vector2.all(32)),
    );
    _startPos = position.clone();

    add(RectangleHitbox(size: Vector2(28, 28), position: Vector2(2, 4)));
  }

  @override
  void update(double dt) {
    if (_isStomped) return;
    super.update(dt);

    position.x += speed * _direction * dt;

    if ((position.x - _startPos.x).abs() >= patrolDistance) {
      _direction *= -1;
      scale.x = _direction.toDouble();
    }
  }

  void stomp() {
    _isStomped = true;
    animation = null; // Or play death animation

    add(SequenceEffect([
      ScaleEffect.to(Vector2(1.5, 0.3), EffectController(duration: 0.1)),
      RemoveEffect(),
    ]));
  }
}
```

## HUD

```dart
class GameHUD extends StatelessWidget {
  final PlatformerGame game;

  const GameHUD({required this.game});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Score
            Row(
              children: [
                const Icon(Icons.star, color: Colors.yellow),
                const SizedBox(width: 8),
                Text(
                  '${game.score}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            // Lives
            Row(
              children: List.generate(
                game.lives,
                (_) => const Icon(Icons.favorite, color: Colors.red),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```
