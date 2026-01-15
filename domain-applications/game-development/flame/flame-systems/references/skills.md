# Skills System Reference

## Data Structure

```dart
enum SkillType { active, passive }
enum TargetType { self, singleEnemy, allEnemies, singleAlly, allAllies, area }
enum EffectType { damage, heal, buff, debuff, summon, special }

class SkillData {
  final String id;
  final String name;
  final String description;
  final String iconPath;
  final SkillType type;
  final TargetType targetType;
  final int mpCost;
  final double cooldown;
  final int requiredLevel;
  final List<String> prerequisites;  // Required skill IDs
  final List<SkillEffect> effects;
}

class SkillEffect {
  final EffectType type;
  final int value;
  final double duration;  // For buffs/debuffs
  final String? statusId; // Status effect to apply
}

class LearnedSkill {
  final SkillData data;
  int level = 1;
  double currentCooldown = 0;

  bool get isReady => currentCooldown <= 0;
  int get effectiveValue => (data.effects.first.value * (1 + level * 0.1)).round();
}
```

## Skills Manager

```dart
class SkillsManager extends Component {
  final Map<String, LearnedSkill> _learnedSkills = {};
  int skillPoints = 0;

  List<LearnedSkill> get activeSkills =>
      _learnedSkills.values.where((s) => s.data.type == SkillType.active).toList();

  List<LearnedSkill> get passiveSkills =>
      _learnedSkills.values.where((s) => s.data.type == SkillType.passive).toList();

  bool canLearn(SkillData skill) {
    if (_learnedSkills.containsKey(skill.id)) return false;
    if (skillPoints <= 0) return false;

    // Check prerequisites
    for (final prereqId in skill.prerequisites) {
      if (!_learnedSkills.containsKey(prereqId)) return false;
    }

    return true;
  }

  void learnSkill(SkillData skill) {
    if (!canLearn(skill)) return;

    _learnedSkills[skill.id] = LearnedSkill(data: skill);
    skillPoints--;
    onSkillLearned?.call(skill);
  }

  void upgradeSkill(String skillId) {
    final skill = _learnedSkills[skillId];
    if (skill == null || skillPoints <= 0) return;

    skill.level++;
    skillPoints--;
    onSkillUpgraded?.call(skill);
  }

  bool useSkill(String skillId, CombatEntity caster, List<CombatEntity> targets) {
    final skill = _learnedSkills[skillId];
    if (skill == null || !skill.isReady) return false;

    final casterStats = caster.stats;
    if (casterStats.mp < skill.data.mpCost) return false;

    // Consume MP
    casterStats.mp -= skill.data.mpCost;

    // Apply effects
    for (final effect in skill.data.effects) {
      _applyEffect(effect, skill.effectiveValue, caster, targets);
    }

    // Start cooldown
    skill.currentCooldown = skill.data.cooldown;

    onSkillUsed?.call(skill, targets);
    return true;
  }

  void _applyEffect(
    SkillEffect effect,
    int value,
    CombatEntity caster,
    List<CombatEntity> targets,
  ) {
    switch (effect.type) {
      case EffectType.damage:
        for (final target in targets) {
          final result = DamageResult(
            damage: value,
            isCrit: false,
            isMiss: false,
            type: DamageType.magical,
          );
          target.takeDamage(result);
        }
        break;

      case EffectType.heal:
        for (final target in targets) {
          target.heal(value);
        }
        break;

      case EffectType.buff:
        for (final target in targets) {
          target.addStatusEffect(StatusEffect(
            id: effect.statusId!,
            duration: effect.duration,
            value: value,
          ));
        }
        break;

      case EffectType.debuff:
        for (final target in targets) {
          target.addStatusEffect(StatusEffect(
            id: effect.statusId!,
            duration: effect.duration,
            value: -value,
            isDebuff: true,
          ));
        }
        break;
    }
  }

  @override
  void update(double dt) {
    // Update cooldowns
    for (final skill in _learnedSkills.values) {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown -= dt;
      }
    }
  }

  void Function(SkillData)? onSkillLearned;
  void Function(LearnedSkill)? onSkillUpgraded;
  void Function(LearnedSkill, List<CombatEntity>)? onSkillUsed;
}
```

## Skill Tree

