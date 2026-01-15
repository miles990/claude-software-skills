# Inventory System Reference

## Data Structure

```dart
enum ItemType { weapon, armor, consumable, material, quest, misc }
enum ItemRarity { common, uncommon, rare, epic, legendary }

class ItemData {
  final String id;
  final String name;
  final String description;
  final ItemType type;
  final ItemRarity rarity;
  final String iconPath;
  final int maxStack;
  final int buyPrice;
  final int sellPrice;
  final Map<String, dynamic> stats;  // For equipment
  final Map<String, dynamic> effects; // For consumables

  bool get isStackable => maxStack > 1;
}

class InventorySlot {
  ItemData? item;
  int quantity = 0;

  bool get isEmpty => item == null;
  bool get isFull => quantity >= (item?.maxStack ?? 0);

  bool canAdd(ItemData newItem, int amount) {
    if (isEmpty) return true;
    if (item!.id != newItem.id) return false;
    return quantity + amount <= item!.maxStack;
  }
}
```

## Inventory Manager

```dart
class InventoryManager extends Component {
  final int slotCount;
  late List<InventorySlot> slots;
  int gold = 0;

  InventoryManager({this.slotCount = 20}) {
    slots = List.generate(slotCount, (_) => InventorySlot());
  }

  bool addItem(ItemData item, [int amount = 1]) {
    // Try to stack with existing
    if (item.isStackable) {
      for (final slot in slots) {
        if (slot.item?.id == item.id && !slot.isFull) {
          final canFit = item.maxStack - slot.quantity;
          final toAdd = amount.clamp(0, canFit);
          slot.quantity += toAdd;
          amount -= toAdd;
          if (amount <= 0) {
            onItemAdded?.call(item, toAdd);
            return true;
          }
        }
      }
    }

    // Find empty slot
    for (final slot in slots) {
      if (slot.isEmpty) {
        slot.item = item;
        slot.quantity = amount.clamp(1, item.maxStack);
        onItemAdded?.call(item, slot.quantity);
        return true;
      }
    }

    onInventoryFull?.call(item);
    return false;
  }

  bool removeItem(String itemId, [int amount = 1]) {
    for (final slot in slots) {
      if (slot.item?.id == itemId) {
        if (slot.quantity >= amount) {
          slot.quantity -= amount;
          if (slot.quantity <= 0) {
            slot.item = null;
          }
          onItemRemoved?.call(itemId, amount);
          return true;
        }
      }
    }
    return false;
  }

  int getItemCount(String itemId) {
    return slots
        .where((s) => s.item?.id == itemId)
        .fold(0, (sum, s) => sum + s.quantity);
  }

  bool hasItem(String itemId, [int amount = 1]) {
    return getItemCount(itemId) >= amount;
  }

  void swapSlots(int fromIndex, int toIndex) {
    final temp = slots[fromIndex];
    slots[fromIndex] = slots[toIndex];
    slots[toIndex] = temp;
    onSlotsSwapped?.call(fromIndex, toIndex);
  }

  // Callbacks
  void Function(ItemData, int)? onItemAdded;
  void Function(String, int)? onItemRemoved;
  void Function(ItemData)? onInventoryFull;
  void Function(int, int)? onSlotsSwapped;
}
```

## Item Database

```dart
class ItemDatabase {
  static final Map<String, ItemData> _items = {};

  static void loadFromJson(String json) {
    final data = jsonDecode(json) as Map<String, dynamic>;
    for (final entry in data['items']) {
      final item = ItemData.fromJson(entry);
      _items[item.id] = item;
    }
  }

  static ItemData? get(String id) => _items[id];
  static List<ItemData> getByType(ItemType type) =>
      _items.values.where((i) => i.type == type).toList();
}
```

## JSON Data Format

```json
{
  "items": [
    {
      "id": "potion_health",
      "name": "Health Potion",
      "description": "Restores 50 HP",
      "type": "consumable",
      "rarity": "common",
      "iconPath": "items/potion_red.png",
      "maxStack": 99,
      "buyPrice": 50,
      "sellPrice": 25,
      "effects": { "heal": 50 }
    },
    {
      "id": "sword_iron",
      "name": "Iron Sword",
      "description": "A basic iron sword",
      "type": "weapon",
      "rarity": "common",
      "iconPath": "items/sword_iron.png",
      "maxStack": 1,
      "buyPrice": 100,
      "sellPrice": 50,
      "stats": { "attack": 10 }
    }
  ]
}
```

## Inventory UI

```dart
class InventoryUI extends PositionComponent with DragCallbacks {
  final InventoryManager inventory;
  final int columns = 5;
  final double slotSize = 64;
  final double padding = 4;

  int? _dragFromIndex;

  @override
  void render(Canvas canvas) {
    for (int i = 0; i < inventory.slots.length; i++) {
      final slot = inventory.slots[i];
      final pos = _getSlotPosition(i);

      // Slot background
      final color = slot.isEmpty ? Colors.grey : _getRarityColor(slot.item!.rarity);
      canvas.drawRect(
        Rect.fromLTWH(pos.x, pos.y, slotSize, slotSize),
        Paint()..color = color.withOpacity(0.5),
      );

      // Item icon & quantity
      if (!slot.isEmpty) {
        // Draw icon (sprite)
        // Draw quantity
        if (slot.quantity > 1) {
          _drawText(canvas, '${slot.quantity}', pos + Vector2(slotSize - 16, slotSize - 16));
        }
      }
    }
  }

  Vector2 _getSlotPosition(int index) {
    final x = (index % columns) * (slotSize + padding);
    final y = (index ~/ columns) * (slotSize + padding);
    return Vector2(x, y);
  }

  int? _getSlotAtPosition(Vector2 pos) {
    final col = (pos.x / (slotSize + padding)).floor();
    final row = (pos.y / (slotSize + padding)).floor();
    final index = row * columns + col;
    return (index >= 0 && index < inventory.slots.length) ? index : null;
  }

  @override
  void onDragStart(DragStartEvent event) {
    _dragFromIndex = _getSlotAtPosition(event.localPosition);
  }

  @override
  void onDragEnd(DragEndEvent event) {
    if (_dragFromIndex != null) {
      final toIndex = _getSlotAtPosition(event.localEndPosition);
      if (toIndex != null && toIndex != _dragFromIndex) {
        inventory.swapSlots(_dragFromIndex!, toIndex);
      }
    }
    _dragFromIndex = null;
  }

  Color _getRarityColor(ItemRarity rarity) {
    return switch (rarity) {
      ItemRarity.common => Colors.grey,
      ItemRarity.uncommon => Colors.green,
      ItemRarity.rare => Colors.blue,
      ItemRarity.epic => Colors.purple,
      ItemRarity.legendary => Colors.orange,
    };
  }
}
```
