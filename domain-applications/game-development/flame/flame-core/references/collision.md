# Collision Detection Reference

## Enable Collision System

```dart
class MyGame extends FlameGame with HasCollisionDetection {
  // Collision detection now active
}
```

## Hitbox Types

| Type | Shape | Use Case |
|------|-------|----------|
| `CircleHitbox` | Circle | Characters, balls |
| `RectangleHitbox` | Rectangle | Boxes, platforms |
| `PolygonHitbox` | Custom polygon | Complex shapes |
| `ScreenHitbox` | Screen bounds | World boundaries |

## Collision Types

```dart
// Active: Checks collisions with all hitboxes
add(CircleHitbox()..collisionType = CollisionType.active);

// Passive: Only collides with active (better for static objects)
add(RectangleHitbox()..collisionType = CollisionType.passive);

// Inactive: No collision
add(CircleHitbox()..collisionType = CollisionType.inactive);
```

## Collision Callbacks

```dart
class Player extends SpriteComponent with CollisionCallbacks {
  @override
  Future<void> onLoad() async {
    add(CircleHitbox());
  }

  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    super.onCollisionStart(points, other);
    // Called once when collision begins
    if (other is Enemy) takeDamage();
    if (other is Coin) collectCoin(other);
  }

  @override
  void onCollision(Set<Vector2> points, PositionComponent other) {
    super.onCollision(points, other);
    // Called every frame while colliding
    if (other is Platform) resolveCollision(points, other);
  }

  @override
  void onCollisionEnd(PositionComponent other) {
    super.onCollisionEnd(other);
    // Called once when collision ends
  }
}
```

## Platformer Collision Resolution

```dart
@override
void onCollision(Set<Vector2> points, PositionComponent other) {
  if (other is Platform && points.length == 2) {
    // Calculate collision normal
    final mid = (points.elementAt(0) + points.elementAt(1)) / 2;
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
  super.onCollision(points, other);
}
```

## Custom Hitbox Size

```dart
@override
Future<void> onLoad() async {
  // Smaller hitbox than sprite
  add(RectangleHitbox(
    size: size * 0.8,
    position: size * 0.1,
  ));

  // Circle with offset
  add(CircleHitbox(
    radius: 20,
    position: Vector2(size.x / 2, size.y / 2),
    anchor: Anchor.center,
  ));
}
```

## Debug Hitboxes

```dart
// In game class
debugMode = true;  // Shows all hitboxes

// Or per hitbox
add(CircleHitbox()
  ..renderShape = true
  ..paint = Paint()..color = Colors.red.withOpacity(0.3)
);
```

## Screen Boundary

```dart
class MyGame extends FlameGame with HasCollisionDetection {
  @override
  Future<void> onLoad() async {
    // Add screen boundary
    add(ScreenHitbox());
  }
}

class Player extends SpriteComponent with CollisionCallbacks {
  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    if (other is ScreenHitbox) {
      // Hit screen edge
      velocity = -velocity; // Bounce back
    }
  }
}
```
