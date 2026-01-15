# Quest System Reference

## Data Structure

```dart
enum QuestStatus { locked, available, active, completed }
enum ObjectiveType { kill, collect, talk, reach, custom }

class QuestObjective {
  final String id;
  final ObjectiveType type;
  final String description;
  final int requiredAmount;
  int currentAmount = 0;

  bool get isComplete => currentAmount >= requiredAmount;
}

class Quest {
  final String id;
  final String title;
  final String description;
  final List<QuestObjective> objectives;
  final List<String> prerequisites; // Quest IDs
  final QuestReward reward;
  QuestStatus status = QuestStatus.locked;

  bool get canStart => status == QuestStatus.available;
  bool get isComplete => objectives.every((o) => o.isComplete);
}

class QuestReward {
  final int gold;
  final int exp;
  final List<String> itemIds;
}
```

## Quest Manager

```dart
class QuestManager extends Component {
  final Map<String, Quest> _quests = {};
  final List<Quest> _activeQuests = [];

  void loadQuests(List<Quest> quests) {
    for (final quest in quests) {
      _quests[quest.id] = quest;
    }
    _updateAvailability();
  }

  void startQuest(String questId) {
    final quest = _quests[questId];
    if (quest != null && quest.canStart) {
      quest.status = QuestStatus.active;
      _activeQuests.add(quest);
      onQuestStarted?.call(quest);
    }
  }

  void updateProgress(ObjectiveType type, String targetId, int amount) {
    for (final quest in _activeQuests) {
      for (final obj in quest.objectives) {
        if (obj.type == type && _matchesTarget(obj, targetId)) {
          obj.currentAmount += amount;
          onObjectiveProgress?.call(quest, obj);

          if (quest.isComplete) {
            _completeQuest(quest);
          }
        }
      }
    }
  }

  void _completeQuest(Quest quest) {
    quest.status = QuestStatus.completed;
    _activeQuests.remove(quest);
    _grantReward(quest.reward);
    onQuestCompleted?.call(quest);
    _updateAvailability();
  }

  void _updateAvailability() {
    for (final quest in _quests.values) {
      if (quest.status == QuestStatus.locked) {
        final prereqsMet = quest.prerequisites.every(
          (id) => _quests[id]?.status == QuestStatus.completed,
        );
        if (prereqsMet) {
          quest.status = QuestStatus.available;
        }
      }
    }
  }

  // Callbacks
  void Function(Quest)? onQuestStarted;
  void Function(Quest)? onQuestCompleted;
  void Function(Quest, QuestObjective)? onObjectiveProgress;
}
```

## JSON Data Format

```json
{
  "quests": [
    {
      "id": "main_001",
      "title": "The Beginning",
      "description": "Talk to the village elder",
      "prerequisites": [],
      "objectives": [
        {
          "type": "talk",
          "targetId": "npc_elder",
          "description": "Talk to Elder",
          "required": 1
        }
      ],
      "reward": { "gold": 100, "exp": 50, "items": ["sword_001"] }
    },
    {
      "id": "main_002",
      "title": "Pest Control",
      "description": "Clear the rats from the cellar",
      "prerequisites": ["main_001"],
      "objectives": [
        {
          "type": "kill",
          "targetId": "enemy_rat",
          "description": "Kill Rats",
          "required": 5
        }
      ],
      "reward": { "gold": 200, "exp": 100, "items": [] }
    }
  ]
}
```

## Integration with Game

```dart
// When enemy dies
void onEnemyKilled(Enemy enemy) {
  questManager.updateProgress(
    ObjectiveType.kill,
    enemy.typeId,
    1,
  );
}

// When item collected
void onItemCollected(Item item) {
  questManager.updateProgress(
    ObjectiveType.collect,
    item.id,
    item.quantity,
  );
}

// When talking to NPC
void onNpcTalk(Npc npc) {
  questManager.updateProgress(
    ObjectiveType.talk,
    npc.id,
    1,
  );
}
```

## Quest UI Component

```dart
class QuestTracker extends PositionComponent with HasGameRef {
  final QuestManager questManager;

  @override
  void render(Canvas canvas) {
    double y = 0;
    for (final quest in questManager.activeQuests) {
      _drawText(canvas, quest.title, Vector2(0, y), bold: true);
      y += 20;
      for (final obj in quest.objectives) {
        final status = '${obj.currentAmount}/${obj.requiredAmount}';
        _drawText(canvas, '  ${obj.description} $status', Vector2(0, y));
        y += 16;
      }
      y += 10;
    }
  }
}
```
