# Procedural Generation Reference

## Random with Seed

```dart
class SeededRandom {
  late Random _random;
  final int seed;

  SeededRandom([int? seed]) : seed = seed ?? DateTime.now().millisecondsSinceEpoch {
    _random = Random(this.seed);
  }

  int nextInt(int max) => _random.nextInt(max);
  double nextDouble() => _random.nextDouble();
  bool nextBool() => _random.nextBool();

  T pick<T>(List<T> list) => list[nextInt(list.length)];

  T pickWeighted<T>(Map<T, int> weights) {
    final total = weights.values.fold(0, (a, b) => a + b);
    var roll = nextInt(total);
    for (final entry in weights.entries) {
      roll -= entry.value;
      if (roll < 0) return entry.key;
    }
    return weights.keys.first;
  }
}
```

## Dungeon Generation (BSP)

```dart
class DungeonGenerator {
  final int width;
  final int height;
  final int minRoomSize;
  final SeededRandom random;

  late List<List<int>> grid;  // 0 = wall, 1 = floor
  final List<Rect> rooms = [];

  DungeonGenerator({
    required this.width,
    required this.height,
    this.minRoomSize = 6,
    int? seed,
  }) : random = SeededRandom(seed);

  List<List<int>> generate() {
    grid = List.generate(height, (_) => List.filled(width, 0));
    rooms.clear();

    _splitSpace(Rect.fromLTWH(0, 0, width.toDouble(), height.toDouble()));
    _connectRooms();

    return grid;
  }

  void _splitSpace(Rect space) {
    if (space.width < minRoomSize * 2 || space.height < minRoomSize * 2) {
      _createRoom(space);
      return;
    }

    final splitHorizontal = random.nextBool();

    if (splitHorizontal && space.height > minRoomSize * 2) {
      final splitY = space.top + minRoomSize + random.nextInt((space.height - minRoomSize * 2).toInt());
      _splitSpace(Rect.fromLTRB(space.left, space.top, space.right, splitY));
      _splitSpace(Rect.fromLTRB(space.left, splitY, space.right, space.bottom));
    } else if (space.width > minRoomSize * 2) {
      final splitX = space.left + minRoomSize + random.nextInt((space.width - minRoomSize * 2).toInt());
      _splitSpace(Rect.fromLTRB(space.left, space.top, splitX, space.bottom));
      _splitSpace(Rect.fromLTRB(splitX, space.top, space.right, space.bottom));
    } else {
      _createRoom(space);
    }
  }

  void _createRoom(Rect space) {
    final roomW = minRoomSize + random.nextInt((space.width - minRoomSize).toInt().clamp(1, 10));
    final roomH = minRoomSize + random.nextInt((space.height - minRoomSize).toInt().clamp(1, 10));
    final roomX = space.left + random.nextInt((space.width - roomW).toInt().clamp(1, 10));
    final roomY = space.top + random.nextInt((space.height - roomH).toInt().clamp(1, 10));

    final room = Rect.fromLTWH(roomX, roomY, roomW.toDouble(), roomH.toDouble());
    rooms.add(room);

    for (int y = roomY.toInt(); y < roomY + roomH && y < height; y++) {
      for (int x = roomX.toInt(); x < roomX + roomW && x < width; x++) {
        grid[y][x] = 1;
      }
    }
  }

  void _connectRooms() {
    for (int i = 0; i < rooms.length - 1; i++) {
      _createCorridor(rooms[i].center, rooms[i + 1].center);
    }
  }

  void _createCorridor(Offset from, Offset to) {
    int x = from.dx.toInt();
    int y = from.dy.toInt();

    // Horizontal first, then vertical
    while (x != to.dx.toInt()) {
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y][x] = 1;
      }
      x += x < to.dx ? 1 : -1;
    }
    while (y != to.dy.toInt()) {
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y][x] = 1;
      }
      y += y < to.dy ? 1 : -1;
    }
  }
}
```

## Room Templates

```dart
class RoomTemplate {
  final String id;
  final int width;
  final int height;
  final List<List<int>> layout;
  final List<SpawnPoint> spawns;
}

class SpawnPoint {
  final Vector2 position;
  final String type;  // 'enemy', 'item', 'chest', 'entrance', 'exit'
}

class TemplateRoomGenerator {
  final List<RoomTemplate> templates;
  final SeededRandom random;

  List<List<int>> generateWithTemplates(int gridWidth, int gridHeight) {
    final grid = List.generate(gridHeight, (_) => List.filled(gridWidth, 0));
    final placedRooms = <Rect>[];

    // Place rooms using templates
    for (int attempts = 0; attempts < 20; attempts++) {
      final template = random.pick(templates);
      final x = random.nextInt(gridWidth - template.width);
      final y = random.nextInt(gridHeight - template.height);

      if (_canPlace(placedRooms, x, y, template)) {
        _placeTemplate(grid, x, y, template);
        placedRooms.add(Rect.fromLTWH(
          x.toDouble(), y.toDouble(),
          template.width.toDouble(), template.height.toDouble(),
        ));
      }
    }

    return grid;
  }
}
```

