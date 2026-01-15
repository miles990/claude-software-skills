# Level Editor System Reference

## Data Structure

```dart
class LevelData {
  final String id;
  final String name;
  final int width;
  final int height;
  final List<List<int>> tileGrid;
  final List<PlacedEntity> entities;
  final Map<String, dynamic> properties;
  DateTime lastModified;

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'width': width,
    'height': height,
    'tileGrid': tileGrid,
    'entities': entities.map((e) => e.toJson()).toList(),
    'properties': properties,
    'lastModified': lastModified.toIso8601String(),
  };
}

class PlacedEntity {
  final String id;
  final String typeId;
  final Vector2 position;
  final Map<String, dynamic> properties;

  PlacedEntity({
    required this.id,
    required this.typeId,
    required this.position,
    this.properties = const {},
  });
}

class TileDef {
  final int id;
  final String name;
  final String spritePath;
  final bool isSolid;
  final Map<String, dynamic> properties;
}

class EntityDef {
  final String typeId;
  final String name;
  final String category;
  final String iconPath;
  final Vector2 defaultSize;
  final List<PropertyDef> editableProperties;
}

class PropertyDef {
  final String name;
  final String type;  // 'int', 'double', 'string', 'bool', 'vector2'
  final dynamic defaultValue;
}
```

## Level Editor

```dart
class LevelEditor extends Component with HasGameRef, DragCallbacks, TapCallbacks {
  LevelData? currentLevel;

  // Editor state
  EditorTool currentTool = EditorTool.paint;
  int selectedTileId = 0;
  String? selectedEntityType;
  PlacedEntity? selectedEntity;

  // View state
  Vector2 cameraOffset = Vector2.zero();
  double zoom = 1.0;

  // Undo/Redo
  final List<EditorAction> undoStack = [];
  final List<EditorAction> redoStack = [];

  void newLevel(int width, int height) {
    currentLevel = LevelData(
      id: 'level_${DateTime.now().millisecondsSinceEpoch}',
      name: 'New Level',
      width: width,
      height: height,
      tileGrid: List.generate(height, (_) => List.filled(width, 0)),
      entities: [],
      properties: {},
      lastModified: DateTime.now(),
    );
  }

  void loadLevel(LevelData level) {
    currentLevel = level;
    undoStack.clear();
    redoStack.clear();
  }

  Future<void> saveLevel() async {
    if (currentLevel == null) return;

    currentLevel!.lastModified = DateTime.now();
    final json = jsonEncode(currentLevel!.toJson());
    final file = File('levels/${currentLevel!.id}.json');
    await file.writeAsString(json);
  }

  // Tile operations
  void setTile(int x, int y, int tileId) {
    if (currentLevel == null) return;
    if (x < 0 || x >= currentLevel!.width) return;
    if (y < 0 || y >= currentLevel!.height) return;

    final oldTile = currentLevel!.tileGrid[y][x];
    if (oldTile == tileId) return;

    _recordAction(TileChangeAction(x, y, oldTile, tileId));
    currentLevel!.tileGrid[y][x] = tileId;
  }

  // Entity operations
  void placeEntity(String typeId, Vector2 position) {
    if (currentLevel == null) return;

    final entity = PlacedEntity(
      id: 'entity_${DateTime.now().millisecondsSinceEpoch}',
      typeId: typeId,
      position: position,
    );

    _recordAction(EntityAddAction(entity));
    currentLevel!.entities.add(entity);
  }

  void removeEntity(PlacedEntity entity) {
    _recordAction(EntityRemoveAction(entity));
    currentLevel!.entities.remove(entity);
  }

  void moveEntity(PlacedEntity entity, Vector2 newPosition) {
    final oldPosition = entity.position.clone();
    _recordAction(EntityMoveAction(entity, oldPosition, newPosition));
    entity.position.setFrom(newPosition);
  }

  // Undo/Redo
  void _recordAction(EditorAction action) {
    undoStack.add(action);
    redoStack.clear();
  }

  void undo() {
    if (undoStack.isEmpty) return;
    final action = undoStack.removeLast();
    action.undo(this);
    redoStack.add(action);
  }

  void redo() {
    if (redoStack.isEmpty) return;
    final action = redoStack.removeLast();
    action.execute(this);
    undoStack.add(action);
  }
}

enum EditorTool { paint, erase, fill, select, entity, pan }
```

