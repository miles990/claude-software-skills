# Roguelike Game Template

## Project Structure

```
lib/
├── main.dart
├── game/
│   ├── roguelike_game.dart
│   └── game_state.dart
├── player/
│   └── player.dart
├── dungeon/
│   ├── dungeon_generator.dart
│   ├── floor_manager.dart
│   └── room.dart
├── enemies/
│   ├── enemy.dart
│   └── spawn_table.dart
├── items/
│   ├── item.dart
│   └── loot_table.dart
├── combat/
│   └── combat_system.dart
└── ui/
    ├── hud.dart
    └── minimap.dart
```

## Main Entry Point

```dart
import 'package:flame/game.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(
    GameWidget<RoguelikeGame>(
      game: RoguelikeGame(),
      overlayBuilderMap: {
        'hud': (_, game) => GameHUD(game: game),
        'inventory': (_, game) => InventoryScreen(game: game),
        'gameOver': (_, game) => GameOverScreen(game: game),
        'floorTransition': (_, game) => FloorTransition(game: game),
      },
      initialActiveOverlays: const ['hud'],
    ),
  );
}
```

## Core Game Class

```dart
class RoguelikeGame extends FlameGame with HasCollisionDetection, HasKeyboardHandlerComponents {
  late Player player;
  late FloorManager floorManager;
  late DungeonGenerator dungeonGenerator;
  late SpawnTable enemySpawnTable;
  late LootTable lootTable;

  int currentFloor = 1;
  int gold = 0;
  int runSeed = 0;

  // Meta progression (persists between runs)
  MetaProgress meta = MetaProgress();

  @override
  Future<void> onLoad() async {
    camera.viewfinder.anchor = Anchor.center;
    camera.viewfinder.zoom = 2.0;

    // Initialize systems
    floorManager = FloorManager();
    dungeonGenerator = DungeonGenerator();
    enemySpawnTable = SpawnTable.load('enemies.json');
    lootTable = LootTable.load('loot.json');

    // Start new run
    startNewRun();
  }

  void startNewRun() {
    currentFloor = 1;
    gold = 0;
    runSeed = DateTime.now().millisecondsSinceEpoch;

    player = Player(stats: _getStartingStats());
    world.add(player);

    generateFloor();
    camera.follow(player);
  }

  void generateFloor() {
    // Clear previous floor
    world.children.whereType<DungeonTile>().forEach((t) => t.removeFromParent());
    world.children.whereType<Enemy>().forEach((e) => e.removeFromParent());
    world.children.whereType<ItemDrop>().forEach((i) => i.removeFromParent());

    // Generate dungeon
    final seed = runSeed + currentFloor;
    final dungeon = dungeonGenerator.generate(
      width: 50 + currentFloor * 5,
      height: 50 + currentFloor * 5,
      seed: seed,
    );

    // Create tiles
    _buildFloor(dungeon);

    // Place player at spawn
    player.position = dungeon.spawnPoint * 16;

    // Spawn enemies
    _spawnEnemies(dungeon, seed);

    // Place items
    _placeItems(dungeon, seed);

    // Place exit
    world.add(FloorExit(position: dungeon.exitPoint * 16));
  }

  void _buildFloor(DungeonData dungeon) {
    for (int y = 0; y < dungeon.height; y++) {
      for (int x = 0; x < dungeon.width; x++) {
        final tileType = dungeon.grid[y][x];
        if (tileType > 0) {
          world.add(DungeonTile(
            position: Vector2(x * 16.0, y * 16.0),
            tileType: tileType,
          ));
        }
      }
    }
  }

  void _spawnEnemies(DungeonData dungeon, int seed) {
    final random = SeededRandom(seed);
    final enemyCount = 3 + currentFloor * 2;

    for (int i = 0; i < enemyCount; i++) {
      final room = random.pick(dungeon.rooms);
      final position = room.randomPoint(random) * 16;

      final enemyType = enemySpawnTable.roll(random, currentFloor);
      world.add(Enemy.spawn(enemyType, position, currentFloor));
    }
  }

  void _placeItems(DungeonData dungeon, int seed) {
    final random = SeededRandom(seed + 1000);
    final itemCount = 2 + random.nextInt(3);

    for (int i = 0; i < itemCount; i++) {
      final room = random.pick(dungeon.rooms);
      final position = room.randomPoint(random) * 16;

      final itemId = lootTable.roll(random, currentFloor);
      world.add(ItemDrop(itemId: itemId, position: position));
    }
  }

  void descendFloor() {
    overlays.add('floorTransition');

    Future.delayed(const Duration(seconds: 1), () {
      currentFloor++;
      generateFloor();
      overlays.remove('floorTransition');
    });
  }

  void playerDied() {
    // Save meta progress
    meta.totalGold += gold;
    meta.highestFloor = max(meta.highestFloor, currentFloor);
    meta.totalRuns++;
    meta.save();

    overlays.add('gameOver');
  }

  PlayerStats _getStartingStats() {
    return PlayerStats(
      maxHp: 100 + meta.hpUpgrade * 10,
      attack: 10 + meta.attackUpgrade * 2,
      defense: 5 + meta.defenseUpgrade,
    );
  }
}
```

