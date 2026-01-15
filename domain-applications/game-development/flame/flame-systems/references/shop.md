# Shop System Reference

## Data Structure

```dart
enum CurrencyType { gold, gems, tokens }

class ShopItem {
  final String itemId;
  final int price;
  final CurrencyType currency;
  final int stock;        // -1 for unlimited
  final int? requiredLevel;
  final String? requiredQuestId;

  int currentStock;

  bool get isAvailable => currentStock != 0;
}

class Shop {
  final String id;
  final String name;
  final String? npcId;
  final List<ShopItem> items;
  final double buybackRate;  // Sell price multiplier (e.g., 0.5)
}

class Wallet {
  final Map<CurrencyType, int> _currencies = {
    CurrencyType.gold: 0,
    CurrencyType.gems: 0,
    CurrencyType.tokens: 0,
  };

  int get(CurrencyType type) => _currencies[type] ?? 0;

  bool canAfford(CurrencyType type, int amount) => get(type) >= amount;

  void add(CurrencyType type, int amount) {
    _currencies[type] = (_currencies[type] ?? 0) + amount;
  }

  bool spend(CurrencyType type, int amount) {
    if (!canAfford(type, amount)) return false;
    _currencies[type] = _currencies[type]! - amount;
    return true;
  }
}
```

## Shop Manager

```dart
class ShopManager extends Component {
  final Map<String, Shop> _shops = {};
  final InventoryManager inventory;
  final Wallet wallet;

  void loadShops(List<Shop> shops) {
    for (final shop in shops) {
      _shops[shop.id] = shop;
    }
  }

  Shop? getShop(String shopId) => _shops[shopId];

  BuyResult buyItem(String shopId, String itemId, int quantity) {
    final shop = _shops[shopId];
    if (shop == null) return BuyResult.shopNotFound;

    final shopItem = shop.items.firstWhere(
      (i) => i.itemId == itemId,
      orElse: () => null,
    );
    if (shopItem == null) return BuyResult.itemNotFound;

    // Check stock
    if (shopItem.stock != -1 && shopItem.currentStock < quantity) {
      return BuyResult.outOfStock;
    }

    // Check requirements
    if (shopItem.requiredLevel != null && player.level < shopItem.requiredLevel!) {
      return BuyResult.levelRequired;
    }

    // Check price
    final totalPrice = shopItem.price * quantity;
    if (!wallet.canAfford(shopItem.currency, totalPrice)) {
      return BuyResult.insufficientFunds;
    }

    // Check inventory space
    final item = ItemDatabase.get(itemId);
    if (item == null) return BuyResult.itemNotFound;

    // Execute purchase
    wallet.spend(shopItem.currency, totalPrice);
    inventory.addItem(item, quantity);

    if (shopItem.stock != -1) {
      shopItem.currentStock -= quantity;
    }

    onItemPurchased?.call(shop, item, quantity, totalPrice);
    return BuyResult.success;
  }

  SellResult sellItem(String shopId, String itemId, int quantity) {
    final shop = _shops[shopId];
    if (shop == null) return SellResult.shopNotFound;

    // Check inventory
    if (!inventory.hasItem(itemId, quantity)) {
      return SellResult.notEnoughItems;
    }

    final item = ItemDatabase.get(itemId)!;

    // Calculate sell price
    final sellPrice = (item.sellPrice * quantity * shop.buybackRate).round();

    // Execute sale
    inventory.removeItem(itemId, quantity);
    wallet.add(CurrencyType.gold, sellPrice);

    onItemSold?.call(shop, item, quantity, sellPrice);
    return SellResult.success;
  }

  void Function(Shop, ItemData, int, int)? onItemPurchased;
  void Function(Shop, ItemData, int, int)? onItemSold;
}

enum BuyResult { success, shopNotFound, itemNotFound, outOfStock, insufficientFunds, levelRequired }
enum SellResult { success, shopNotFound, notEnoughItems }
```

## JSON Data Format

```json
{
  "shops": [
    {
      "id": "shop_blacksmith",
      "name": "Blacksmith",
      "npcId": "npc_blacksmith",
      "buybackRate": 0.5,
      "items": [
        { "itemId": "sword_iron", "price": 100, "currency": "gold", "stock": -1 },
        { "itemId": "sword_steel", "price": 300, "currency": "gold", "stock": 5 },
        { "itemId": "armor_iron", "price": 200, "currency": "gold", "stock": -1 },
        { "itemId": "sword_legendary", "price": 1000, "currency": "gold", "stock": 1, "requiredLevel": 20 }
      ]
    },
    {
      "id": "shop_potion",
      "name": "Potion Shop",
      "npcId": "npc_alchemist",
      "buybackRate": 0.3,
      "items": [
        { "itemId": "potion_health", "price": 50, "currency": "gold", "stock": -1 },
        { "itemId": "potion_mana", "price": 50, "currency": "gold", "stock": -1 },
        { "itemId": "potion_rare", "price": 10, "currency": "gems", "stock": 3 }
      ]
    }
  ]
}
```

## Shop UI

