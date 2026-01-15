# Particle System

## Built-in ParticleSystemComponent

```dart
import 'package:flame/particles.dart';
import 'package:flame/components.dart';

class MyGame extends FlameGame {
  void spawnExplosion(Vector2 position) {
    final particle = ParticleSystemComponent(
      particle: CircleParticle(
        radius: 5,
        paint: Paint()..color = Colors.orange,
      ),
      position: position,
    );
    add(particle);
  }
}
```

## Basic Particle Types

### CircleParticle

```dart
final particle = CircleParticle(
  radius: 10,
  paint: Paint()
    ..color = Colors.red
    ..style = PaintingStyle.fill,
);
```

### ImageParticle

```dart
final sprite = await Sprite.load('particle.png');

final particle = ImageParticle(
  sprite: sprite,
  size: Vector2.all(16),
);
```

### SpriteParticle

```dart
final sprite = await Sprite.load('spark.png');

final particle = SpriteParticle(
  sprite: sprite,
  size: Vector2.all(8),
);
```

### ComponentParticle

```dart
// Use any component as a particle
final particle = ComponentParticle(
  component: SpriteComponent(
    sprite: await Sprite.load('star.png'),
    size: Vector2.all(16),
  ),
);
```

## Particle Behaviors

### MovingParticle

```dart
final particle = MovingParticle(
  from: Vector2.zero(),
  to: Vector2(100, -50),  // Move right and up
  child: CircleParticle(
    radius: 5,
    paint: Paint()..color = Colors.yellow,
  ),
);
```

### AcceleratedParticle

```dart
final particle = AcceleratedParticle(
  acceleration: Vector2(0, 100),  // Gravity effect
  speed: Vector2(50, -100),       // Initial velocity
  child: CircleParticle(
    radius: 4,
    paint: Paint()..color = Colors.orange,
  ),
);
```

### ScalingParticle

```dart
final particle = ScalingParticle(
  to: 0,  // Scale from 1 to 0
  child: CircleParticle(
    radius: 10,
    paint: Paint()..color = Colors.blue,
  ),
);
```

### RotatingParticle

```dart
final particle = RotatingParticle(
  from: 0,
  to: pi * 2,  // Full rotation
  child: SpriteParticle(
    sprite: await Sprite.load('star.png'),
    size: Vector2.all(16),
  ),
);
```

### FadingParticle (OpacityParticle)

```dart
// Using ComputedParticle for opacity
final particle = ComputedParticle(
  renderer: (canvas, particle) {
    final opacity = 1 - particle.progress;
    canvas.drawCircle(
      Offset.zero,
      10,
      Paint()
        ..color = Colors.white.withOpacity(opacity),
    );
  },
);
```

## Particle Generators

### RandomGenerator

```dart
final random = Random();

Particle randomParticle() {
  return AcceleratedParticle(
    acceleration: Vector2(0, 200),
    speed: Vector2(
      random.nextDouble() * 200 - 100,  // -100 to 100
      random.nextDouble() * -200 - 50,   // -250 to -50
    ),
    child: CircleParticle(
      radius: random.nextDouble() * 3 + 2,
      paint: Paint()..color = [
        Colors.red,
        Colors.orange,
        Colors.yellow,
      ][random.nextInt(3)],
    ),
  );
}
```

### ComposedParticle

```dart
// Combine multiple particles
final particle = ComposedParticle(
  children: [
    CircleParticle(radius: 10, paint: Paint()..color = Colors.red),
    TranslatedParticle(
      offset: Vector2(20, 0),
      child: CircleParticle(radius: 5, paint: Paint()..color = Colors.blue),
    ),
  ],
);
```

## Common Effect Patterns

### Explosion Effect

```dart
class ExplosionEffect extends Component with HasGameRef {
  final Vector2 position;
  final Random _random = Random();

  ExplosionEffect({required this.position});

  @override
  Future<void> onLoad() async {
    // Main burst
    add(ParticleSystemComponent(
      position: position,
      particle: Particle.generate(
        count: 30,
        lifespan: 0.8,
        generator: (i) => AcceleratedParticle(
          acceleration: Vector2(0, 150),
          speed: Vector2(
            _random.nextDouble() * 300 - 150,
            _random.nextDouble() * -200 - 100,
          ),
          child: ScalingParticle(
            to: 0,
            child: CircleParticle(
              radius: _random.nextDouble() * 4 + 2,
              paint: Paint()..color = [
                Colors.orange,
                Colors.red,
                Colors.yellow,
              ][_random.nextInt(3)],
            ),
          ),
        ),
      ),
    ));

    // Smoke
    add(ParticleSystemComponent(
      position: position,
      particle: Particle.generate(
        count: 15,
        lifespan: 1.2,
        generator: (i) => AcceleratedParticle(
          acceleration: Vector2(0, -20),
          speed: Vector2(
            _random.nextDouble() * 60 - 30,
            _random.nextDouble() * -50 - 20,
          ),
          child: ComputedParticle(
            renderer: (canvas, particle) {
              final opacity = 0.5 * (1 - particle.progress);
              final radius = 8 + particle.progress * 15;
              canvas.drawCircle(
                Offset.zero,
                radius,
                Paint()..color = Colors.grey.withOpacity(opacity),
              );
            },
          ),
        ),
      ),
    ));

    // Auto remove
    Future.delayed(const Duration(seconds: 2), removeFromParent);
  }
}

// Usage
world.add(ExplosionEffect(position: enemy.position));
```

