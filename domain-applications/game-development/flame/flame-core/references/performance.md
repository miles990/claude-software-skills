# Performance & Best Practices

## Memory Management

### Avoid Object Creation Per Frame

```dart
// ❌ BAD - Creates new objects every frame
class BadComponent extends PositionComponent {
  @override
  void update(double dt) {
    position += Vector2(10, 20) * dt;  // Creates new Vector2
  }

  @override
  void render(Canvas canvas) {
    canvas.drawRect(size.toRect(), Paint());  // Creates new Paint
  }
}

// ✅ GOOD - Reuse objects
class GoodComponent extends PositionComponent {
  final _direction = Vector2(10, 20);  // Reuse
  final _paint = Paint();              // Reuse
  final _tempVector = Vector2.zero();  // Temp for calculations

  @override
  void update(double dt) {
    _tempVector.setFrom(_direction);
    _tempVector.scale(dt);
    position.add(_tempVector);
  }

  @override
  void render(Canvas canvas) {
    canvas.drawRect(size.toRect(), _paint);
  }
}
```

### Image Cache Management

```dart
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Preload all images at once
    await images.loadAll([
      'player.png',
      'enemy.png',
      'background.png',
      'tileset.png',
    ]);
  }

  // Clear cache when changing levels
  Future<void> clearMemory() async {
    images.clearCache();
    Flame.assets.clearCache();
  }

  // Selective cache clear
  void unloadLevel(String levelId) {
    final levelAssets = getLevelAssets(levelId);
    for (final asset in levelAssets) {
      images.clear(asset);
    }
  }
}
```

### Component Pooling

```dart
class BulletPool {
  final List<Bullet> _pool = [];
  final int maxSize;

  BulletPool({this.maxSize = 100});

  Bullet acquire(Vector2 position, Vector2 velocity) {
    final bullet = _pool.isNotEmpty
        ? _pool.removeLast()
        : Bullet();

    bullet
      ..position = position
      ..velocity = velocity
      ..isActive = true;

    return bullet;
  }

  void release(Bullet bullet) {
    bullet.isActive = false;
    if (_pool.length < maxSize) {
      _pool.add(bullet);
    }
  }
}

class Bullet extends PositionComponent {
  Vector2 velocity = Vector2.zero();
  bool isActive = false;

  @override
  void update(double dt) {
    if (!isActive) return;
    position += velocity * dt;
  }

  void returnToPool() {
    (gameRef as MyGame).bulletPool.release(this);
    removeFromParent();
  }
}
```

## Component Best Practices

### Component Lifecycle

```dart
class MyComponent extends PositionComponent with HasGameRef {
  late Sprite _sprite;
  Timer? _timer;

  // 1. Constructor - minimal work only
  MyComponent({required super.position});

  // 2. onLoad - async initialization (called once)
  @override
  Future<void> onLoad() async {
    _sprite = await Sprite.load('sprite.png');
    size = Vector2.all(64);
    anchor = Anchor.center;
  }

  // 3. onMount - when added to component tree
  @override
  void onMount() {
    super.onMount();
    _timer = Timer.periodic(Duration(seconds: 1), (_) => doSomething());
  }

  // 4. update - called every frame
  @override
  void update(double dt) {
    super.update(dt);
    // Game logic
  }

  // 5. render - called every frame after update
  @override
  void render(Canvas canvas) {
    _sprite.render(canvas, size: size);
  }

  // 6. onRemove - cleanup
  @override
  void onRemove() {
    _timer?.cancel();
    super.onRemove();
  }
}
```

### Priority (Z-Order)

```dart
// Lower priority = rendered first (behind)
// Higher priority = rendered last (in front)

class Background extends SpriteComponent {
  Background() : super(priority: 0);
}

class GameEntity extends PositionComponent {
  GameEntity() : super(priority: 10);
}

class Player extends SpriteComponent {
  Player() : super(priority: 20);
}

class UI extends PositionComponent {
  UI() : super(priority: 100);
}

// Dynamic priority change
class Item extends SpriteComponent with TapCallbacks {
  @override
  void onTapDown(TapDownEvent event) {
    priority = 50;  // Bring to front when tapped
  }
}
```

### Visibility Optimization