```dart
class SkillTree {
  final String id;
  final String name;
  final List<SkillTreeNode> nodes;
}

class SkillTreeNode {
  final SkillData skill;
  final Vector2 position;    // UI position
  final List<String> connections;  // Connected skill IDs
}

class SkillTreeUI extends PositionComponent with TapCallbacks {
  final SkillTree tree;
  final SkillsManager manager;

  @override
  void render(Canvas canvas) {
    // Draw connections first
    for (final node in tree.nodes) {
      for (final connId in node.connections) {
        final connNode = tree.nodes.firstWhere((n) => n.skill.id == connId);
        _drawConnection(canvas, node.position, connNode.position);
      }
    }

    // Draw skill nodes
    for (final node in tree.nodes) {
      final isLearned = manager._learnedSkills.containsKey(node.skill.id);
      final canLearn = manager.canLearn(node.skill);

      Color color;
      if (isLearned) {
        color = Colors.green;
      } else if (canLearn) {
        color = Colors.yellow;
      } else {
        color = Colors.grey;
      }

      _drawSkillNode(canvas, node, color);
    }
  }

  void _drawConnection(Canvas canvas, Vector2 from, Vector2 to) {
    canvas.drawLine(
      Offset(from.x, from.y),
      Offset(to.x, to.y),
      Paint()
        ..color = Colors.white.withOpacity(0.5)
        ..strokeWidth = 2,
    );
  }

  void _drawSkillNode(Canvas canvas, SkillTreeNode node, Color color) {
    canvas.drawCircle(
      Offset(node.position.x, node.position.y),
      30,
      Paint()..color = color,
    );
    // Draw skill icon inside
  }

  @override
  void onTapDown(TapDownEvent event) {
    for (final node in tree.nodes) {
      if ((event.localPosition - node.position).length < 30) {
        if (manager.canLearn(node.skill)) {
          manager.learnSkill(node.skill);
        }
        break;
      }
    }
  }
}
```

## JSON Data Format

```json
{
  "skills": [
    {
      "id": "fireball",
      "name": "Fireball",
      "description": "Launch a ball of fire at the enemy",
      "iconPath": "skills/fireball.png",
      "type": "active",
      "targetType": "singleEnemy",
      "mpCost": 10,
      "cooldown": 3.0,
      "requiredLevel": 1,
      "prerequisites": [],
      "effects": [
        { "type": "damage", "value": 50 }
      ]
    },
    {
      "id": "heal",
      "name": "Heal",
      "description": "Restore HP to an ally",
      "iconPath": "skills/heal.png",
      "type": "active",
      "targetType": "singleAlly",
      "mpCost": 15,
      "cooldown": 5.0,
      "requiredLevel": 3,
      "prerequisites": [],
      "effects": [
        { "type": "heal", "value": 100 }
      ]
    },
    {
      "id": "attack_up",
      "name": "Power Boost",
      "description": "Increase attack power for 30 seconds",
      "iconPath": "skills/attack_up.png",
      "type": "active",
      "targetType": "self",
      "mpCost": 20,
      "cooldown": 60.0,
      "requiredLevel": 5,
      "prerequisites": ["fireball"],
      "effects": [
        { "type": "buff", "value": 20, "duration": 30.0, "statusId": "attack_buff" }
      ]
    }
  ],
  "skillTrees": [
    {
      "id": "mage",
      "name": "Mage",
      "nodes": [
        { "skillId": "fireball", "position": [100, 100], "connections": ["attack_up"] },
        { "skillId": "attack_up", "position": [100, 200], "connections": [] },
        { "skillId": "heal", "position": [200, 100], "connections": [] }
      ]
    }
  ]
}
```

## Skill Hotbar UI

```dart
class SkillHotbar extends PositionComponent with HasGameRef {
  final SkillsManager manager;
  final int slotCount = 4;

  @override
  void render(Canvas canvas) {
    final skills = manager.activeSkills.take(slotCount).toList();

    for (int i = 0; i < slotCount; i++) {
      final x = i * 70.0;

      // Slot background
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(x, 0, 64, 64), Radius.circular(8)),
        Paint()..color = Colors.black.withOpacity(0.7),
      );

      if (i < skills.length) {
        final skill = skills[i];

        // Skill icon
        // ...

        // Cooldown overlay
        if (!skill.isReady) {
          final progress = skill.currentCooldown / skill.data.cooldown;
          canvas.drawRect(
            Rect.fromLTWH(x, 0, 64, 64 * progress),
            Paint()..color = Colors.black.withOpacity(0.6),
          );

          // Cooldown text
          _drawText(canvas, '${skill.currentCooldown.ceil()}', Vector2(x + 32, 32));
        }

        // Hotkey number
        _drawText(canvas, '${i + 1}', Vector2(x + 4, 4), size: 12);
      }
    }
  }
}
```
