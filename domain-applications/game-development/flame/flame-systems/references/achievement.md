# Achievement System Reference

## Data Structure

```dart
enum AchievementCategory { combat, exploration, collection, story, social }
enum AchievementRarity { bronze, silver, gold, platinum }

class AchievementData {
  final String id;
  final String title;
  final String description;
  final String iconPath;
  final AchievementCategory category;
  final AchievementRarity rarity;
  final int points;
  final bool isHidden;
  final AchievementCondition condition;
  final AchievementReward? reward;
}

class AchievementCondition {
  final String type;          // 'count', 'flag', 'multi'
  final String targetId;      // What to track
  final int requiredValue;    // Target count
  final List<AchievementCondition>? subConditions; // For 'multi' type
}

class AchievementReward {
  final int gold;
  final int exp;
  final List<String> itemIds;
  final String? titleId;      // Unlocked title/badge
}

class AchievementProgress {
  final AchievementData data;
  int currentValue = 0;
  bool isUnlocked = false;
  DateTime? unlockedAt;

  double get progress => currentValue / data.condition.requiredValue;
  bool get isComplete => currentValue >= data.condition.requiredValue;
}
```

## Achievement Manager

```dart
class AchievementManager extends Component {
  final Map<String, AchievementProgress> _achievements = {};
  int totalPoints = 0;

  List<AchievementProgress> get unlocked =>
      _achievements.values.where((a) => a.isUnlocked).toList();

  List<AchievementProgress> get inProgress =>
      _achievements.values.where((a) => !a.isUnlocked && !a.data.isHidden).toList();

  void loadAchievements(List<AchievementData> achievements) {
    for (final achievement in achievements) {
      _achievements[achievement.id] = AchievementProgress(data: achievement);
    }
  }

  void updateProgress(String type, String targetId, int amount) {
    for (final progress in _achievements.values) {
      if (progress.isUnlocked) continue;

      final condition = progress.data.condition;
      if (condition.type == type && condition.targetId == targetId) {
        progress.currentValue += amount;

        if (progress.isComplete) {
          _unlock(progress);
        } else {
          onProgressUpdated?.call(progress);
        }
      }
    }
  }

  void setFlag(String flagId) {
    for (final progress in _achievements.values) {
      if (progress.isUnlocked) continue;

      final condition = progress.data.condition;
      if (condition.type == 'flag' && condition.targetId == flagId) {
        progress.currentValue = 1;
        _unlock(progress);
      }
    }
  }

  void _unlock(AchievementProgress progress) {
    progress.isUnlocked = true;
    progress.unlockedAt = DateTime.now();
    totalPoints += progress.data.points;

    _grantReward(progress.data.reward);
    onAchievementUnlocked?.call(progress);
  }

  void _grantReward(AchievementReward? reward) {
    if (reward == null) return;
    // Grant gold, exp, items via game reference
  }

  // Callbacks
  void Function(AchievementProgress)? onAchievementUnlocked;
  void Function(AchievementProgress)? onProgressUpdated;
}
```

## JSON Data Format

```json
{
  "achievements": [
    {
      "id": "first_kill",
      "title": "First Blood",
      "description": "Defeat your first enemy",
      "iconPath": "achievements/first_kill.png",
      "category": "combat",
      "rarity": "bronze",
      "points": 10,
      "isHidden": false,
      "condition": { "type": "count", "targetId": "enemy_killed", "requiredValue": 1 },
      "reward": { "gold": 100, "exp": 50 }
    },
    {
      "id": "monster_slayer",
      "title": "Monster Slayer",
      "description": "Defeat 100 enemies",
      "iconPath": "achievements/monster_slayer.png",
      "category": "combat",
      "rarity": "silver",
      "points": 50,
      "isHidden": false,
      "condition": { "type": "count", "targetId": "enemy_killed", "requiredValue": 100 },
      "reward": { "gold": 500, "exp": 200, "items": ["trophy_sword"] }
    },
    {
      "id": "secret_area",
      "title": "???",
      "description": "???",
      "iconPath": "achievements/secret.png",
      "category": "exploration",
      "rarity": "gold",
      "points": 100,
      "isHidden": true,
      "condition": { "type": "flag", "targetId": "found_secret_area", "requiredValue": 1 }
    }
  ]
}
```

## Achievement Popup

