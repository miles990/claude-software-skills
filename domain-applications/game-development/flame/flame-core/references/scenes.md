# Scenes & UI Reference

## RouterComponent (Scene Management)

```dart
class MyGame extends FlameGame {
  late final RouterComponent router;

  @override
  Future<void> onLoad() async {
    router = RouterComponent(
      initialRoute: 'menu',
      routes: {
        'menu': Route(MenuPage.new),
        'game': Route(GamePage.new),
        'settings': Route(SettingsPage.new),
        'pause': Route(PausePage.new, transparent: true),
      },
    );
    add(router);
  }
}

// Navigate between routes
game.router.pushNamed('game');
game.router.pushNamed('pause');  // Overlay on current
game.router.pop();               // Go back
game.router.pushReplacementNamed('menu'); // Replace current
```

## Route Pages

```dart
class MenuPage extends Component with HasGameRef<MyGame> {
  @override
  Future<void> onLoad() async {
    add(TextComponent(
      text: 'Main Menu',
      position: Vector2(100, 50),
    ));

    add(ButtonComponent(
      button: RectangleComponent(size: Vector2(120, 40)),
      onPressed: () => game.router.pushNamed('game'),
      position: Vector2(100, 150),
    ));
  }
}
```

## Overlays (Flutter UI Integration)

```dart
// 1. Define overlay widgets
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Show overlay
    overlays.add('pauseMenu');

    // Hide overlay
    overlays.remove('pauseMenu');
  }
}

// 2. Register in GameWidget
void main() {
  runApp(
    GameWidget<MyGame>(
      game: MyGame(),
      overlayBuilderMap: {
        'pauseMenu': (context, game) => PauseMenu(game: game),
        'gameOver': (context, game) => GameOverScreen(game: game),
        'hud': (context, game) => GameHUD(game: game),
      },
      initialActiveOverlays: const ['hud'],
    ),
  );
}

// 3. Create Flutter widget overlays
class PauseMenu extends StatelessWidget {
  final MyGame game;
  const PauseMenu({required this.game});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.black87,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('PAUSED', style: TextStyle(fontSize: 32, color: Colors.white)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                game.overlays.remove('pauseMenu');
                game.resumeEngine();
              },
              child: const Text('Resume'),
            ),
            ElevatedButton(
              onPressed: () {
                game.overlays.remove('pauseMenu');
                game.router.pushReplacementNamed('menu');
              },
              child: const Text('Main Menu'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## In-Game UI Components

```dart
// Text display
class ScoreDisplay extends TextComponent with HasGameRef {
  int _score = 0;

  @override
  Future<void> onLoad() async {
    text = 'Score: 0';
    textRenderer = TextPaint(
      style: const TextStyle(
        fontSize: 24,
        color: Colors.white,
        fontFamily: 'PressStart2P',
      ),
    );
  }

  void updateScore(int score) {
    _score = score;
    text = 'Score: $_score';
  }
}

// Health bar
class HealthBar extends PositionComponent {
  double maxHealth = 100;
  double currentHealth = 100;

  @override
  void render(Canvas canvas) {
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, 100, 10),
      Paint()..color = Colors.grey,
    );
    // Health
    canvas.drawRect(
      Rect.fromLTWH(0, 0, 100 * (currentHealth / maxHealth), 10),
      Paint()..color = Colors.green,
    );
  }
}

// Button component
class GameButton extends PositionComponent with TapCallbacks {
  final VoidCallback onPressed;
  final String label;

  GameButton({required this.label, required this.onPressed});

  @override
  Future<void> onLoad() async {
    size = Vector2(120, 40);
    add(RectangleComponent(
      size: size,
      paint: Paint()..color = Colors.blue,
    ));
    add(TextComponent(
      text: label,
      position: size / 2,
      anchor: Anchor.center,
    ));
  }

  @override
  void onTapDown(TapDownEvent event) => onPressed();
}
```

## NineTileBox (Scalable UI)

```dart
class DialogBox extends NineTileBoxComponent {
  @override
  Future<void> onLoad() async {
    nineTileBox = NineTileBox(
      await Sprite.load('dialog_box.png'),
      tileSize: 16,        // Corner/edge tile size
      destTileSize: 32,    // Scaled size
    );
    size = Vector2(300, 150);
  }
}
```

## Scene Transitions

```dart
// Fade transition
game.router.pushNamed(
  'game',
  // Custom transition (requires extension)
);

// Manual transition with effects
class FadeTransition extends Component {
  @override
  Future<void> onLoad() async {
    final overlay = RectangleComponent(
      size: game.size,
      paint: Paint()..color = Colors.black.withOpacity(0),
    );
    add(overlay);

    overlay.add(
      OpacityEffect.to(
        1.0,
        EffectController(duration: 0.5),
        onComplete: () {
          // Switch scene
          game.router.pushReplacementNamed('nextScene');
          // Fade out
          overlay.add(OpacityEffect.to(
            0.0,
            EffectController(duration: 0.5),
            onComplete: () => removeFromParent(),
          ));
        },
      ),
    );
  }
}
```

## Pause/Resume Game

```dart
// Pause game loop
game.pauseEngine();

// Resume game loop
game.resumeEngine();

// Check if paused
if (game.paused) { ... }
```
