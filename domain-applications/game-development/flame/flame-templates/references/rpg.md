# RPG Game Template

## Project Structure

```
lib/
├── main.dart
├── game/
│   ├── rpg_game.dart
│   └── game_state.dart
├── player/
│   ├── player.dart
│   └── player_stats.dart
├── enemies/
│   ├── enemy.dart
│   └── enemy_ai.dart
├── combat/
│   ├── combat_system.dart
│   └── turn_manager.dart
├── world/
│   ├── world_map.dart
│   └── npc.dart
└── ui/
    ├── hud.dart
    ├── dialog_box.dart
    └── menu.dart
```

## Main Entry Point

```dart
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    GameWidget<RpgGame>(
      game: RpgGame(),
      overlayBuilderMap: {
        'hud': (_, game) => GameHUD(game: game),
        'dialog': (_, game) => DialogOverlay(game: game),
        'menu': (_, game) => GameMenu(game: game),
        'combat': (_, game) => CombatUI(game: game),
      },
      initialActiveOverlays: const ['hud'],
    ),
  );
}
```

## Core Game Class

```dart
class RpgGame extends FlameGame with HasCollisionDetection {
  late Player player;
  late WorldMap currentMap;
  late DialogueManager dialogueManager;
  late QuestManager questManager;
  late InventoryManager inventory;
  late CombatSystem combat;

  GameMode mode = GameMode.exploration;

  @override
  Future<void> onLoad() async {
    camera.viewfinder.anchor = Anchor.center;

    // Initialize systems
    dialogueManager = DialogueManager();
    questManager = QuestManager();
    inventory = InventoryManager();
    combat = CombatSystem();

    addAll([dialogueManager, questManager, inventory, combat]);

    // Load initial map
    await loadMap('town_start');

    // Create player
    player = Player(position: Vector2(200, 200));
    world.add(player);

    camera.follow(player);
  }

  Future<void> loadMap(String mapId) async {
    // Clear current map
    world.children.whereType<MapComponent>().forEach((c) => c.removeFromParent());

    currentMap = await WorldMap.load(mapId);
    world.add(currentMap);

    // Spawn NPCs
    for (final npcData in currentMap.npcs) {
      world.add(Npc.fromData(npcData));
    }
  }

  void startCombat(List<Enemy> enemies) {
    mode = GameMode.combat;
    combat.start(player, enemies);
    overlays.add('combat');
  }

  void endCombat() {
    mode = GameMode.exploration;
    overlays.remove('combat');
  }

  void showDialog(String dialogueId) {
    dialogueManager.startDialogue(dialogueId);
    overlays.add('dialog');
  }

  void hideDialog() {
    overlays.remove('dialog');
  }
}

enum GameMode { exploration, combat, dialogue, menu }
```

## Player Class

```dart
class Player extends SpriteAnimationGroupComponent<PlayerState>
    with HasGameRef<RpgGame>, CollisionCallbacks, KeyboardHandler {

  static const double speed = 150;

  final PlayerStats stats = PlayerStats();
  Vector2 velocity = Vector2.zero();
  Vector2 _inputDirection = Vector2.zero();

  Player({required Vector2 position})
      : super(
          position: position,
          size: Vector2.all(48),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    animations = {
      PlayerState.idleDown: await _loadAnim('idle_down', 4),
      PlayerState.idleUp: await _loadAnim('idle_up', 4),
      PlayerState.idleLeft: await _loadAnim('idle_left', 4),
      PlayerState.idleRight: await _loadAnim('idle_right', 4),
      PlayerState.walkDown: await _loadAnim('walk_down', 6),
      PlayerState.walkUp: await _loadAnim('walk_up', 6),
      PlayerState.walkLeft: await _loadAnim('walk_left', 6),
      PlayerState.walkRight: await _loadAnim('walk_right', 6),
    };
    current = PlayerState.idleDown;

    add(RectangleHitbox(size: size * 0.6, position: size * 0.2));
  }

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keys) {
    if (game.mode != GameMode.exploration) return false;

    _inputDirection = Vector2.zero();
    if (keys.contains(LogicalKeyboardKey.keyW) ||
        keys.contains(LogicalKeyboardKey.arrowUp)) {
      _inputDirection.y = -1;
    }
    if (keys.contains(LogicalKeyboardKey.keyS) ||
        keys.contains(LogicalKeyboardKey.arrowDown)) {
      _inputDirection.y = 1;
    }
    if (keys.contains(LogicalKeyboardKey.keyA) ||
        keys.contains(LogicalKeyboardKey.arrowLeft)) {
      _inputDirection.x = -1;
    }
    if (keys.contains(LogicalKeyboardKey.keyD) ||
        keys.contains(LogicalKeyboardKey.arrowRight)) {
      _inputDirection.x = 1;
    }

    if (_inputDirection.length > 0) {
      _inputDirection.normalize();
    }

    // Interaction key
    if (keys.contains(LogicalKeyboardKey.keyE) ||
        keys.contains(LogicalKeyboardKey.space)) {
      _tryInteract();
    }

    return true;
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (game.mode == GameMode.exploration) {
      velocity = _inputDirection * speed;
      position += velocity * dt;
      _updateAnimation();
    }
  }

  void _updateAnimation() {
    if (velocity.length < 1) {
      // Idle
      current = switch (current) {
        PlayerState.walkDown => PlayerState.idleDown,
        PlayerState.walkUp => PlayerState.idleUp,
        PlayerState.walkLeft => PlayerState.idleLeft,
        PlayerState.walkRight => PlayerState.idleRight,
        _ => current,
      };
    } else {
      // Walking
      if (velocity.y > 0) {
        current = PlayerState.walkDown;
      } else if (velocity.y < 0) {
        current = PlayerState.walkUp;
      } else if (velocity.x < 0) {
        current = PlayerState.walkLeft;
      } else {
        current = PlayerState.walkRight;
      }
    }
  }

  void _tryInteract() {
    // Check for nearby NPCs
    final npcs = game.world.children.whereType<Npc>();
    for (final npc in npcs) {
      if (position.distanceTo(npc.position) < 50) {
        npc.interact();
        break;
      }
    }
  }

  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    if (other is Enemy && game.mode == GameMode.exploration) {
      game.startCombat([other]);
    }
    super.onCollisionStart(points, other);
  }
}

enum PlayerState {
  idleDown, idleUp, idleLeft, idleRight,
  walkDown, walkUp, walkLeft, walkRight,
}
```

