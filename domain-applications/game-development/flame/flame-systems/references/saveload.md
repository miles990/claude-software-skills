# Save/Load System Reference

## Data Structure

```dart
class SaveData {
  final String version;
  final DateTime timestamp;
  final PlayerSaveData player;
  final WorldSaveData world;
  final Map<String, dynamic> custom;

  Map<String, dynamic> toJson() => {
    'version': version,
    'timestamp': timestamp.toIso8601String(),
    'player': player.toJson(),
    'world': world.toJson(),
    'custom': custom,
  };

  factory SaveData.fromJson(Map<String, dynamic> json) => SaveData(
    version: json['version'],
    timestamp: DateTime.parse(json['timestamp']),
    player: PlayerSaveData.fromJson(json['player']),
    world: WorldSaveData.fromJson(json['world']),
    custom: json['custom'] ?? {},
  );
}

class PlayerSaveData {
  final Vector2 position;
  final CombatStats stats;
  final List<String> inventoryItems;
  final Map<String, int> itemQuantities;
  final List<String> equippedItems;
  final List<String> learnedSkills;
  final int gold;
  final int exp;
  final int level;
}

class WorldSaveData {
  final String currentScene;
  final List<String> completedQuests;
  final List<String> activeQuests;
  final Map<String, int> questProgress;
  final List<String> unlockedAchievements;
  final Map<String, bool> flags;
  final double playTime;
}
```

## Save Manager

```dart
class SaveManager {
  static const maxSlots = 3;
  final String saveDirectory;

  SaveManager({required this.saveDirectory});

  Future<void> save(int slot, SaveData data) async {
    final file = File('$saveDirectory/save_$slot.json');
    final json = jsonEncode(data.toJson());
    await file.writeAsString(json);
  }

  Future<SaveData?> load(int slot) async {
    final file = File('$saveDirectory/save_$slot.json');
    if (!await file.exists()) return null;

    final json = await file.readAsString();
    return SaveData.fromJson(jsonDecode(json));
  }

  Future<bool> exists(int slot) async {
    final file = File('$saveDirectory/save_$slot.json');
    return file.exists();
  }

  Future<void> delete(int slot) async {
    final file = File('$saveDirectory/save_$slot.json');
    if (await file.exists()) {
      await file.delete();
    }
  }

  Future<List<SaveSlotInfo>> getAllSlots() async {
    final slots = <SaveSlotInfo>[];
    for (int i = 0; i < maxSlots; i++) {
      final data = await load(i);
      slots.add(SaveSlotInfo(
        slot: i,
        isEmpty: data == null,
        timestamp: data?.timestamp,
        playTime: data?.world.playTime ?? 0,
        level: data?.player.level ?? 0,
      ));
    }
    return slots;
  }
}

class SaveSlotInfo {
  final int slot;
  final bool isEmpty;
  final DateTime? timestamp;
  final double playTime;
  final int level;
}
```

## Auto-Save

```dart
class AutoSaveManager extends Component with HasGameRef<MyGame> {
  final SaveManager saveManager;
  final Duration interval;
  double _timer = 0;

  AutoSaveManager({
    required this.saveManager,
    this.interval = const Duration(minutes: 5),
  });

  @override
  void update(double dt) {
    _timer += dt;
    if (_timer >= interval.inSeconds) {
      _timer = 0;
      _performAutoSave();
    }
  }

  Future<void> _performAutoSave() async {
    final data = game.collectSaveData();
    await saveManager.save(0, data);  // Slot 0 for auto-save
    game.showNotification('Auto-saved');
  }
}
```

## Cloud Save (Firebase)

```dart
class CloudSaveManager {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<void> uploadSave(String oderId, SaveData data) async {
    await _firestore
        .collection('saves')
        .doc(userId)
        .set(data.toJson());
  }

  Future<SaveData?> downloadSave(String userId) async {
    final doc = await _firestore
        .collection('saves')
        .doc(userId)
        .get();

    if (!doc.exists) return null;
    return SaveData.fromJson(doc.data()!);
  }

  Future<void> syncSave(String userId, SaveData localData) async {
    final cloudData = await downloadSave(userId);

    if (cloudData == null) {
      // No cloud save, upload local
      await uploadSave(userId, localData);
    } else if (localData.timestamp.isAfter(cloudData.timestamp)) {
      // Local is newer, upload
      await uploadSave(userId, localData);
    } else if (cloudData.timestamp.isAfter(localData.timestamp)) {
      // Cloud is newer, prompt user
      onConflict?.call(localData, cloudData);
    }
  }

  void Function(SaveData local, SaveData cloud)? onConflict;
}
```

