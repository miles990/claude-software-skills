# Camera Reference

## Camera Setup

```dart
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Anchor viewfinder to top-left (default is center)
    camera.viewfinder.anchor = Anchor.topLeft;

    // Set zoom level
    camera.viewfinder.zoom = 2.0;

    // Add player to world, then follow
    final player = Player();
    world.add(player);
    camera.follow(player);
  }
}
```

## Camera Follow

```dart
// Basic follow
camera.follow(player);

// Follow with options
camera.follow(
  player,
  maxSpeed: 200,        // Smooth follow speed
  horizontalOnly: true, // Only follow X axis
  verticalOnly: false,  // Only follow Y axis
  snap: false,          // Instant vs smooth
);

// Stop following
camera.stop();

// Move to position
camera.moveTo(Vector2(500, 300), speed: 100);
```

## Viewport Types

| Type | Use Case |
|------|----------|
| `MaxViewport` | Fill available space (default) |
| `FixedResolutionViewport` | Fixed game resolution |
| `FixedAspectRatioViewport` | Maintain aspect ratio |

```dart
// Fixed resolution (pixel art games)
camera.viewport = FixedResolutionViewport(
  resolution: Vector2(320, 180),
);

// Fixed aspect ratio
camera.viewport = FixedAspectRatioViewport(
  aspectRatio: 16 / 9,
);
```

## HUD Layer (Viewport)

```dart
// Add HUD elements to viewport (stays fixed on screen)
@override
Future<void> onLoad() async {
  // Health bar in top-left
  camera.viewport.add(
    HealthBar()
      ..position = Vector2(10, 10)
      ..priority = 100,
  );

  // Score in top-right
  camera.viewport.add(
    ScoreDisplay()
      ..anchor = Anchor.topRight
      ..position = Vector2(size.x - 10, 10),
  );

  // Joystick (mobile)
  camera.viewport.add(joystick);
}
```

## Camera Bounds

```dart
// Limit camera movement to world bounds
camera.setBounds(
  Rectangle.fromLTWH(0, 0, worldWidth, worldHeight),
);

// Remove bounds
camera.setBounds(null);
```

## Screen Shake

```dart
// Simple shake effect
void shakeCamera() {
  camera.viewfinder.add(
    MoveEffect.by(
      Vector2(5, 5),
      EffectController(
        duration: 0.05,
        reverseDuration: 0.05,
        repeatCount: 5,
      ),
    ),
  );
}
```

## Coordinate Conversion

```dart
// Screen position to world position
Vector2 screenToWorld(Vector2 screenPos) {
  return camera.globalToLocal(screenPos);
}

// World position to screen position
Vector2 worldToScreen(Vector2 worldPos) {
  return camera.localToGlobal(worldPos);
}
```
