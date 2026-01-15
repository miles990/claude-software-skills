# Components Reference

## Component Lifecycle

```dart
class MyComponent extends PositionComponent with HasGameRef<MyGame> {
  @override
  Future<void> onLoad() async {
    // 1. Load assets, add children
    await super.onLoad();
  }

  @override
  void onMount() {
    // 2. Component added to tree, game reference available
    super.onMount();
  }

  @override
  void update(double dt) {
    super.update(dt);
    // 3. Called every frame
  }

  @override
  void render(Canvas canvas) {
    super.render(canvas);
    // 4. Draw to canvas
  }

  @override
  void onRemove() {
    // 5. Cleanup
    super.onRemove();
  }
}
```

## Component Types

| Type | Use Case | Key Features |
|------|----------|--------------|
| `Component` | Logic only | Lifecycle, children |
| `PositionComponent` | Has position/size | Transform, anchor |
| `SpriteComponent` | Single image | Static visuals |
| `SpriteAnimationComponent` | Animated | Frame-based |
| `SpriteAnimationGroupComponent` | Multi-state | State machine |
| `TextComponent` | Text | Fonts, styles |
| `ParallaxComponent` | Backgrounds | Multiple layers |

## Best Practices

**DO:**
- Use `HasGameRef<MyGame>` mixin to access game
- Load assets in `onLoad()`, not constructor
- Clean up in `onRemove()`
- Use `anchor` for positioning pivot

**DON'T:**
- Store heavy assets in constructors
- Forget `super.update(dt)`
- Add components synchronously - use `await`

## Example: Player Component

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
    animation = await game.loadSpriteAnimation(
      'player.png',
      SpriteAnimationData.sequenced(
        amount: 4,
        stepTime: 0.15,
        textureSize: Vector2(32, 32),
      ),
    );
    add(RectangleHitbox());
  }

  @override
  void update(double dt) {
    super.update(dt);
    position += velocity * dt;
  }
}
```

## Component Tree Query

```dart
// Register for efficient querying
@override
void onLoad() {
  children.register<Enemy>();
}

// Query registered types
final enemies = children.query<Enemy>();

// Find ancestor
final game = findParent<MyGame>();
```

## Priority (Render Order)

```dart
add(Background()..priority = 0);   // Render first (bottom)
add(Player()..priority = 10);      // Middle
add(HUD()..priority = 100);        // Render last (top)
```