## Editor Actions (Undo/Redo)

```dart
abstract class EditorAction {
  void execute(LevelEditor editor);
  void undo(LevelEditor editor);
}

class TileChangeAction extends EditorAction {
  final int x, y;
  final int oldTile, newTile;

  TileChangeAction(this.x, this.y, this.oldTile, this.newTile);

  @override
  void execute(LevelEditor editor) {
    editor.currentLevel!.tileGrid[y][x] = newTile;
  }

  @override
  void undo(LevelEditor editor) {
    editor.currentLevel!.tileGrid[y][x] = oldTile;
  }
}

class EntityAddAction extends EditorAction {
  final PlacedEntity entity;

  EntityAddAction(this.entity);

  @override
  void execute(LevelEditor editor) {
    editor.currentLevel!.entities.add(entity);
  }

  @override
  void undo(LevelEditor editor) {
    editor.currentLevel!.entities.remove(entity);
  }
}

class EntityMoveAction extends EditorAction {
  final PlacedEntity entity;
  final Vector2 oldPosition, newPosition;

  EntityMoveAction(this.entity, this.oldPosition, this.newPosition);

  @override
  void execute(LevelEditor editor) {
    entity.position.setFrom(newPosition);
  }

  @override
  void undo(LevelEditor editor) {
    entity.position.setFrom(oldPosition);
  }
}
```

## Editor UI

```dart
class EditorUI extends PositionComponent {
  final LevelEditor editor;

  @override
  void render(Canvas canvas) {
    // Tool palette
    _drawToolPalette(canvas, Vector2(10, 10));

    // Tile palette
    _drawTilePalette(canvas, Vector2(10, 100));

    // Entity palette
    _drawEntityPalette(canvas, Vector2(10, 300));

    // Properties panel (when entity selected)
    if (editor.selectedEntity != null) {
      _drawPropertiesPanel(canvas, Vector2(size.x - 250, 10));
    }

    // Menu bar
    _drawMenuBar(canvas);
  }

  void _drawToolPalette(Canvas canvas, Vector2 pos) {
    final tools = [
      ('Paint', EditorTool.paint),
      ('Erase', EditorTool.erase),
      ('Fill', EditorTool.fill),
      ('Select', EditorTool.select),
      ('Entity', EditorTool.entity),
      ('Pan', EditorTool.pan),
    ];

    double x = pos.x;
    for (final (name, tool) in tools) {
      final selected = editor.currentTool == tool;
      _drawToolButton(canvas, name, Vector2(x, pos.y), selected);
      x += 50;
    }
  }

  void _drawTilePalette(Canvas canvas, Vector2 pos) {
    _drawText(canvas, 'Tiles', pos, size: 14);

    double x = pos.x;
    double y = pos.y + 25;
    for (final tile in tileDefinitions) {
      final selected = editor.selectedTileId == tile.id;
      _drawTileThumbnail(canvas, tile, Vector2(x, y), selected);
      x += 36;
      if (x > 150) {
        x = pos.x;
        y += 36;
      }
    }
  }

  void _drawPropertiesPanel(Canvas canvas, Vector2 pos) {
    final entity = editor.selectedEntity!;
    final def = getEntityDef(entity.typeId);

    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(pos.x, pos.y, 240, 300), Radius.circular(8)),
      Paint()..color = Colors.black.withOpacity(0.8),
    );

    _drawText(canvas, def.name, pos + Vector2(10, 10), size: 16);

    double y = 40;
    for (final prop in def.editableProperties) {
      _drawText(canvas, prop.name, pos + Vector2(10, y), size: 12);
      _drawPropertyInput(canvas, entity, prop, pos + Vector2(100, y));
      y += 30;
    }

    _drawButton(canvas, 'Delete', pos + Vector2(10, 250));
  }

  void _drawMenuBar(Canvas canvas) {
    final items = ['File', 'Edit', 'View', 'Test'];
    double x = 0;
    for (final item in items) {
      _drawMenuItem(canvas, item, Vector2(x, 0));
      x += 80;
    }
  }
}
```