## Enemy Spawning

```dart
class SpawnTable {
  final List<SpawnEntry> entries;

  SpawnTable(this.entries);

  String roll(SeededRandom random, int floorLevel) {
    final validEntries = entries.where((e) =>
        floorLevel >= e.minFloor && floorLevel <= e.maxFloor
    ).toList();

    final weights = <String, int>{};
    for (final entry in validEntries) {
      weights[entry.enemyId] = entry.weight;
    }

    return random.pickWeighted(weights);
  }
}

class SpawnEntry {
  final String enemyId;
  final int weight;
  final int minFloor;
  final int maxFloor;
}

// Usage
class DungeonFloor extends Component {
  void spawnEnemies(int count) {
    for (int i = 0; i < count; i++) {
      final enemyId = spawnTable.roll(random, currentFloor);
      final position = _findValidSpawnPosition();
      _spawnEnemy(enemyId, position);
    }
  }
}
```

## Loot Generation

```dart
class LootTable {
  final List<LootEntry> entries;
  final SeededRandom random;

  List<LootDrop> generateLoot(int lootLevel) {
    final drops = <LootDrop>[];

    for (final entry in entries) {
      if (random.nextDouble() * 100 < entry.dropChance) {
        final quantity = entry.minQuantity +
            random.nextInt(entry.maxQuantity - entry.minQuantity + 1);
        drops.add(LootDrop(entry.itemId, quantity));
      }
    }

    return drops;
  }
}

class LootEntry {
  final String itemId;
  final double dropChance;  // Percentage
  final int minQuantity;
  final int maxQuantity;
}

class LootDrop {
  final String itemId;
  final int quantity;

  LootDrop(this.itemId, this.quantity);
}
```

## Roguelike Floor Manager

```dart
class FloorManager extends Component with HasGameRef {
  int currentFloor = 1;
  late DungeonGenerator generator;
  late SpawnTable enemySpawnTable;
  late LootTable lootTable;

  final Map<int, int> floorSeeds = {};  // Floor -> seed mapping

  void generateFloor(int floor) {
    currentFloor = floor;

    // Use consistent seed for this floor
    final seed = floorSeeds[floor] ?? DateTime.now().millisecondsSinceEpoch;
    floorSeeds[floor] = seed;

    generator = DungeonGenerator(
      width: 50 + floor * 5,
      height: 50 + floor * 5,
      seed: seed,
    );

    final dungeon = generator.generate();
    _buildFloorFromGrid(dungeon);

    // Spawn enemies (more on deeper floors)
    final enemyCount = 3 + floor * 2;
    spawnEnemies(enemyCount);

    // Place items
    _placeItems();
  }

  void descendToNextFloor() {
    // Clear current floor
    world.children.whereType<Enemy>().forEach((e) => e.removeFromParent());
    world.children.whereType<Item>().forEach((i) => i.removeFromParent());

    generateFloor(currentFloor + 1);
    player.position = _findStartPosition();
  }
}
```

## Noise-based Terrain

```dart
class NoiseGenerator {
  // Simple Perlin-like noise
  double noise2D(double x, double y, int seed) {
    final random = Random(seed + (x * 1000 + y).toInt());
    return random.nextDouble();
  }

  double smoothNoise2D(double x, double y, int seed) {
    final corners = (noise2D(x - 1, y - 1, seed) +
            noise2D(x + 1, y - 1, seed) +
            noise2D(x - 1, y + 1, seed) +
            noise2D(x + 1, y + 1, seed)) / 16;
    final sides = (noise2D(x - 1, y, seed) +
            noise2D(x + 1, y, seed) +
            noise2D(x, y - 1, seed) +
            noise2D(x, y + 1, seed)) / 8;
    final center = noise2D(x, y, seed) / 4;
    return corners + sides + center;
  }

  List<List<int>> generateTerrain(int width, int height, int seed) {
    final terrain = List.generate(height, (_) => List.filled(width, 0));

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final value = smoothNoise2D(x / 10, y / 10, seed);
        terrain[y][x] = (value * 4).toInt(); // 0-3 terrain types
      }
    }

    return terrain;
  }
}
```

## JSON Data Format

```json
{
  "spawnTables": {
    "dungeon_common": [
      { "enemyId": "slime", "weight": 50, "minFloor": 1, "maxFloor": 99 },
      { "enemyId": "skeleton", "weight": 30, "minFloor": 1, "maxFloor": 99 },
      { "enemyId": "orc", "weight": 15, "minFloor": 3, "maxFloor": 99 },
      { "enemyId": "dragon", "weight": 5, "minFloor": 10, "maxFloor": 99 }
    ]
  },
  "lootTables": {
    "common_chest": [
      { "itemId": "gold", "dropChance": 100, "minQuantity": 10, "maxQuantity": 50 },
      { "itemId": "potion_health", "dropChance": 50, "minQuantity": 1, "maxQuantity": 2 },
      { "itemId": "weapon_random", "dropChance": 10, "minQuantity": 1, "maxQuantity": 1 }
    ]
  }
}
```
