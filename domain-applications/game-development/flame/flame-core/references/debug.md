# Debug Reference

## Debug Mode

```dart
// Enable debug mode for entire game
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    debugMode = true;  // Shows hitboxes, bounds, etc.
  }
}

// Per-component debug
class Player extends SpriteComponent {
  @override
  bool get debugMode => true;  // Only this component
}
```

## Debug Print (Flutter)

```dart
// Use debugPrint instead of print (throttled, safe)
debugPrint('Player position: $position');
debugPrint('Velocity: $velocity');
debugPrint('Collision with: ${other.runtimeType}');

// Conditional debug logging
void log(String message) {
  if (kDebugMode) {
    debugPrint('[MyGame] $message');
  }
}
```

## Collision Debug

```dart
class Player extends SpriteComponent with CollisionCallbacks {
  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    debugPrint('=== Collision Start ===');
    debugPrint('Player: $position, size: $size');
    debugPrint('Other: ${other.runtimeType} at ${other.position}');
    debugPrint('Points: $points');
    super.onCollisionStart(points, other);
  }
}

// Visual hitbox debug
add(CircleHitbox()
  ..renderShape = true
  ..paint = (Paint()
    ..color = Colors.red.withOpacity(0.5)
    ..style = PaintingStyle.stroke
    ..strokeWidth = 2)
);
```

## Performance Monitoring

```dart
class MyGame extends FlameGame {
  @override
  void update(double dt) {
    super.update(dt);

    // FPS monitoring
    if (kDebugMode) {
      final fps = 1 / dt;
      if (fps < 30) {
        debugPrint('Warning: Low FPS: ${fps.toStringAsFixed(1)}');
      }
    }
  }

  // Component count
  void logComponentCount() {
    debugPrint('World children: ${world.children.length}');
    debugPrint('Viewport children: ${camera.viewport.children.length}');
  }
}
```

## State Logging

```dart
// Log state changes
enum PlayerState { idle, run, jump }

class Player extends SpriteAnimationGroupComponent<PlayerState> {
  PlayerState _state = PlayerState.idle;

  set state(PlayerState newState) {
    if (_state != newState) {
      debugPrint('Player state: $_state -> $newState');
      _state = newState;
      current = newState;
    }
  }
}
```

## Input Debug

```dart
class Player extends SpriteComponent with KeyboardHandler {
  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keys) {
    debugPrint('Key event: ${event.runtimeType}');
    debugPrint('Active keys: ${keys.map((k) => k.keyLabel).join(", ")}');
    return true;
  }
}
```

## Visual Debug Overlay

```dart
class DebugOverlay extends PositionComponent with HasGameRef<MyGame> {
  late TextComponent fpsText;
  late TextComponent posText;

  @override
  Future<void> onLoad() async {
    fpsText = TextComponent(
      text: 'FPS: --',
      textRenderer: TextPaint(
        style: const TextStyle(color: Colors.yellow, fontSize: 12),
      ),
    );
    posText = TextComponent(
      text: 'Pos: --',
      position: Vector2(0, 15),
      textRenderer: TextPaint(
        style: const TextStyle(color: Colors.yellow, fontSize: 12),
      ),
    );
    addAll([fpsText, posText]);
  }

  @override
  void update(double dt) {
    super.update(dt);
    fpsText.text = 'FPS: ${(1 / dt).toStringAsFixed(0)}';
    final player = game.world.children.query<Player>().firstOrNull;
    if (player != null) {
      posText.text = 'Pos: ${player.position.x.toInt()}, ${player.position.y.toInt()}';
    }
  }
}

// Add to viewport
camera.viewport.add(DebugOverlay()..position = Vector2(10, 10));
```

## Common Debug Patterns

```dart
// Track component lifecycle
class MyComponent extends Component {
  @override
  Future<void> onLoad() async {
    debugPrint('${runtimeType} onLoad');
  }

  @override
  void onMount() {
    debugPrint('${runtimeType} onMount');
    super.onMount();
  }

  @override
  void onRemove() {
    debugPrint('${runtimeType} onRemove');
    super.onRemove();
  }
}

// Null safety debug
void collectItem(PositionComponent other) {
  if (other is! Collectible) {
    debugPrint('Warning: Expected Collectible, got ${other.runtimeType}');
    return;
  }
  // Safe to use as Collectible
}
```

## Assertions (Dev Only)

```dart
@override
Future<void> onLoad() async {
  assert(speed > 0, 'Speed must be positive');
  assert(health <= maxHealth, 'Health exceeds max');

  // Complex assertion with message
  assert(() {
    if (animation == null) {
      debugPrint('Warning: No animation loaded for $runtimeType');
      return false;
    }
    return true;
  }());
}
```