## NPC Class

```dart
class Npc extends SpriteComponent with TapCallbacks, HasGameRef<RpgGame> {
  final String npcId;
  final String dialogueId;
  final String? questId;

  Npc({
    required this.npcId,
    required this.dialogueId,
    this.questId,
    required Vector2 position,
  }) : super(position: position, size: Vector2.all(48), anchor: Anchor.center);

  @override
  void onTapDown(TapDownEvent event) {
    interact();
  }

  void interact() {
    // Check if has quest to give
    if (questId != null) {
      final quest = game.questManager.getQuest(questId!);
      if (quest?.status == QuestStatus.available) {
        game.questManager.startQuest(questId!);
      }
    }

    // Start dialogue
    game.showDialog(dialogueId);
  }
}
```

## Combat System (Turn-based)

```dart
class CombatSystem extends Component with HasGameRef<RpgGame> {
  final List<CombatParticipant> turnOrder = [];
  int currentTurnIndex = 0;
  bool isPlayerTurn = false;

  CombatParticipant get currentTurn => turnOrder[currentTurnIndex];

  void start(Player player, List<Enemy> enemies) {
    turnOrder.clear();
    turnOrder.add(CombatParticipant.player(player));
    for (final enemy in enemies) {
      turnOrder.add(CombatParticipant.enemy(enemy));
    }

    // Sort by speed
    turnOrder.sort((a, b) => b.speed.compareTo(a.speed));
    currentTurnIndex = 0;
    _startTurn();
  }

  void _startTurn() {
    isPlayerTurn = currentTurn.isPlayer;

    if (!isPlayerTurn) {
      // AI takes action
      Future.delayed(const Duration(milliseconds: 500), () {
        _executeAITurn();
      });
    }
  }

  void playerAction(CombatAction action) {
    if (!isPlayerTurn) return;
    _executeAction(action);
    _nextTurn();
  }

  void _executeAITurn() {
    // Simple AI: attack player
    final player = turnOrder.firstWhere((p) => p.isPlayer);
    _executeAction(CombatAction.attack(currentTurn, player));
    _nextTurn();
  }

  void _executeAction(CombatAction action) {
    switch (action.type) {
      case ActionType.attack:
        final damage = DamageCalculator.calculate(
          attacker: action.actor.stats,
          defender: action.target!.stats,
          baseDamage: 10,
        );
        action.target!.takeDamage(damage.damage);
        break;
      // Handle other actions...
    }
  }

  void _nextTurn() {
    // Check for combat end
    if (_checkCombatEnd()) return;

    do {
      currentTurnIndex = (currentTurnIndex + 1) % turnOrder.length;
    } while (currentTurn.isDefeated);

    _startTurn();
  }

  bool _checkCombatEnd() {
    final playerDefeated = turnOrder.where((p) => p.isPlayer).every((p) => p.isDefeated);
    final enemiesDefeated = turnOrder.where((p) => !p.isPlayer).every((p) => p.isDefeated);

    if (playerDefeated) {
      game.endCombat();
      // Game over
      return true;
    }
    if (enemiesDefeated) {
      // Victory - grant rewards
      _grantRewards();
      game.endCombat();
      return true;
    }
    return false;
  }
}
```

## HUD Overlay

```dart
class GameHUD extends StatelessWidget {
  final RpgGame game;

  const GameHUD({required this.game});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Health bar
            _buildHealthBar(),
            const SizedBox(height: 8),
            // Mana bar
            _buildManaBar(),
            const Spacer(),
            // Quest tracker
            _buildQuestTracker(),
          ],
        ),
      ),
    );
  }

  Widget _buildHealthBar() {
    final stats = game.player.stats;
    return Row(
      children: [
        const Icon(Icons.favorite, color: Colors.red, size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: LinearProgressIndicator(
            value: stats.hp / stats.maxHp,
            backgroundColor: Colors.grey[800],
            valueColor: const AlwaysStoppedAnimation(Colors.red),
          ),
        ),
        const SizedBox(width: 8),
        Text('${stats.hp}/${stats.maxHp}', style: const TextStyle(color: Colors.white)),
      ],
    );
  }
}
```