```dart
class ShopUI extends PositionComponent with TapCallbacks {
  final ShopManager shopManager;
  final String shopId;
  late Shop shop;

  String selectedItemId = '';
  int quantity = 1;
  bool isBuyMode = true;

  @override
  Future<void> onLoad() async {
    shop = shopManager.getShop(shopId)!;
  }

  @override
  void render(Canvas canvas) {
    // Header
    _drawText(canvas, shop.name, Vector2(10, 10), size: 24);

    // Mode tabs
    _drawTab(canvas, 'Buy', Vector2(10, 50), isBuyMode);
    _drawTab(canvas, 'Sell', Vector2(100, 50), !isBuyMode);

    // Item list
    final items = isBuyMode ? _getShopItems() : _getInventoryItems();
    double y = 100;
    for (final item in items) {
      _drawItemRow(canvas, item, Vector2(10, y), item.id == selectedItemId);
      y += 60;
    }

    // Selected item details
    if (selectedItemId.isNotEmpty) {
      _drawItemDetails(canvas, Vector2(size.x - 250, 100));
    }

    // Player gold
    _drawText(
      canvas,
      'Gold: ${shopManager.wallet.get(CurrencyType.gold)}',
      Vector2(size.x - 150, 10),
    );
  }

  void _drawItemRow(Canvas canvas, ItemData item, Vector2 pos, bool selected) {
    final bg = selected ? Colors.blue.withOpacity(0.3) : Colors.grey.withOpacity(0.2);
    canvas.drawRect(Rect.fromLTWH(pos.x, pos.y, 300, 50), Paint()..color = bg);

    // Icon, name, price
    _drawText(canvas, item.name, pos + Vector2(60, 10));

    if (isBuyMode) {
      final shopItem = shop.items.firstWhere((i) => i.itemId == item.id);
      _drawText(canvas, '${shopItem.price} G', pos + Vector2(60, 30), size: 12);
      if (shopItem.stock != -1) {
        _drawText(canvas, 'Stock: ${shopItem.currentStock}', pos + Vector2(200, 30), size: 12);
      }
    } else {
      _drawText(canvas, 'Sell: ${(item.sellPrice * shop.buybackRate).round()} G', pos + Vector2(60, 30), size: 12);
    }
  }

  void _drawItemDetails(Canvas canvas, Vector2 pos) {
    final item = ItemDatabase.get(selectedItemId)!;

    // Item info panel
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(pos.x, pos.y, 230, 300), Radius.circular(8)),
      Paint()..color = Colors.black.withOpacity(0.8),
    );

    _drawText(canvas, item.name, pos + Vector2(10, 10), size: 18);
    _drawText(canvas, item.description, pos + Vector2(10, 40), size: 12);

    // Quantity selector
    _drawText(canvas, 'Qty: $quantity', pos + Vector2(10, 200));

    // Buy/Sell button
    final buttonText = isBuyMode ? 'Buy' : 'Sell';
    _drawButton(canvas, buttonText, pos + Vector2(10, 250));
  }

  @override
  void onTapDown(TapDownEvent event) {
    // Handle item selection, quantity change, buy/sell button
  }
}
```

## Daily/Rotating Shop

```dart
class DailyShop {
  final String id;
  final List<String> possibleItems;
  final int displayCount;
  DateTime lastRefresh = DateTime(2000);

  List<ShopItem> currentItems = [];

  void refresh() {
    if (_shouldRefresh()) {
      currentItems = _generateDailyItems();
      lastRefresh = DateTime.now();
    }
  }

  bool _shouldRefresh() {
    final now = DateTime.now();
    final lastMidnight = DateTime(now.year, now.month, now.day);
    return lastRefresh.isBefore(lastMidnight);
  }

  List<ShopItem> _generateDailyItems() {
    final shuffled = List<String>.from(possibleItems)..shuffle();
    return shuffled.take(displayCount).map((id) => ShopItem(
      itemId: id,
      price: ItemDatabase.get(id)!.buyPrice,
      currency: CurrencyType.gold,
      stock: 1,
    )).toList();
  }
}
```

## Discount System

```dart
class DiscountManager {
  final Map<String, double> _itemDiscounts = {};
  final Map<String, double> _categoryDiscounts = {};
  double globalDiscount = 0;

  double getDiscount(ItemData item) {
    // Check specific item discount
    if (_itemDiscounts.containsKey(item.id)) {
      return _itemDiscounts[item.id]!;
    }

    // Check category discount
    if (_categoryDiscounts.containsKey(item.type.name)) {
      return _categoryDiscounts[item.type.name]!;
    }

    return globalDiscount;
  }

  int applyDiscount(int originalPrice, ItemData item) {
    final discount = getDiscount(item);
    return (originalPrice * (1 - discount)).round();
  }

  void setItemDiscount(String itemId, double discount) {
    _itemDiscounts[itemId] = discount.clamp(0, 1);
  }

  void setSaleEvent(double discount, Duration duration) {
    globalDiscount = discount;
    Future.delayed(duration, () => globalDiscount = 0);
  }
}
```