### Coin Collect Effect

```dart
class CoinCollectEffect extends Component {
  final Vector2 position;

  CoinCollectEffect({required this.position});

  @override
  Future<void> onLoad() async {
    final random = Random();

    add(ParticleSystemComponent(
      position: position,
      particle: Particle.generate(
        count: 10,
        lifespan: 0.5,
        generator: (i) => AcceleratedParticle(
          acceleration: Vector2(0, 100),
          speed: Vector2(
            random.nextDouble() * 100 - 50,
            random.nextDouble() * -150 - 50,
          ),
          child: ScalingParticle(
            to: 0,
            child: CircleParticle(
              radius: 3,
              paint: Paint()..color = Colors.yellow,
            ),
          ),
        ),
      ),
    ));

    Future.delayed(const Duration(milliseconds: 600), removeFromParent);
  }
}
```

### Dust Trail Effect

```dart
class DustTrail extends Component with HasGameRef {
  final PositionComponent target;
  double _spawnTimer = 0;
  final double spawnInterval = 0.05;
  final Random _random = Random();

  DustTrail({required this.target});

  @override
  void update(double dt) {
    super.update(dt);

    _spawnTimer += dt;
    if (_spawnTimer >= spawnInterval) {
      _spawnTimer = 0;
      _spawnDust();
    }
  }

  void _spawnDust() {
    gameRef.add(ParticleSystemComponent(
      position: target.position + Vector2(0, target.size.y / 2),
      particle: Particle.generate(
        count: 3,
        lifespan: 0.3,
        generator: (i) => AcceleratedParticle(
          acceleration: Vector2(0, -30),
          speed: Vector2(
            _random.nextDouble() * 20 - 10,
            _random.nextDouble() * -20,
          ),
          child: ComputedParticle(
            renderer: (canvas, particle) {
              final opacity = 0.4 * (1 - particle.progress);
              canvas.drawCircle(
                Offset.zero,
                3 + particle.progress * 4,
                Paint()..color = Colors.brown.withOpacity(opacity),
              );
            },
          ),
        ),
      ),
    ));
  }
}
```

### Fire Effect (Continuous)

```dart
class FireEffect extends Component with HasGameRef {
  final Vector2 position;
  double _timer = 0;
  final Random _random = Random();

  FireEffect({required this.position});

  @override
  void update(double dt) {
    super.update(dt);

    _timer += dt;
    if (_timer >= 0.03) {
      _timer = 0;
      _spawnFlame();
    }
  }

  void _spawnFlame() {
    gameRef.add(ParticleSystemComponent(
      position: position + Vector2(
        _random.nextDouble() * 10 - 5,
        0,
      ),
      particle: AcceleratedParticle(
        acceleration: Vector2(0, -50),
        speed: Vector2(
          _random.nextDouble() * 20 - 10,
          _random.nextDouble() * -80 - 40,
        ),
        lifespan: 0.6,
        child: ComputedParticle(
          renderer: (canvas, particle) {
            final progress = particle.progress;
            final color = Color.lerp(
              Colors.yellow,
              Colors.red.withOpacity(0),
              progress,
            )!;
            final radius = (1 - progress) * 8 + 2;

            canvas.drawCircle(
              Offset.zero,
              radius,
              Paint()..color = color,
            );
          },
        ),
      ),
    ));
  }
}
```

### Hit Impact Effect

```dart
class HitImpact extends Component {
  final Vector2 position;
  final Vector2 direction;

  HitImpact({required this.position, required this.direction});

  @override
  Future<void> onLoad() async {
    final random = Random();
    final normalized = direction.normalized();

    // Sparks in hit direction
    add(ParticleSystemComponent(
      position: position,
      particle: Particle.generate(
        count: 8,
        lifespan: 0.3,
        generator: (i) {
          final spread = (random.nextDouble() - 0.5) * 1.0;
          final angle = atan2(normalized.y, normalized.x) + spread;
          final speed = 100 + random.nextDouble() * 100;

          return MovingParticle(
            from: Vector2.zero(),
            to: Vector2(cos(angle), sin(angle)) * speed * 0.3,
            child: ScalingParticle(
              to: 0,
              child: CircleParticle(
                radius: 2,
                paint: Paint()..color = Colors.white,
              ),
            ),
          );
        },
      ),
    ));

    Future.delayed(const Duration(milliseconds: 400), removeFromParent);
  }
}
```