```dart
class AchievementPopup extends PositionComponent {
  final AchievementProgress achievement;
  double displayTime = 0;
  static const displayDuration = 3.0;

  @override
  Future<void> onLoad() async {
    // Slide in from right
    position = Vector2(game.size.x, 20);
    add(MoveEffect.to(
      Vector2(game.size.x - 320, 20),
      EffectController(duration: 0.3, curve: Curves.easeOut),
    ));
  }

  @override
  void update(double dt) {
    super.update(dt);
    displayTime += dt;
    if (displayTime >= displayDuration) {
      // Slide out
      add(MoveEffect.to(
        Vector2(game.size.x, 20),
        EffectController(duration: 0.3, curve: Curves.easeIn),
        onComplete: removeFromParent,
      ));
    }
  }

  @override
  void render(Canvas canvas) {
    // Background
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, 300, 80),
        Radius.circular(10),
      ),
      Paint()..color = _getRarityColor(achievement.data.rarity),
    );

    // Icon
    // ...

    // Text
    _drawText(canvas, 'Achievement Unlocked!', Vector2(80, 10), size: 12);
    _drawText(canvas, achievement.data.title, Vector2(80, 30), size: 16);
    _drawText(canvas, '+${achievement.data.points} points', Vector2(80, 55), size: 12);
  }

  Color _getRarityColor(AchievementRarity rarity) {
    return switch (rarity) {
      AchievementRarity.bronze => Color(0xFFCD7F32),
      AchievementRarity.silver => Color(0xFFC0C0C0),
      AchievementRarity.gold => Color(0xFFFFD700),
      AchievementRarity.platinum => Color(0xFFE5E4E2),
    };
  }
}
```

## Achievement List UI

```dart
class AchievementListUI extends PositionComponent {
  final AchievementManager manager;
  AchievementCategory? selectedCategory;

  @override
  void render(Canvas canvas) {
    // Category tabs
    double x = 0;
    for (final category in AchievementCategory.values) {
      final isSelected = category == selectedCategory;
      _drawTab(canvas, category.name, Vector2(x, 0), isSelected);
      x += 100;
    }

    // Achievement list
    final achievements = _getFilteredAchievements();
    double y = 50;
    for (final achievement in achievements) {
      _drawAchievementRow(canvas, achievement, Vector2(0, y));
      y += 70;
    }

    // Total points
    _drawText(canvas, 'Total: ${manager.totalPoints} points', Vector2(0, size.y - 30));
  }

  void _drawAchievementRow(Canvas canvas, AchievementProgress progress, Vector2 pos) {
    final data = progress.data;

    // Background
    final color = progress.isUnlocked ? Colors.green.withOpacity(0.3) : Colors.grey.withOpacity(0.3);
    canvas.drawRect(Rect.fromLTWH(pos.x, pos.y, size.x, 60), Paint()..color = color);

    // Icon (greyed out if locked)
    // ...

    // Title & description
    final title = data.isHidden && !progress.isUnlocked ? '???' : data.title;
    final desc = data.isHidden && !progress.isUnlocked ? 'Hidden achievement' : data.description;
    _drawText(canvas, title, pos + Vector2(70, 10));
    _drawText(canvas, desc, pos + Vector2(70, 30), size: 12, color: Colors.grey);

    // Progress bar (if not unlocked)
    if (!progress.isUnlocked && !data.isHidden) {
      _drawProgressBar(canvas, progress.progress, pos + Vector2(70, 45), 200);
    }
  }

  List<AchievementProgress> _getFilteredAchievements() {
    if (selectedCategory == null) {
      return manager._achievements.values.toList();
    }
    return manager._achievements.values
        .where((a) => a.data.category == selectedCategory)
        .toList();
  }
}
```

## Integration

```dart
// When enemy is killed
void onEnemyKilled(Enemy enemy) {
  achievementManager.updateProgress('count', 'enemy_killed', 1);
  achievementManager.updateProgress('count', 'enemy_${enemy.type}_killed', 1);
}

// When area is discovered
void onAreaDiscovered(String areaId) {
  achievementManager.setFlag('discovered_$areaId');
}

// When item is collected
void onItemCollected(Item item) {
  achievementManager.updateProgress('count', 'item_collected', 1);
  achievementManager.updateProgress('count', 'item_${item.type}_collected', 1);
}
```
