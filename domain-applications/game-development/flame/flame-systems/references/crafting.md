# Crafting System Reference

## Data Structure

```dart
class Recipe {
  final String id;
  final String resultItemId;
  final int resultQuantity;
  final List<RecipeIngredient> ingredients;
  final int? requiredLevel;
  final String? requiredStation;  // Crafting station ID
  final double craftTime;         // Seconds
  final int exp;                  // Crafting exp gained
}

class RecipeIngredient {
  final String itemId;
  final int quantity;
}

class CraftingStation {
  final String id;
  final String name;
  final List<String> availableRecipes;
}
```

## Crafting Manager

```dart
class CraftingManager extends Component {
  final Map<String, Recipe> _recipes = {};
  final Map<String, CraftingStation> _stations = {};
  final InventoryManager inventory;

  List<String> _unlockedRecipes = [];
  Recipe? _currentCraft;
  double _craftProgress = 0;

  bool get isCrafting => _currentCraft != null;

  void loadRecipes(List<Recipe> recipes) {
    for (final recipe in recipes) {
      _recipes[recipe.id] = recipe;
    }
  }

  void loadStations(List<CraftingStation> stations) {
    for (final station in stations) {
      _stations[station.id] = station;
    }
  }

  void unlockRecipe(String recipeId) {
    if (!_unlockedRecipes.contains(recipeId)) {
      _unlockedRecipes.add(recipeId);
      onRecipeUnlocked?.call(_recipes[recipeId]!);
    }
  }

  List<Recipe> getAvailableRecipes([String? stationId]) {
    if (stationId != null) {
      final station = _stations[stationId];
      return station?.availableRecipes
          .map((id) => _recipes[id])
          .whereType<Recipe>()
          .where((r) => _unlockedRecipes.contains(r.id))
          .toList() ?? [];
    }
    return _recipes.values
        .where((r) => _unlockedRecipes.contains(r.id))
        .toList();
  }

  CraftResult canCraft(String recipeId) {
    final recipe = _recipes[recipeId];
    if (recipe == null) return CraftResult.recipeNotFound;

    if (!_unlockedRecipes.contains(recipeId)) {
      return CraftResult.recipeLocked;
    }

    // Check ingredients
    for (final ingredient in recipe.ingredients) {
      if (!inventory.hasItem(ingredient.itemId, ingredient.quantity)) {
        return CraftResult.missingIngredients;
      }
    }

    return CraftResult.canCraft;
  }

  void startCraft(String recipeId) {
    if (isCrafting) return;

    final result = canCraft(recipeId);
    if (result != CraftResult.canCraft) {
      onCraftFailed?.call(result);
      return;
    }

    final recipe = _recipes[recipeId]!;

    // Consume ingredients
    for (final ingredient in recipe.ingredients) {
      inventory.removeItem(ingredient.itemId, ingredient.quantity);
    }

    _currentCraft = recipe;
    _craftProgress = 0;
    onCraftStarted?.call(recipe);
  }

  void cancelCraft() {
    if (!isCrafting) return;

    // Return ingredients
    for (final ingredient in _currentCraft!.ingredients) {
      final item = ItemDatabase.get(ingredient.itemId);
      if (item != null) {
        inventory.addItem(item, ingredient.quantity);
      }
    }

    _currentCraft = null;
    _craftProgress = 0;
  }

  @override
  void update(double dt) {
    if (!isCrafting) return;

    _craftProgress += dt;

    if (_craftProgress >= _currentCraft!.craftTime) {
      _completeCraft();
    }
  }

  void _completeCraft() {
    final recipe = _currentCraft!;
    final resultItem = ItemDatabase.get(recipe.resultItemId);

    if (resultItem != null) {
      inventory.addItem(resultItem, recipe.resultQuantity);
    }

    onCraftCompleted?.call(recipe);
    _currentCraft = null;
    _craftProgress = 0;
  }

  double get craftProgress => isCrafting
      ? (_craftProgress / _currentCraft!.craftTime).clamp(0, 1)
      : 0;

  // Callbacks
  void Function(Recipe)? onRecipeUnlocked;
  void Function(Recipe)? onCraftStarted;
  void Function(Recipe)? onCraftCompleted;
  void Function(CraftResult)? onCraftFailed;
}

enum CraftResult { canCraft, recipeNotFound, recipeLocked, missingIngredients, alreadyCrafting }
```

## JSON Data Format

```json
{
  "recipes": [
    {
      "id": "recipe_health_potion",
      "resultItemId": "potion_health",
      "resultQuantity": 1,
      "ingredients": [
        { "itemId": "herb_red", "quantity": 2 },
        { "itemId": "bottle_empty", "quantity": 1 }
      ],
      "craftTime": 3.0,
      "exp": 10
    },
    {
      "id": "recipe_iron_sword",
      "resultItemId": "sword_iron",
      "resultQuantity": 1,
      "ingredients": [
        { "itemId": "iron_ingot", "quantity": 3 },
        { "itemId": "wood_handle", "quantity": 1 }
      ],
      "requiredStation": "station_forge",
      "craftTime": 10.0,
      "exp": 25
    }
  ],
  "stations": [
    {
      "id": "station_alchemy",
      "name": "Alchemy Table",
      "availableRecipes": ["recipe_health_potion", "recipe_mana_potion"]
    },
    {
      "id": "station_forge",
      "name": "Forge",
      "availableRecipes": ["recipe_iron_sword", "recipe_iron_armor"]
    }
  ]
}
```