## Grid Renderer

```dart
class EditorGridRenderer extends Component {
  final LevelEditor editor;
  final double tileSize;

  @override
  void render(Canvas canvas) {
    if (editor.currentLevel == null) return;

    final level = editor.currentLevel!;

    // Draw tiles
    for (int y = 0; y < level.height; y++) {
      for (int x = 0; x < level.width; x++) {
        final tileId = level.tileGrid[y][x];
        _drawTile(canvas, x, y, tileId);
      }
    }

    // Draw grid lines
    _drawGrid(canvas, level.width, level.height);

    // Draw entities
    for (final entity in level.entities) {
      _drawEntity(canvas, entity);
    }

    // Draw selection highlight
    if (editor.selectedEntity != null) {
      _drawSelectionBox(canvas, editor.selectedEntity!);
    }
  }

  void _drawGrid(Canvas canvas, int width, int height) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.2)
      ..strokeWidth = 1;

    for (int x = 0; x <= width; x++) {
      canvas.drawLine(
        Offset(x * tileSize, 0),
        Offset(x * tileSize, height * tileSize),
        paint,
      );
    }
    for (int y = 0; y <= height; y++) {
      canvas.drawLine(
        Offset(0, y * tileSize),
        Offset(width * tileSize, y * tileSize),
        paint,
      );
    }
  }
}
```

## Level Loader (Runtime)

```dart
class LevelLoader {
  final Map<int, TileDef> tileDefinitions;
  final Map<String, EntityFactory> entityFactories;

  Future<void> loadLevelIntoGame(String levelId, FlameGame game) async {
    final file = File('levels/$levelId.json');
    final json = jsonDecode(await file.readAsString());
    final levelData = LevelData.fromJson(json);

    // Create tile components
    for (int y = 0; y < levelData.height; y++) {
      for (int x = 0; x < levelData.width; x++) {
        final tileId = levelData.tileGrid[y][x];
        final tileDef = tileDefinitions[tileId];
        if (tileDef != null) {
          game.world.add(TileComponent(
            tileDef: tileDef,
            position: Vector2(x * 32.0, y * 32.0),
          ));
        }
      }
    }

    // Create entity components
    for (final entity in levelData.entities) {
      final factory = entityFactories[entity.typeId];
      if (factory != null) {
        game.world.add(factory.create(entity));
      }
    }
  }
}

abstract class EntityFactory {
  Component create(PlacedEntity data);
}

class EnemyFactory extends EntityFactory {
  @override
  Component create(PlacedEntity data) {
    return Enemy(
      position: data.position,
      enemyType: data.properties['enemyType'] ?? 'default',
    );
  }
}
```

## JSON Level Format

```json
{
  "id": "level_001",
  "name": "Tutorial Level",
  "width": 20,
  "height": 15,
  "tileGrid": [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
  ],
  "entities": [
    {
      "id": "entity_001",
      "typeId": "player_spawn",
      "position": {"x": 64, "y": 64},
      "properties": {}
    },
    {
      "id": "entity_002",
      "typeId": "enemy",
      "position": {"x": 320, "y": 128},
      "properties": {"enemyType": "slime", "patrol": true}
    }
  ],
  "properties": {
    "backgroundMusic": "level1_bgm",
    "timeLimit": 300
  }
}
```
