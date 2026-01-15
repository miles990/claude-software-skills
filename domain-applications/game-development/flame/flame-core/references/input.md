# Input Reference

## Touch & Mouse

### Game-level Input

```dart
class MyGame extends FlameGame with TapCallbacks, DragCallbacks {
  @override
  void onTapDown(TapDownEvent event) {
    // event.localPosition - relative to game
    // event.canvasPosition - relative to canvas
  }

  @override
  void onDragUpdate(DragUpdateEvent event) {
    player.position += event.localDelta;
  }
}
```

### Component-level Input

```dart
class Button extends SpriteComponent with TapCallbacks {
  @override
  void onTapDown(TapDownEvent event) {
    // Only triggers if tap is within component bounds
    onPressed?.call();
  }
}
```

## Keyboard Input

```dart
class Player extends SpriteComponent with KeyboardHandler {
  int horizontalDir = 0;
  int verticalDir = 0;
  bool isShooting = false;

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keys) {
    horizontalDir = 0;
    verticalDir = 0;

    // Arrow keys
    if (keys.contains(LogicalKeyboardKey.arrowLeft)) horizontalDir = -1;
    if (keys.contains(LogicalKeyboardKey.arrowRight)) horizontalDir = 1;
    if (keys.contains(LogicalKeyboardKey.arrowUp)) verticalDir = -1;
    if (keys.contains(LogicalKeyboardKey.arrowDown)) verticalDir = 1;

    // WASD alternative
    if (keys.contains(LogicalKeyboardKey.keyA)) horizontalDir = -1;
    if (keys.contains(LogicalKeyboardKey.keyD)) horizontalDir = 1;
    if (keys.contains(LogicalKeyboardKey.keyW)) verticalDir = -1;
    if (keys.contains(LogicalKeyboardKey.keyS)) verticalDir = 1;

    // Action keys
    isShooting = keys.contains(LogicalKeyboardKey.space);

    return true; // Event handled
  }

  @override
  void update(double dt) {
    super.update(dt);
    velocity.x = horizontalDir * speed;
    velocity.y = verticalDir * speed;
  }
}
```

## Virtual Joystick (Mobile)

```dart
class MyGame extends FlameGame {
  late JoystickComponent joystick;
  late Player player;

  @override
  Future<void> onLoad() async {
    joystick = JoystickComponent(
      knob: CircleComponent(
        radius: 25,
        paint: Paint()..color = Colors.blue,
      ),
      background: CircleComponent(
        radius: 60,
        paint: Paint()..color = Colors.grey.withOpacity(0.5),
      ),
      margin: const EdgeInsets.only(left: 40, bottom: 40),
    );

    // Add to viewport (HUD layer)
    camera.viewport.add(joystick);
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (!joystick.delta.isZero()) {
      player.velocity = joystick.relativeDelta * player.speed;
    } else {
      player.velocity = Vector2.zero();
    }
  }
}
```

## Input Mixins Summary

| Mixin | Use Case |
|-------|----------|
| `TapCallbacks` | Tap events |
| `DragCallbacks` | Drag/swipe |
| `DoubleTapCallbacks` | Double tap |
| `LongPressCallbacks` | Long press |
| `KeyboardHandler` | Keyboard input |
| `HoverCallbacks` | Mouse hover |
| `ScrollCallbacks` | Mouse scroll |

## Mobile vs Desktop Pattern

```dart
class Player extends PositionComponent with KeyboardHandler {
  JoystickComponent? joystick;

  void setJoystick(JoystickComponent js) => joystick = js;

  @override
  void update(double dt) {
    // Check joystick first (mobile)
    if (joystick != null && !joystick!.delta.isZero()) {
      velocity = joystick!.relativeDelta * speed;
    }
    // Keyboard handled via onKeyEvent (desktop)

    position += velocity * dt;
  }
}
```