## Crafting UI

```dart
class CraftingUI extends PositionComponent with TapCallbacks {
  final CraftingManager craftingManager;
  final String? stationId;

  String selectedRecipeId = '';

  @override
  void render(Canvas canvas) {
    // Recipe list
    final recipes = craftingManager.getAvailableRecipes(stationId);
    double y = 10;
    for (final recipe in recipes) {
      _drawRecipeRow(canvas, recipe, Vector2(10, y));
      y += 70;
    }

    // Selected recipe details
    if (selectedRecipeId.isNotEmpty) {
      _drawRecipeDetails(canvas, Vector2(size.x - 280, 10));
    }

    // Crafting progress
    if (craftingManager.isCrafting) {
      _drawCraftingProgress(canvas, Vector2(size.x / 2 - 100, size.y - 50));
    }
  }

  void _drawRecipeRow(Canvas canvas, Recipe recipe, Vector2 pos) {
    final canCraft = craftingManager.canCraft(recipe.id) == CraftResult.canCraft;
    final bg = canCraft ? Colors.green.withOpacity(0.2) : Colors.grey.withOpacity(0.2);

    canvas.drawRect(Rect.fromLTWH(pos.x, pos.y, 300, 60), Paint()..color = bg);

    final resultItem = ItemDatabase.get(recipe.resultItemId)!;
    _drawText(canvas, resultItem.name, pos + Vector2(70, 10));
    _drawText(canvas, 'x${recipe.resultQuantity}', pos + Vector2(70, 30), size: 12);

    // Ingredient icons (small)
    double x = 200;
    for (final ing in recipe.ingredients) {
      _drawIngredientIcon(canvas, ing, pos + Vector2(x, 20));
      x += 30;
    }
  }

  void _drawRecipeDetails(Canvas canvas, Vector2 pos) {
    final recipe = craftingManager._recipes[selectedRecipeId]!;
    final resultItem = ItemDatabase.get(recipe.resultItemId)!;

    // Panel background
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(pos.x, pos.y, 260, 350), Radius.circular(8)),
      Paint()..color = Colors.black.withOpacity(0.8),
    );

    // Result item
    _drawText(canvas, resultItem.name, pos + Vector2(10, 10), size: 18);
    _drawText(canvas, resultItem.description, pos + Vector2(10, 35), size: 11);

    // Ingredients
    _drawText(canvas, 'Materials:', pos + Vector2(10, 100), size: 14);
    double y = 120;
    for (final ing in recipe.ingredients) {
      final item = ItemDatabase.get(ing.itemId)!;
      final hasEnough = inventory.hasItem(ing.itemId, ing.quantity);
      final owned = inventory.getItemCount(ing.itemId);
      final color = hasEnough ? Colors.green : Colors.red;

      _drawText(
        canvas,
        '${item.name}: $owned/${ing.quantity}',
        pos + Vector2(10, y),
        size: 12,
        color: color,
      );
      y += 20;
    }

    // Craft time
    _drawText(canvas, 'Time: ${recipe.craftTime}s', pos + Vector2(10, 250), size: 12);

    // Craft button
    final canCraft = craftingManager.canCraft(selectedRecipeId) == CraftResult.canCraft;
    _drawButton(canvas, 'Craft', pos + Vector2(80, 290), enabled: canCraft);
  }

  void _drawCraftingProgress(Canvas canvas, Vector2 pos) {
    // Progress bar
    canvas.drawRect(
      Rect.fromLTWH(pos.x, pos.y, 200, 20),
      Paint()..color = Colors.grey,
    );
    canvas.drawRect(
      Rect.fromLTWH(pos.x, pos.y, 200 * craftingManager.craftProgress, 20),
      Paint()..color = Colors.green,
    );

    // Cancel button
    _drawButton(canvas, 'Cancel', pos + Vector2(210, 0));
  }
}
```

## Recipe Discovery

```dart
class RecipeDiscovery {
  final CraftingManager craftingManager;

  // Discover recipe by trying combinations
  Recipe? tryDiscover(List<String> itemIds) {
    for (final recipe in craftingManager._recipes.values) {
      if (_matchesIngredients(recipe, itemIds)) {
        if (!craftingManager._unlockedRecipes.contains(recipe.id)) {
          craftingManager.unlockRecipe(recipe.id);
          return recipe;
        }
      }
    }
    return null;
  }

  bool _matchesIngredients(Recipe recipe, List<String> itemIds) {
    final recipeItems = recipe.ingredients.map((i) => i.itemId).toSet();
    return recipeItems.containsAll(itemIds) && itemIds.toSet().containsAll(recipeItems);
  }
}
```

## Batch Crafting

```dart
extension BatchCrafting on CraftingManager {
  int getMaxCraftable(String recipeId) {
    final recipe = _recipes[recipeId];
    if (recipe == null) return 0;

    int maxAmount = 999;
    for (final ingredient in recipe.ingredients) {
      final available = inventory.getItemCount(ingredient.itemId);
      final possible = available ~/ ingredient.quantity;
      maxAmount = min(maxAmount, possible);
    }
    return maxAmount;
  }

  void craftMultiple(String recipeId, int count) {
    final max = getMaxCraftable(recipeId);
    final toCraft = min(count, max);

    for (int i = 0; i < toCraft; i++) {
      startCraft(recipeId);
      // In practice, queue these or process instantly
    }
  }
}
```