## Dungeon Generator

```dart
class DungeonGenerator {
  DungeonData generate({
    required int width,
    required int height,
    required int seed,
  }) {
    final random = SeededRandom(seed);
    final grid = List.generate(height, (_) => List.filled(width, 0));
    final rooms = <DungeonRoom>[];

    // BSP dungeon generation
    _splitSpace(
      grid, rooms, random,
      Rect.fromLTWH(1, 1, width - 2.0, height - 2.0),
    );

    // Connect rooms
    _connectRooms(grid, rooms, random);

    // Determine spawn and exit
    final spawnRoom = rooms.first;
    final exitRoom = rooms.last;

    return DungeonData(
      width: width,
      height: height,
      grid: grid,
      rooms: rooms,
      spawnPoint: spawnRoom.center,
      exitPoint: exitRoom.center,
    );
  }

  void _splitSpace(
    List<List<int>> grid,
    List<DungeonRoom> rooms,
    SeededRandom random,
    Rect space,
  ) {
    const minSize = 8;

    if (space.width < minSize * 2 && space.height < minSize * 2) {
      _createRoom(grid, rooms, random, space);
      return;
    }

    final splitHorizontal = space.width > space.height
        ? false
        : space.height > space.width
            ? true
            : random.nextBool();

    if (splitHorizontal && space.height >= minSize * 2) {
      final split = space.top + minSize + random.nextInt((space.height - minSize * 2).toInt());
      _splitSpace(grid, rooms, random, Rect.fromLTRB(space.left, space.top, space.right, split));
      _splitSpace(grid, rooms, random, Rect.fromLTRB(space.left, split, space.right, space.bottom));
    } else if (space.width >= minSize * 2) {
      final split = space.left + minSize + random.nextInt((space.width - minSize * 2).toInt());
      _splitSpace(grid, rooms, random, Rect.fromLTRB(space.left, space.top, split, space.bottom));
      _splitSpace(grid, rooms, random, Rect.fromLTRB(split, space.top, space.right, space.bottom));
    } else {
      _createRoom(grid, rooms, random, space);
    }
  }

  void _createRoom(
    List<List<int>> grid,
    List<DungeonRoom> rooms,
    SeededRandom random,
    Rect space,
  ) {
    final roomWidth = 4 + random.nextInt((space.width - 4).toInt().clamp(1, 8));
    final roomHeight = 4 + random.nextInt((space.height - 4).toInt().clamp(1, 8));
    final roomX = space.left.toInt() + random.nextInt((space.width - roomWidth).toInt().clamp(1, 5));
    final roomY = space.top.toInt() + random.nextInt((space.height - roomHeight).toInt().clamp(1, 5));

    final room = DungeonRoom(
      Rect.fromLTWH(roomX.toDouble(), roomY.toDouble(), roomWidth.toDouble(), roomHeight.toDouble()),
    );
    rooms.add(room);

    // Fill room with floor tiles
    for (int y = roomY; y < roomY + roomHeight; y++) {
      for (int x = roomX; x < roomX + roomWidth; x++) {
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
          grid[y][x] = 1; // Floor
        }
      }
    }
  }

  void _connectRooms(List<List<int>> grid, List<DungeonRoom> rooms, SeededRandom random) {
    for (int i = 0; i < rooms.length - 1; i++) {
      _createCorridor(grid, rooms[i].center, rooms[i + 1].center);
    }
  }

  void _createCorridor(List<List<int>> grid, Vector2 from, Vector2 to) {
    int x = from.x.toInt();
    int y = from.y.toInt();

    while (x != to.x.toInt()) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = 1;
      }
      x += x < to.x ? 1 : -1;
    }
    while (y != to.y.toInt()) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = 1;
      }
      y += y < to.y ? 1 : -1;
    }
  }
}

class DungeonRoom {
  final Rect bounds;

  DungeonRoom(this.bounds);

  Vector2 get center => Vector2(bounds.center.dx, bounds.center.dy);

  Vector2 randomPoint(SeededRandom random) {
    return Vector2(
      bounds.left + random.nextInt(bounds.width.toInt()),
      bounds.top + random.nextInt(bounds.height.toInt()),
    );
  }
}
```