## Save/Load UI

```dart
class SaveLoadUI extends PositionComponent with TapCallbacks {
  final SaveManager saveManager;
  final bool isSaveMode;
  List<SaveSlotInfo> slots = [];

  @override
  Future<void> onLoad() async {
    slots = await saveManager.getAllSlots();
  }

  @override
  void render(Canvas canvas) {
    _drawTitle(canvas, isSaveMode ? 'Save Game' : 'Load Game');

    double y = 60;
    for (final slot in slots) {
      _drawSlot(canvas, slot, Vector2(0, y));
      y += 100;
    }
  }

  void _drawSlot(Canvas canvas, SaveSlotInfo slot, Vector2 pos) {
    // Background
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(pos.x, pos.y, 300, 80),
        Radius.circular(8),
      ),
      Paint()..color = Colors.black.withOpacity(0.7),
    );

    if (slot.isEmpty) {
      _drawText(canvas, 'Empty Slot', pos + Vector2(20, 30));
    } else {
      _drawText(canvas, 'Level ${slot.level}', pos + Vector2(20, 15));
      _drawText(canvas, _formatPlayTime(slot.playTime), pos + Vector2(20, 35));
      _drawText(canvas, _formatTimestamp(slot.timestamp!), pos + Vector2(20, 55));
    }
  }

  String _formatPlayTime(double seconds) {
    final hours = (seconds / 3600).floor();
    final mins = ((seconds % 3600) / 60).floor();
    return '${hours}h ${mins}m';
  }

  @override
  void onTapDown(TapDownEvent event) {
    final slotIndex = ((event.localPosition.y - 60) / 100).floor();
    if (slotIndex >= 0 && slotIndex < slots.length) {
      if (isSaveMode) {
        onSaveSelected?.call(slotIndex);
      } else if (!slots[slotIndex].isEmpty) {
        onLoadSelected?.call(slotIndex);
      }
    }
  }

  void Function(int)? onSaveSelected;
  void Function(int)? onLoadSelected;
}
```

## Serialization Helpers

```dart
extension Vector2Serialization on Vector2 {
  Map<String, double> toJson() => {'x': x, 'y': y};
  static Vector2 fromJson(Map<String, dynamic> json) =>
      Vector2(json['x'], json['y']);
}

extension CombatStatsSerializion on CombatStats {
  Map<String, dynamic> toJson() => {
    'hp': hp,
    'maxHp': maxHp,
    'mp': mp,
    'maxMp': maxMp,
    'attack': attack,
    'defense': defense,
    'speed': speed,
  };

  static CombatStats fromJson(Map<String, dynamic> json) => CombatStats(
    maxHp: json['maxHp'],
    maxMp: json['maxMp'],
    attack: json['attack'],
    defense: json['defense'],
    speed: json['speed'],
  )
    ..hp = json['hp']
    ..mp = json['mp'];
}
```

## Game Integration

```dart
class MyGame extends FlameGame {
  late SaveManager saveManager;

  SaveData collectSaveData() {
    return SaveData(
      version: '1.0.0',
      timestamp: DateTime.now(),
      player: PlayerSaveData(
        position: player.position,
        stats: player.stats,
        inventoryItems: inventory.items.map((i) => i.id).toList(),
        // ...
      ),
      world: WorldSaveData(
        currentScene: router.currentRoute,
        completedQuests: questManager.completedQuests,
        // ...
      ),
    );
  }

  void applySaveData(SaveData data) {
    // Restore player
    player.position = data.player.position;
    player.stats = data.player.stats;

    // Restore inventory
    inventory.clear();
    for (final itemId in data.player.inventoryItems) {
      inventory.addItem(ItemDatabase.get(itemId)!);
    }

    // Restore world state
    router.pushReplacementNamed(data.world.currentScene);
    questManager.restoreState(data.world);

    onGameLoaded?.call();
  }
}
```
