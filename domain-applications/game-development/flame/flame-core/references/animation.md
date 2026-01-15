# Animation Reference

## Sprite Animation

```dart
class Player extends SpriteAnimationComponent {
  @override
  Future<void> onLoad() async {
    animation = await game.loadSpriteAnimation(
      'player_run.png',
      SpriteAnimationData.sequenced(
        amount: 6,           // Frame count
        stepTime: 0.1,       // Seconds per frame
        textureSize: Vector2(32, 32),
        loop: true,
      ),
    );
    size = Vector2(64, 64);
  }
}
```

## Animation Group (Multi-state)

```dart
enum PlayerState { idle, run, jump, attack }

class Player extends SpriteAnimationGroupComponent<PlayerState>
    with HasGameRef<MyGame> {

  @override
  Future<void> onLoad() async {
    animations = {
      PlayerState.idle: await _loadAnimation('idle.png', 4, 0.15),
      PlayerState.run: await _loadAnimation('run.png', 6, 0.1),
      PlayerState.jump: await _loadAnimation('jump.png', 2, 0.2),
      PlayerState.attack: await _loadAnimation('attack.png', 4, 0.08),
    };
    current = PlayerState.idle;
  }

  Future<SpriteAnimation> _loadAnimation(
    String src, int frames, double stepTime,
  ) async {
    return game.loadSpriteAnimation(
      src,
      SpriteAnimationData.sequenced(
        amount: frames,
        stepTime: stepTime,
        textureSize: Vector2(32, 32),
      ),
    );
  }

  void run() => current = PlayerState.run;
  void idle() => current = PlayerState.idle;
}
```

## Effects System

```dart
// Move effect
component.add(
  MoveEffect.to(
    Vector2(200, 100),
    EffectController(duration: 1.0),
  ),
);

// Scale effect
component.add(
  ScaleEffect.to(
    Vector2.all(2.0),
    EffectController(duration: 0.5),
  ),
);

// Rotate effect
component.add(
  RotateEffect.by(
    tau, // Full rotation
    EffectController(duration: 2.0),
  ),
);

// Opacity effect
component.add(
  OpacityEffect.fadeOut(
    EffectController(duration: 0.3),
  ),
);

// Color effect (tint)
component.add(
  ColorEffect(
    Colors.red,
    EffectController(duration: 0.2),
    opacityTo: 0.5,
  ),
);
```

## Effect Controllers

```dart
// Linear
EffectController(duration: 1.0)

// Curved (ease in/out)
EffectController(
  duration: 1.0,
  curve: Curves.easeInOut,
)

// Infinite loop
EffectController(
  duration: 1.0,
  infinite: true,
)

// Repeat N times
EffectController(
  duration: 0.5,
  repeatCount: 3,
)

// Reverse (ping-pong)
EffectController(
  duration: 0.5,
  reverseDuration: 0.5,
)

// Sequence
SequenceEffectController([
  EffectController(duration: 0.5),
  EffectController(duration: 1.0),
])
```

## Chained Effects

```dart
// Sequential effects
component.add(
  SequenceEffect([
    MoveEffect.by(Vector2(100, 0), EffectController(duration: 0.5)),
    ScaleEffect.to(Vector2.all(1.5), EffectController(duration: 0.3)),
    OpacityEffect.fadeOut(EffectController(duration: 0.2)),
    RemoveEffect(),
  ]),
);
```

## Effect Callbacks

```dart
component.add(
  MoveEffect.to(
    targetPosition,
    EffectController(duration: 1.0),
    onComplete: () {
      // Called when effect finishes
      print('Movement complete!');
    },
  ),
);
```

## Sprite Sheet Loading

```dart
// From sprite sheet with custom frames
final spriteSheet = SpriteSheet(
  image: await images.load('spritesheet.png'),
  srcSize: Vector2(32, 32),
);

final animation = spriteSheet.createAnimation(
  row: 0,
  stepTime: 0.1,
  from: 0,
  to: 5,
);
```