## Player Class

```dart
class Player extends SpriteAnimationGroupComponent<PlayerState>
    with HasGameRef<RoguelikeGame>, CollisionCallbacks, KeyboardHandler {

  PlayerStats stats;
  Vector2 velocity = Vector2.zero();
  Vector2 _inputDir = Vector2.zero();

  static const double speed = 100;
  static const double attackCooldown = 0.3;
  double _attackTimer = 0;

  Player({required this.stats})
      : super(size: Vector2.all(16), anchor: Anchor.center);

  @override
  Future<void> onLoad() async {
    animations = {
      PlayerState.idle: await _loadAnim('idle', 4),
      PlayerState.walk: await _loadAnim('walk', 4),
      PlayerState.attack: await _loadAnim('attack', 4),
    };
    current = PlayerState.idle;

    add(CircleHitbox(radius: 6));
  }

  @override
  bool onKeyEvent(KeyEvent event, Set<LogicalKeyboardKey> keys) {
    _inputDir = Vector2.zero();

    if (keys.contains(LogicalKeyboardKey.keyW)) _inputDir.y = -1;
    if (keys.contains(LogicalKeyboardKey.keyS)) _inputDir.y = 1;
    if (keys.contains(LogicalKeyboardKey.keyA)) _inputDir.x = -1;
    if (keys.contains(LogicalKeyboardKey.keyD)) _inputDir.x = 1;

    if (_inputDir.length > 0) _inputDir.normalize();

    // Attack
    if (keys.contains(LogicalKeyboardKey.space) && _attackTimer <= 0) {
      _attack();
    }

    return true;
  }

  @override
  void update(double dt) {
    super.update(dt);

    if (_attackTimer > 0) {
      _attackTimer -= dt;
    } else {
      velocity = _inputDir * speed;
      position += velocity * dt;

      current = velocity.length > 1 ? PlayerState.walk : PlayerState.idle;
    }
  }

  void _attack() {
    _attackTimer = attackCooldown;
    current = PlayerState.attack;

    // Find enemies in range
    final enemies = game.world.children.whereType<Enemy>();
    for (final enemy in enemies) {
      if (position.distanceTo(enemy.position) < 30) {
        final damage = stats.attack;
        enemy.takeDamage(damage);
      }
    }
  }

  void takeDamage(int damage) {
    final actualDamage = max(1, damage - stats.defense);
    stats.hp -= actualDamage;

    // Flash red
    add(ColorEffect(
      Colors.red,
      EffectController(duration: 0.1),
      opacityTo: 0.5,
    ));

    if (stats.hp <= 0) {
      game.playerDied();
    }
  }

  void heal(int amount) {
    stats.hp = min(stats.hp + amount, stats.maxHp);
  }

  @override
  void onCollisionStart(Set<Vector2> points, PositionComponent other) {
    if (other is ItemDrop) {
      other.pickup(this);
    }
    if (other is FloorExit) {
      game.descendFloor();
    }
    super.onCollisionStart(points, other);
  }
}

enum PlayerState { idle, walk, attack }
```

## Enemy Class

