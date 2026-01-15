# Dialogue System Reference

## Data Structure

```dart
class DialogueNode {
  final String id;
  final String speakerId;
  final String text;
  final List<DialogueChoice> choices;
  final String? nextNodeId;  // For linear dialogue
  final DialogueAction? action;

  bool get hasChoices => choices.isNotEmpty;
}

class DialogueChoice {
  final String text;
  final String nextNodeId;
  final String? condition;  // Optional requirement
}

class DialogueAction {
  final String type;  // 'give_quest', 'give_item', 'set_flag'
  final Map<String, dynamic> params;
}

class Dialogue {
  final String id;
  final Map<String, DialogueNode> nodes;
  final String startNodeId;
}
```

## Dialogue Manager

```dart
class DialogueManager extends Component {
  final Map<String, Dialogue> _dialogues = {};
  Dialogue? _currentDialogue;
  DialogueNode? _currentNode;

  bool get isActive => _currentDialogue != null;

  void loadDialogues(Map<String, Dialogue> dialogues) {
    _dialogues.addAll(dialogues);
  }

  void startDialogue(String dialogueId) {
    _currentDialogue = _dialogues[dialogueId];
    if (_currentDialogue != null) {
      _showNode(_currentDialogue!.startNodeId);
      onDialogueStarted?.call(_currentDialogue!);
    }
  }

  void _showNode(String nodeId) {
    _currentNode = _currentDialogue?.nodes[nodeId];
    if (_currentNode != null) {
      _executeAction(_currentNode!.action);
      onNodeChanged?.call(_currentNode!);
    }
  }

  void selectChoice(int index) {
    if (_currentNode == null || index >= _currentNode!.choices.length) return;

    final choice = _currentNode!.choices[index];
    if (choice.nextNodeId == 'end') {
      endDialogue();
    } else {
      _showNode(choice.nextNodeId);
    }
  }

  void advance() {
    if (_currentNode?.hasChoices == true) return;  // Wait for choice

    if (_currentNode?.nextNodeId == null || _currentNode?.nextNodeId == 'end') {
      endDialogue();
    } else {
      _showNode(_currentNode!.nextNodeId!);
    }
  }

  void endDialogue() {
    final dialogue = _currentDialogue;
    _currentDialogue = null;
    _currentNode = null;
    onDialogueEnded?.call(dialogue!);
  }

  void _executeAction(DialogueAction? action) {
    if (action == null) return;
    onActionTriggered?.call(action);
  }

  // Callbacks
  void Function(Dialogue)? onDialogueStarted;
  void Function(Dialogue)? onDialogueEnded;
  void Function(DialogueNode)? onNodeChanged;
  void Function(DialogueAction)? onActionTriggered;
}
```

## JSON Data Format

```json
{
  "dialogues": {
    "npc_elder_intro": {
      "startNodeId": "node_1",
      "nodes": {
        "node_1": {
          "speakerId": "elder",
          "text": "Welcome, young adventurer! Our village needs your help.",
          "nextNodeId": "node_2"
        },
        "node_2": {
          "speakerId": "elder",
          "text": "Will you help us?",
          "choices": [
            { "text": "Of course!", "nextNodeId": "node_accept" },
            { "text": "What's in it for me?", "nextNodeId": "node_reward" },
            { "text": "Not interested.", "nextNodeId": "end" }
          ]
        },
        "node_accept": {
          "speakerId": "elder",
          "text": "Wonderful! Please clear the rats from the cellar.",
          "action": { "type": "give_quest", "params": { "questId": "main_002" } },
          "nextNodeId": "end"
        },
        "node_reward": {
          "speakerId": "elder",
          "text": "I can offer 200 gold and a fine sword.",
          "nextNodeId": "node_2"
        }
      }
    }
  }
}
```

## Dialogue UI

```dart
class DialogueBox extends PositionComponent with TapCallbacks {
  final DialogueManager manager;
  DialogueNode? _node;

  @override
  Future<void> onLoad() async {
    manager.onNodeChanged = (node) {
      _node = node;
    };
  }

  @override
  void render(Canvas canvas) {
    if (_node == null) return;

    // Draw box background
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.x, size.y),
        const Radius.circular(10),
      ),
      Paint()..color = Colors.black.withOpacity(0.8),
    );

    // Draw speaker name
    _drawText(canvas, _node!.speakerId, Vector2(20, 10));

    // Draw text
    _drawText(canvas, _node!.text, Vector2(20, 40));

    // Draw choices
    if (_node!.hasChoices) {
      double y = 100;
      for (int i = 0; i < _node!.choices.length; i++) {
        _drawText(canvas, '${i + 1}. ${_node!.choices[i].text}', Vector2(20, y));
        y += 25;
      }
    } else {
      _drawText(canvas, '[Click to continue]', Vector2(20, size.y - 30));
    }
  }

  @override
  void onTapDown(TapDownEvent event) {
    if (!_node!.hasChoices) {
      manager.advance();
    }
  }
}
```

## Typewriter Effect

```dart
class TypewriterText extends PositionComponent {
  final String fullText;
  final double charDelay;
  String _displayedText = '';
  double _timer = 0;
  int _charIndex = 0;

  TypewriterText({
    required this.fullText,
    this.charDelay = 0.03,
  });

  bool get isComplete => _charIndex >= fullText.length;

  void skipToEnd() {
    _displayedText = fullText;
    _charIndex = fullText.length;
  }

  @override
  void update(double dt) {
    if (isComplete) return;

    _timer += dt;
    while (_timer >= charDelay && _charIndex < fullText.length) {
      _displayedText += fullText[_charIndex];
      _charIndex++;
      _timer -= charDelay;
    }
  }
}
```

## NPC Integration

```dart
class Npc extends SpriteComponent with TapCallbacks {
  final String dialogueId;
  final DialogueManager dialogueManager;

  @override
  void onTapDown(TapDownEvent event) {
    dialogueManager.startDialogue(dialogueId);
  }
}
```