```dart
class Enemy extends PositionComponent with HasVisibility {
  @override
  void update(double dt) {
    if (!isVisible) return;  // Skip update if not visible
    super.update(dt);
    // Update logic
  }
}

// Cull off-screen components
class CullableComponent extends PositionComponent with HasGameRef {
  @override
  void update(double dt) {
    final camera = gameRef.camera;
    final viewport = camera.visibleWorldRect;

    // Check if in view
    isVisible = viewport.overlaps(toRect());

    if (!isVisible) return;
    super.update(dt);
  }
}
```

## Rendering Optimization

### Batch Rendering

```dart
class TileMap extends Component {
  late SpriteBatch _batch;
  late Image _tilesetImage;

  @override
  Future<void> onLoad() async {
    _tilesetImage = await Flame.images.load('tileset.png');
    _batch = SpriteBatch(_tilesetImage);

    // Pre-calculate all tile positions
    _buildBatch();
  }

  void _buildBatch() {
    _batch.clear();

    for (int y = 0; y < mapHeight; y++) {
      for (int x = 0; x < mapWidth; x++) {
        final tileId = getTileAt(x, y);
        final srcRect = getTileRect(tileId);

        _batch.add(
          source: srcRect,
          offset: Vector2(x * tileSize, y * tileSize),
        );
      }
    }
  }

  @override
  void render(Canvas canvas) {
    _batch.render(canvas);
  }
}
```

### Reduce Draw Calls

```dart
// ❌ BAD - Many small draw calls
class BadParticles extends Component {
  final List<Particle> particles = [];

  @override
  void render(Canvas canvas) {
    for (final p in particles) {
      canvas.drawCircle(p.offset, p.radius, p.paint);
    }
  }
}

// ✅ GOOD - Batch into single path
class GoodParticles extends Component {
  final List<Particle> particles = [];
  final _paint = Paint()..color = Colors.yellow;
  final _path = Path();

  @override
  void render(Canvas canvas) {
    _path.reset();

    for (final p in particles) {
      _path.addOval(Rect.fromCircle(center: p.offset, radius: p.radius));
    }

    canvas.drawPath(_path, _paint);
  }
}
```

## Performance Monitoring

### HasPerformanceTracker

```dart
class MyGame extends FlameGame with HasPerformanceTracker {
  @override
  void update(double dt) {
    super.update(dt);

    // Monitor performance
    if (updateTime > 16) {  // > 16ms = below 60fps
      debugPrint('Slow update: ${updateTime}ms');
    }
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);

    if (renderTime > 16) {
      debugPrint('Slow render: ${renderTime}ms');
    }
  }
}
```

### FPS Counter

```dart
class FpsCounter extends TextComponent with HasGameRef {
  int _frameCount = 0;
  double _elapsed = 0;
  double _fps = 0;

  FpsCounter() : super(
    position: Vector2(10, 10),
    textRenderer: TextPaint(
      style: const TextStyle(color: Colors.green, fontSize: 16),
    ),
  );

  @override
  void update(double dt) {
    super.update(dt);

    _frameCount++;
    _elapsed += dt;

    if (_elapsed >= 1.0) {
      _fps = _frameCount / _elapsed;
      _frameCount = 0;
      _elapsed = 0;
      text = 'FPS: ${_fps.toStringAsFixed(1)}';
    }
  }
}
```

### Component Count Monitor

```dart
class DebugInfo extends TextComponent with HasGameRef {
  @override
  void update(double dt) {
    super.update(dt);

    final totalComponents = _countComponents(gameRef);
    text = 'Components: $totalComponents';
  }

  int _countComponents(Component component) {
    int count = 1;
    for (final child in component.children) {
      count += _countComponents(child);
    }
    return count;
  }
}
```

## Common Pitfalls

### 1. Expensive Operations in update()

```dart
// ❌ BAD - Heavy computation every frame
@override
void update(double dt) {
  final nearestEnemy = findNearestEnemy();  // O(n) search
  final path = calculatePath(position, nearestEnemy.position);  // Heavy
}

// ✅ GOOD - Cache and throttle
Timer? _pathTimer;
Enemy? _cachedTarget;
List<Vector2>? _cachedPath;

@override
void onMount() {
  _pathTimer = Timer.periodic(Duration(milliseconds: 500), (_) {
    _cachedTarget = findNearestEnemy();
    _cachedPath = calculatePath(position, _cachedTarget?.position);
  });
}

@override
void update(double dt) {
  // Use cached values
  if (_cachedPath != null) {
    followPath(_cachedPath!);
  }
}
```

### 2. Too Many Collision Checks

