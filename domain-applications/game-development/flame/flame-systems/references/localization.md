# Localization System Reference

## Data Structure

```dart
class LocalizationManager {
  String _currentLocale = 'en';
  final Map<String, Map<String, String>> _translations = {};

  String get currentLocale => _currentLocale;
  List<String> get availableLocales => _translations.keys.toList();

  void loadTranslations(String locale, Map<String, String> strings) {
    _translations[locale] = strings;
  }

  void setLocale(String locale) {
    if (_translations.containsKey(locale)) {
      _currentLocale = locale;
      onLocaleChanged?.call(locale);
    }
  }

  String tr(String key, [Map<String, dynamic>? params]) {
    final text = _translations[_currentLocale]?[key] ?? key;

    if (params == null) return text;

    // Replace placeholders: {name}, {count}
    return text.replaceAllMapped(
      RegExp(r'\{(\w+)\}'),
      (match) => params[match.group(1)]?.toString() ?? match.group(0)!,
    );
  }

  void Function(String)? onLocaleChanged;
}

// Global accessor
late LocalizationManager l10n;
```

## JSON Translation Files

```json
// assets/i18n/en.json
{
  "game_title": "Epic Adventure",
  "menu_start": "Start Game",
  "menu_settings": "Settings",
  "menu_quit": "Quit",
  "dialog_hello": "Hello, {name}!",
  "quest_kill": "Kill {count} {enemy}",
  "item_gold": "{amount} Gold",
  "achievement_unlocked": "Achievement Unlocked: {title}"
}

// assets/i18n/zh_TW.json
{
  "game_title": "史詩冒險",
  "menu_start": "開始遊戲",
  "menu_settings": "設定",
  "menu_quit": "離開",
  "dialog_hello": "你好，{name}！",
  "quest_kill": "擊敗 {count} 隻 {enemy}",
  "item_gold": "{amount} 金幣",
  "achievement_unlocked": "成就解鎖：{title}"
}
```

## Loading Translations

```dart
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    l10n = LocalizationManager();

    // Load from JSON
    final enJson = await rootBundle.loadString('assets/i18n/en.json');
    final zhJson = await rootBundle.loadString('assets/i18n/zh_TW.json');

    l10n.loadTranslations('en', Map<String, String>.from(jsonDecode(enJson)));
    l10n.loadTranslations('zh_TW', Map<String, String>.from(jsonDecode(zhJson)));

    // Set default or saved preference
    final savedLocale = prefs.getString('locale') ?? 'en';
    l10n.setLocale(savedLocale);
  }
}
```

## Usage in Game

```dart
// Simple text
final title = l10n.tr('game_title');  // "Epic Adventure" or "史詩冒險"

// With parameters
final greeting = l10n.tr('dialog_hello', {'name': 'Hero'});
// "Hello, Hero!" or "你好，Hero！"

final questText = l10n.tr('quest_kill', {'count': 5, 'enemy': 'Rats'});
// "Kill 5 Rats" or "擊敗 5 隻 Rats"

// In components
class MenuButton extends TextComponent {
  final String textKey;

  @override
  Future<void> onLoad() async {
    text = l10n.tr(textKey);

    l10n.onLocaleChanged = (_) {
      text = l10n.tr(textKey);
    };
  }
}
```

## Pluralization

```dart
extension LocalizationExtension on LocalizationManager {
  String plural(String key, int count, {Map<String, dynamic>? params}) {
    final pluralKey = count == 1 ? '${key}_one' : '${key}_other';
    final finalParams = {...?params, 'count': count};
    return tr(pluralKey, finalParams);
  }
}

// JSON
{
  "enemy_killed_one": "Killed 1 enemy",
  "enemy_killed_other": "Killed {count} enemies"
}

// Usage
l10n.plural('enemy_killed', 1);  // "Killed 1 enemy"
l10n.plural('enemy_killed', 5);  // "Killed 5 enemies"
```

## Language Selector UI

```dart
class LanguageSelector extends PositionComponent with TapCallbacks {
  final List<Map<String, String>> languages = [
    {'code': 'en', 'name': 'English'},
    {'code': 'zh_TW', 'name': '繁體中文'},
    {'code': 'ja', 'name': '日本語'},
  ];

  @override
  void render(Canvas canvas) {
    double y = 0;
    for (final lang in languages) {
      final isSelected = lang['code'] == l10n.currentLocale;
      _drawText(
        canvas,
        '${isSelected ? "► " : "  "}${lang['name']}',
        Vector2(0, y),
      );
      y += 30;
    }
  }

  @override
  void onTapDown(TapDownEvent event) {
    final index = (event.localPosition.y / 30).floor();
    if (index < languages.length) {
      l10n.setLocale(languages[index]['code']!);
    }
  }
}
```

## Font Support

```dart
// For CJK characters, use appropriate fonts
final chineseRenderer = TextPaint(
  style: const TextStyle(
    fontFamily: 'NotoSansTC',  // Supports Chinese
    fontSize: 16,
  ),
);

// Load in pubspec.yaml
// fonts:
//   - family: NotoSansTC
//     fonts:
//       - asset: assets/fonts/NotoSansTC-Regular.otf
```