## Particle Manager

```dart
class ParticleManager extends Component with HasGameRef {
  static ParticleManager? _instance;
  static ParticleManager get instance => _instance!;

  // Preloaded sprites for particle effects
  late Sprite sparkSprite;
  late Sprite smokeSprite;
  late Sprite starSprite;

  @override
  Future<void> onLoad() async {
    _instance = this;

    sparkSprite = await Sprite.load('particles/spark.png');
    smokeSprite = await Sprite.load('particles/smoke.png');
    starSprite = await Sprite.load('particles/star.png');
  }

  void explosion(Vector2 position) {
    gameRef.add(ExplosionEffect(position: position));
  }

  void coinCollect(Vector2 position) {
    gameRef.add(CoinCollectEffect(position: position));
  }

  void hit(Vector2 position, Vector2 direction) {
    gameRef.add(HitImpact(position: position, direction: direction));
  }

  void spawnSpriteParticles(Vector2 position, Sprite sprite, {int count = 5}) {
    final random = Random();

    gameRef.add(ParticleSystemComponent(
      position: position,
      particle: Particle.generate(
        count: count,
        lifespan: 0.5,
        generator: (i) => AcceleratedParticle(
          acceleration: Vector2(0, 200),
          speed: Vector2(
            random.nextDouble() * 100 - 50,
            random.nextDouble() * -150 - 50,
          ),
          child: RotatingParticle(
            from: 0,
            to: random.nextDouble() * pi * 2,
            child: ScalingParticle(
              to: 0,
              child: SpriteParticle(
                sprite: sprite,
                size: Vector2.all(12),
              ),
            ),
          ),
        ),
      ),
    ));
  }
}

// Usage
ParticleManager.instance.explosion(enemy.position);
ParticleManager.instance.coinCollect(coin.position);
```

## Advanced: Custom Particle

```dart
class CustomParticle extends Particle {
  final Paint paint;
  final List<Vector2> trail = [];
  Vector2 position = Vector2.zero();
  Vector2 velocity;

  CustomParticle({
    required this.velocity,
    required Color color,
    super.lifespan,
  }) : paint = Paint()..color = color;

  @override
  void update(double dt) {
    super.update(dt);

    // Update position
    position += velocity * dt;
    velocity.y += 200 * dt; // gravity

    // Store trail
    trail.add(position.clone());
    if (trail.length > 10) {
      trail.removeAt(0);
    }
  }

  @override
  void render(Canvas canvas) {
    // Draw trail
    for (int i = 0; i < trail.length; i++) {
      final opacity = i / trail.length * (1 - progress);
      final radius = (i / trail.length) * 3;

      canvas.drawCircle(
        trail[i].toOffset(),
        radius,
        Paint()..color = paint.color.withOpacity(opacity),
      );
    }

    // Draw main particle
    canvas.drawCircle(
      position.toOffset(),
      4 * (1 - progress),
      paint,
    );
  }
}
```

## Performance Tips

### Object Pooling

```dart
class ParticlePool {
  final List<ParticleSystemComponent> _pool = [];
  final int maxSize;

  ParticlePool({this.maxSize = 50});

  ParticleSystemComponent acquire(Particle particle, Vector2 position) {
    if (_pool.isNotEmpty) {
      final component = _pool.removeLast();
      component.particle = particle;
      component.position = position;
      return component;
    }
    return ParticleSystemComponent(
      particle: particle,
      position: position,
    );
  }

  void release(ParticleSystemComponent component) {
    if (_pool.length < maxSize) {
      _pool.add(component);
    }
  }
}
```

### Particle Count Limits

```dart
class LimitedParticleManager extends Component {
  static const int maxActiveParticles = 100;
  final List<ParticleSystemComponent> _activeParticles = [];

  void spawn(ParticleSystemComponent particle) {
    // Remove oldest if at limit
    while (_activeParticles.length >= maxActiveParticles) {
      final oldest = _activeParticles.removeAt(0);
      oldest.removeFromParent();
    }

    _activeParticles.add(particle);
    add(particle);
  }

  @override
  void update(double dt) {
    super.update(dt);

    // Clean up finished particles
    _activeParticles.removeWhere((p) => p.isRemoved);
  }
}
```

## Best Practices

| Tip | Description |
|-----|-------------|
| **Limit count** | Keep particle count reasonable (< 100 active) |
| **Short lifespan** | Use 0.3-1.0 second lifespans |
| **Simple shapes** | CircleParticle is faster than SpriteParticle |
| **Pool objects** | Reuse ParticleSystemComponent when possible |
| **Batch similar** | Group similar particles in one system |
| **Auto cleanup** | Always remove effects after completion |