```dart
// ❌ BAD - All vs all collision
class MyGame extends FlameGame with HasCollisionDetection {
  // Default: every hitbox checks against every other hitbox
}

// ✅ GOOD - Use collision types wisely
class Bullet extends PositionComponent {
  @override
  Future<void> onLoad() async {
    add(RectangleHitbox()
      ..collisionType = CollisionType.active);  // Actively checks
  }
}

class Wall extends PositionComponent {
  @override
  Future<void> onLoad() async {
    add(RectangleHitbox()
      ..collisionType = CollisionType.passive);  // Only receives checks
  }
}

class Decoration extends PositionComponent {
  @override
  Future<void> onLoad() async {
    add(RectangleHitbox()
      ..collisionType = CollisionType.inactive);  // No collision
  }
}
```

### 3. Memory Leaks

```dart
// ❌ BAD - Event listeners not cleaned up
class BadComponent extends Component {
  late StreamSubscription _subscription;

  @override
  void onMount() {
    _subscription = eventBus.listen((event) => handleEvent(event));
  }

  // Missing onRemove - memory leak!
}

// ✅ GOOD - Always cleanup
class GoodComponent extends Component {
  late StreamSubscription _subscription;
  Timer? _timer;

  @override
  void onMount() {
    _subscription = eventBus.listen((event) => handleEvent(event));
    _timer = Timer.periodic(Duration(seconds: 1), tick);
  }

  @override
  void onRemove() {
    _subscription.cancel();
    _timer?.cancel();
    super.onRemove();
  }
}
```

## Checklist

| Item | Check |
|------|-------|
| No object creation in `update()` or `render()` | ⬜ |
| Images preloaded at startup | ⬜ |
| Object pooling for frequent spawn/destroy | ⬜ |
| Off-screen components culled | ⬜ |
| CollisionType set appropriately | ⬜ |
| Event listeners cleaned up in `onRemove()` | ⬜ |
| Expensive operations throttled/cached | ⬜ |
| FPS monitored during development | ⬜ |
| Batch rendering for many similar objects | ⬜ |
| Priority set for proper render order | ⬜ |

---

## Benchmark 數據

根據 [Filip Hráček 的 Benchmark](https://filiph.net/text/benchmarking-flutter-flame-unity-godot.html)（Flutter/Dart 團隊成員），比較 Flutter、Flame、Unity、Godot：

### 測試環境
- 測試項目：「The Bench」- 模擬真實遊戲場景
- 包含：動畫背景、移動精靈、多個 UI 元素、背景音樂
- 平台：iOS 和 Web

### 效能比較

| 指標 | Flutter/Flame | Unity | Godot |
|------|---------------|-------|-------|
| **啟動時間** | 最快 | 較慢 | 較慢 |
| **最大實體數** | ~數百個 | 數千個 | 數千個 |
| **CPU 使用率** | ~35-40% | ~35-40% | ~35-40% |
| **記憶體 (Web)** | 較高 | 較低 | 較低 |
| **記憶體 (iOS)** | 較低 | 中等 | 中等 |

### 效能瓶頸

Flame 的主要限制在於實體數量：

```dart
// ⚠️ 超過 200-300 個活躍實體時效能明顯下降
// 原因：Dart/Flutter 的渲染管線非為遊戲優化

// ✅ 對策
// 1. 物件池化 - 減少 GC 壓力
// 2. 視野剔除 - 只更新可見物件
// 3. 批次渲染 - 減少 draw calls
// 4. 降低更新頻率 - 非關鍵物件使用 TimerComponent
```

### 適用場景

基於 Benchmark 結果，Flame 適合：

| 適合 ✅ | 不適合 ❌ |
|---------|----------|
| 休閒遊戲 (卡牌、解謎) | 彈幕射擊 |
| Hyper-casual | RTS / 大規模戰鬥 |
| 視覺小說 / 互動故事 | 物理模擬密集 |
| 回合制 RPG / 戰棋 | 粒子效果密集 |
| 2D 平台遊戲 (適量敵人) | 3D 遊戲 |
| Flutter App 內嵌小遊戲 | AAA 級遊戲 |

### 優化目標

| 實體數量 | 預期 FPS | 建議 |
|----------|----------|------|
| < 50 | 60 FPS | 無需特別優化 |
| 50-150 | 60 FPS | 基本優化 (物件池) |
| 150-300 | 30-60 FPS | 完整優化 (池化+剔除+批次) |
| > 300 | < 30 FPS | 考慮使用 Unity/Godot |