```dart
class Enemy extends SpriteAnimationComponent with CollisionCallbacks, HasGameRef<RoguelikeGame> {
  final String enemyType;
  final int level;
  int hp;
  final int maxHp;
  final int attack;
  final int exp;

  Enemy({
    required this.enemyType,
    required this.level,
    required this.maxHp,
    required this.attack,
    required this.exp,
    required Vector2 position,
  })  : hp = maxHp,
        super(position: position, size: Vector2.all(16), anchor: Anchor.center);

  factory Enemy.spawn(String type, Vector2 position, int floor) {
    final baseHp = 20 + floor * 5;
    final baseAttack = 5 + floor * 2;
    return Enemy(
      enemyType: type,
      level: floor,
      maxHp: baseHp,
      attack: baseAttack,
      exp: 10 + floor * 5,
      position: position,
    );
  }

  @override
  Future<void> onLoad() async {
    animation = await game.loadSpriteAnimation(
      'enemies/$enemyType.png',
      SpriteAnimationData.sequenced(amount: 4, stepTime: 0.15, textureSize: Vector2.all(16)),
    );
    add(CircleHitbox(radius: 6));
  }

  @override
  void update(double dt) {
    super.update(dt);

    // Simple AI: move towards player
    final player = game.player;
    final dist = position.distanceTo(player.position);

    if (dist < 100 && dist > 20) {
      final dir = (player.position - position).normalized();
      position += dir * 30 * dt;
    } else if (dist <= 20) {
      // Attack player
      _tryAttack();
    }
  }

  double _attackCooldown = 0;
  void _tryAttack() {
    if (_attackCooldown > 0) return;
    _attackCooldown = 1.0;
    game.player.takeDamage(attack);
  }

  void takeDamage(int damage) {
    hp -= damage;

    // Damage number
    add(FloatingText('-$damage', Colors.red));

    if (hp <= 0) {
      _die();
    }
  }

  void _die() {
    // Grant exp
    game.player.stats.exp += exp;

    // Maybe drop loot
    if (Random().nextDouble() < 0.3) {
      final itemId = game.lootTable.roll(SeededRandom(), level);
      game.world.add(ItemDrop(itemId: itemId, position: position));
    }

    removeFromParent();
  }
}
```

## Meta Progression

```dart
class MetaProgress {
  int totalGold = 0;
  int totalRuns = 0;
  int highestFloor = 0;

  // Upgrades
  int hpUpgrade = 0;
  int attackUpgrade = 0;
  int defenseUpgrade = 0;

  int getUpgradeCost(String type) {
    final level = switch (type) {
      'hp' => hpUpgrade,
      'attack' => attackUpgrade,
      'defense' => defenseUpgrade,
      _ => 0,
    };
    return 100 * (level + 1);
  }

  bool buyUpgrade(String type) {
    final cost = getUpgradeCost(type);
    if (totalGold < cost) return false;

    totalGold -= cost;
    switch (type) {
      case 'hp':
        hpUpgrade++;
      case 'attack':
        attackUpgrade++;
      case 'defense':
        defenseUpgrade++;
    }
    save();
    return true;
  }

  Future<void> save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('meta_gold', totalGold);
    await prefs.setInt('meta_runs', totalRuns);
    await prefs.setInt('meta_floor', highestFloor);
    await prefs.setInt('upgrade_hp', hpUpgrade);
    await prefs.setInt('upgrade_attack', attackUpgrade);
    await prefs.setInt('upgrade_defense', defenseUpgrade);
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    totalGold = prefs.getInt('meta_gold') ?? 0;
    totalRuns = prefs.getInt('meta_runs') ?? 0;
    highestFloor = prefs.getInt('meta_floor') ?? 0;
    hpUpgrade = prefs.getInt('upgrade_hp') ?? 0;
    attackUpgrade = prefs.getInt('upgrade_attack') ?? 0;
    defenseUpgrade = prefs.getInt('upgrade_defense') ?? 0;
  }
}
```

## Mini-Map

```dart
class MiniMap extends PositionComponent with HasGameRef<RoguelikeGame> {
  static const double scale = 0.1;

  @override
  void render(Canvas canvas) {
    final dungeon = game.floorManager.currentDungeon;
    if (dungeon == null) return;

    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, dungeon.width * scale, dungeon.height * scale),
      Paint()..color = Colors.black.withOpacity(0.7),
    );

    // Rooms
    for (int y = 0; y < dungeon.height; y++) {
      for (int x = 0; x < dungeon.width; x++) {
        if (dungeon.grid[y][x] > 0) {
          canvas.drawRect(
            Rect.fromLTWH(x * scale, y * scale, scale, scale),
            Paint()..color = Colors.grey,
          );
        }
      }
    }

    // Player
    final playerPos = game.player.position / 16 * scale;
    canvas.drawCircle(
      Offset(playerPos.x, playerPos.y),
      2,
      Paint()..color = Colors.green,
    );

    // Exit
    final exitPos = dungeon.exitPoint * scale;
    canvas.drawRect(
      Rect.fromLTWH(exitPos.x - 1, exitPos.y - 1, 3, 3),
      Paint()..color = Colors.yellow,
    );
  }
}
```
