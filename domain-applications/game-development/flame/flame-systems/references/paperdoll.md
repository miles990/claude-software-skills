# Paper Doll System Reference

## Data Structure

```dart
enum EquipSlot { head, body, legs, feet, mainHand, offHand, accessory }

class EquipmentData {
  final String id;
  final EquipSlot slot;
  final String spritePath;      // Visual sprite
  final Vector2 spriteOffset;   // Position offset on character
  final Map<String, int> stats;
}

class PaperDollState {
  final Map<EquipSlot, EquipmentData?> equipped = {};

  EquipmentData? getEquipped(EquipSlot slot) => equipped[slot];

  void equip(EquipmentData equipment) {
    equipped[equipment.slot] = equipment;
  }

  void unequip(EquipSlot slot) {
    equipped[slot] = null;
  }
}
```

## Paper Doll Component

```dart
class PaperDollComponent extends PositionComponent with HasGameRef {
  final PaperDollState state;

  // Base character sprite
  late SpriteComponent baseBody;

  // Equipment layers (rendered in order)
  final Map<EquipSlot, SpriteComponent> equipmentSprites = {};

  // Layer order (bottom to top)
  static const renderOrder = [
    EquipSlot.body,
    EquipSlot.legs,
    EquipSlot.feet,
    EquipSlot.mainHand,
    EquipSlot.offHand,
    EquipSlot.head,
    EquipSlot.accessory,
  ];

  @override
  Future<void> onLoad() async {
    // Base body sprite
    baseBody = SpriteComponent(
      sprite: await game.loadSprite('character/base.png'),
      size: Vector2(64, 64),
    );
    add(baseBody);

    // Initial equipment
    await _refreshEquipment();
  }

  Future<void> _refreshEquipment() async {
    // Remove old sprites
    for (final sprite in equipmentSprites.values) {
      sprite.removeFromParent();
    }
    equipmentSprites.clear();

    // Add equipped items in order
    int priority = 1;
    for (final slot in renderOrder) {
      final equipment = state.getEquipped(slot);
      if (equipment != null) {
        final sprite = SpriteComponent(
          sprite: await game.loadSprite(equipment.spritePath),
          position: equipment.spriteOffset,
          size: Vector2(64, 64),
          priority: priority++,
        );
        equipmentSprites[slot] = sprite;
        add(sprite);
      }
    }
  }

  Future<void> onEquipmentChanged() async {
    await _refreshEquipment();
  }
}
```

## Animated Paper Doll

```dart
class AnimatedPaperDoll extends PositionComponent with HasGameRef {
  final PaperDollState state;
  String currentAnimation = 'idle';

  // Animation data per equipment
  late Map<EquipSlot, SpriteAnimationComponent> animatedParts;

  @override
  Future<void> onLoad() async {
    await _loadAnimations();
  }

  Future<void> _loadAnimations() async {
    // Base body animation
    final baseAnim = await _loadPartAnimation('base', currentAnimation);
    add(baseAnim..priority = 0);

    // Equipment animations
    int priority = 1;
    for (final slot in PaperDollComponent.renderOrder) {
      final equipment = state.getEquipped(slot);
      if (equipment != null) {
        final anim = await _loadPartAnimation(
          equipment.id,
          currentAnimation,
        );
        anim.priority = priority++;
        animatedParts[slot] = anim;
        add(anim);
      }
    }
  }

  Future<SpriteAnimationComponent> _loadPartAnimation(
    String partId,
    String animName,
  ) async {
    // Load sprite sheet: character/{partId}_{animName}.png
    return SpriteAnimationComponent(
      animation: await game.loadSpriteAnimation(
        'character/${partId}_$animName.png',
        SpriteAnimationData.sequenced(
          amount: 4,
          stepTime: 0.15,
          textureSize: Vector2(64, 64),
        ),
      ),
      size: Vector2(64, 64),
    );
  }

  void playAnimation(String name) {
    if (currentAnimation == name) return;
    currentAnimation = name;
    // Reload all animations
    removeAll(children);
    _loadAnimations();
  }
}
```

## Equipment Stats Integration

```dart
class CharacterStats {
  final PaperDollState paperDoll;

  int get totalAttack => _baseAttack + _equipmentBonus('attack');
  int get totalDefense => _baseDefense + _equipmentBonus('defense');
  int get totalSpeed => _baseSpeed + _equipmentBonus('speed');

  int _equipmentBonus(String stat) {
    int bonus = 0;
    for (final equipment in paperDoll.equipped.values) {
      if (equipment != null) {
        bonus += equipment.stats[stat] ?? 0;
      }
    }
    return bonus;
  }
}
```

## Equipment Preview UI

```dart
class EquipmentPreview extends PositionComponent {
  final PaperDollState currentState;
  final EquipmentData? previewItem;

  @override
  void render(Canvas canvas) {
    // Show current vs preview stats
    final currentStats = _calculateStats(currentState);
    final previewStats = _calculateStatsWithItem(currentState, previewItem);

    double y = 0;
    for (final stat in ['attack', 'defense', 'speed']) {
      final current = currentStats[stat] ?? 0;
      final preview = previewStats[stat] ?? 0;
      final diff = preview - current;

      final color = diff > 0 ? Colors.green : (diff < 0 ? Colors.red : Colors.white);
      final diffText = diff > 0 ? '+$diff' : (diff < 0 ? '$diff' : '');

      _drawText(canvas, '$stat: $current → $preview $diffText', Vector2(0, y), color);
      y += 20;
    }
  }
}
```

## JSON Data Format

```json
{
  "equipment": [
    {
      "id": "helmet_iron",
      "name": "Iron Helmet",
      "slot": "head",
      "spritePath": "equipment/helmet_iron.png",
      "spriteOffset": [0, -8],
      "stats": { "defense": 5 }
    },
    {
      "id": "armor_leather",
      "name": "Leather Armor",
      "slot": "body",
      "spritePath": "equipment/armor_leather.png",
      "spriteOffset": [0, 0],
      "stats": { "defense": 10, "speed": -1 }
    },
    {
      "id": "sword_steel",
      "name": "Steel Sword",
      "slot": "mainHand",
      "spritePath": "equipment/sword_steel.png",
      "spriteOffset": [16, 0],
      "stats": { "attack": 15 }
    }
  ]
}
```

## Equipment Slot UI

```dart
class EquipmentSlotUI extends PositionComponent with TapCallbacks {
  final EquipSlot slot;
  final PaperDollState state;
  final InventoryManager inventory;

  @override
  void render(Canvas canvas) {
    // Draw slot background with icon
    final equipped = state.getEquipped(slot);

    canvas.drawRect(
      Rect.fromLTWH(0, 0, 64, 64),
      Paint()..color = Colors.grey.withOpacity(0.5),
    );

    if (equipped != null) {
      // Draw equipment icon
    } else {
      // Draw slot placeholder icon
      _drawSlotIcon(canvas, slot);
    }
  }

  @override
  void onTapDown(TapDownEvent event) {
    final equipped = state.getEquipped(slot);
    if (equipped != null) {
      // Unequip and add to inventory
      state.unequip(slot);
      inventory.addItem(ItemDatabase.get(equipped.id)!);
    } else {
      // Open inventory to select equipment
      openEquipmentSelector?.call(slot);
    }
  }

  void Function(EquipSlot)? openEquipmentSelector;
}
```
