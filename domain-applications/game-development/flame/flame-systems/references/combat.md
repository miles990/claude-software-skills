# Combat System Reference

## Data Structure

```dart
class CombatStats {
  int hp;
  int maxHp;
  int mp;
  int maxMp;
  int attack;
  int defense;
  int speed;
  int critRate;     // Percentage
  int critDamage;   // Percentage bonus

  CombatStats({
    required this.maxHp,
    required this.maxMp,
    required this.attack,
    required this.defense,
    this.speed = 100,
    this.critRate = 5,
    this.critDamage = 150,
  }) : hp = maxHp, mp = maxMp;
}

class DamageResult {
  final int damage;
  final bool isCrit;
  final bool isMiss;
  final DamageType type;
}

enum DamageType { physical, magical, pure }
enum CombatState { idle, attacking, defending, stunned, dead }
```

## Damage Calculation

```dart
class DamageCalculator {
  static DamageResult calculate({
    required CombatStats attacker,
    required CombatStats defender,
    required int baseDamage,
    DamageType type = DamageType.physical,
  }) {
    // Miss check (based on speed difference)
    final hitChance = 95 + (attacker.speed - defender.speed) ~/ 10;
    if (Random().nextInt(100) >= hitChance) {
      return DamageResult(damage: 0, isCrit: false, isMiss: true, type: type);
    }

    // Base damage
    int damage = baseDamage + attacker.attack;

    // Defense reduction (physical only)
    if (type == DamageType.physical) {
      damage = (damage * (100 / (100 + defender.defense))).round();
    }

    // Critical hit
    final isCrit = Random().nextInt(100) < attacker.critRate;
    if (isCrit) {
      damage = (damage * attacker.critDamage / 100).round();
    }

    // Minimum damage
    damage = damage.clamp(1, 9999);

    return DamageResult(damage: damage, isCrit: isCrit, isMiss: false, type: type);
  }
}
```

## Combat Entity (Enemy/Player)

```dart
abstract class CombatEntity extends SpriteAnimationGroupComponent<CombatState>
    with HasGameRef {
  late CombatStats stats;
  CombatState state = CombatState.idle;

  bool get isAlive => stats.hp > 0;
  bool get isDead => !isAlive;

  void takeDamage(DamageResult result) {
    if (result.isMiss) {
      showFloatingText('MISS', Colors.grey);
      return;
    }

    stats.hp -= result.damage;
    stats.hp = stats.hp.clamp(0, stats.maxHp);

    // Visual feedback
    showFloatingText(
      result.isCrit ? '${result.damage}!' : '${result.damage}',
      result.isCrit ? Colors.orange : Colors.white,
    );

    // Flash red
    add(ColorEffect(
      Colors.red,
      EffectController(duration: 0.1),
      opacityTo: 0.5,
    ));

    if (isDead) {
      onDeath();
    }
  }

  void heal(int amount) {
    stats.hp += amount;
    stats.hp = stats.hp.clamp(0, stats.maxHp);
    showFloatingText('+$amount', Colors.green);
  }

  void showFloatingText(String text, Color color) {
    add(FloatingDamageText(text, color));
  }

  void onDeath() {
    state = CombatState.dead;
    current = CombatState.dead;
  }
}
```

## Turn-Based Combat

```dart
class TurnBasedCombat extends Component {
  final List<CombatEntity> participants = [];
  int currentTurnIndex = 0;
  bool isPlayerTurn = false;

  CombatEntity get currentTurn => participants[currentTurnIndex];

  void startCombat(List<CombatEntity> entities) {
    participants.clear();
    participants.addAll(entities);

    // Sort by speed
    participants.sort((a, b) => b.stats.speed.compareTo(a.stats.speed));

    currentTurnIndex = 0;
    _startTurn();
  }

  void _startTurn() {
    final entity = currentTurn;

    if (entity.isDead) {
      nextTurn();
      return;
    }

    isPlayerTurn = entity is Player;
    onTurnStarted?.call(entity);

    if (!isPlayerTurn) {
      // AI takes action
      _executeAI(entity as Enemy);
    }
  }

  void playerAction(CombatAction action) {
    if (!isPlayerTurn) return;
    _executeAction(currentTurn, action);
  }

  void _executeAction(CombatEntity actor, CombatAction action) {
    switch (action.type) {
      case ActionType.attack:
        final result = DamageCalculator.calculate(
          attacker: actor.stats,
          defender: action.target!.stats,
          baseDamage: action.baseDamage,
        );
        action.target!.takeDamage(result);
        break;

      case ActionType.skill:
        // Execute skill effect
        action.skill!.execute(actor, action.target);
        break;

      case ActionType.item:
        // Use item
        action.item!.use(action.target ?? actor);
        break;

      case ActionType.defend:
        actor.state = CombatState.defending;
        // Defense buff until next turn
        break;

      case ActionType.flee:
        if (Random().nextInt(100) < 50) {
          endCombat(CombatResult.fled);
        }
        break;
    }

    // Check combat end
    if (_checkCombatEnd()) return;

    nextTurn();
  }

  void nextTurn() {
    do {
      currentTurnIndex = (currentTurnIndex + 1) % participants.length;
    } while (currentTurn.isDead);

    _startTurn();
  }

  bool _checkCombatEnd() {
    final enemies = participants.whereType<Enemy>();
    final players = participants.whereType<Player>();

    if (enemies.every((e) => e.isDead)) {
      endCombat(CombatResult.victory);
      return true;
    }
    if (players.every((p) => p.isDead)) {
      endCombat(CombatResult.defeat);
      return true;
    }
    return false;
  }

  void Function(CombatEntity)? onTurnStarted;
  void Function(CombatResult)? onCombatEnded;
}
```

## Action-Based Combat (Real-time)

```dart
class ActionCombat extends Component {
  final Player player;
  final List<Enemy> enemies = [];

  double attackCooldown = 0;
  static const attackCooldownTime = 0.5;

  @override
  void update(double dt) {
    super.update(dt);

    if (attackCooldown > 0) {
      attackCooldown -= dt;
    }

    // Check player attack input
    if (player.isAttacking && attackCooldown <= 0) {
      _performAttack();
      attackCooldown = attackCooldownTime;
    }
  }

  void _performAttack() {
    // Find enemies in attack range
    final attackRange = 50.0;
    for (final enemy in enemies) {
      if (player.position.distanceTo(enemy.position) < attackRange) {
        final result = DamageCalculator.calculate(
          attacker: player.stats,
          defender: enemy.stats,
          baseDamage: player.weapon?.damage ?? 10,
        );
        enemy.takeDamage(result);

        if (enemy.isDead) {
          _onEnemyKilled(enemy);
        }
      }
    }
  }

  void _onEnemyKilled(Enemy enemy) {
    // Drop loot
    enemy.dropLoot();
    // Grant exp
    player.gainExp(enemy.expReward);
    enemies.remove(enemy);
  }
}
```

## Floating Damage Text

```dart
class FloatingDamageText extends TextComponent {
  FloatingDamageText(String text, Color color)
      : super(
          text: text,
          textRenderer: TextPaint(
            style: TextStyle(fontSize: 20, color: color, fontWeight: FontWeight.bold),
          ),
          anchor: Anchor.center,
        );

  @override
  Future<void> onLoad() async {
    add(MoveEffect.by(
      Vector2(0, -50),
      EffectController(duration: 1.0, curve: Curves.easeOut),
    ));
    add(OpacityEffect.fadeOut(
      EffectController(duration: 1.0),
      onComplete: removeFromParent,
    ));
  }
}
```

## Combat UI

```dart
class CombatUI extends PositionComponent {
  final TurnBasedCombat combat;

  @override
  void render(Canvas canvas) {
    // Draw action menu when player turn
    if (combat.isPlayerTurn) {
      _drawActionMenu(canvas);
    }

    // Draw turn order
    _drawTurnOrder(canvas);
  }

  void _drawActionMenu(Canvas canvas) {
    final actions = ['Attack', 'Skill', 'Item', 'Defend', 'Flee'];
    double y = 0;
    for (final action in actions) {
      _drawButton(canvas, action, Vector2(0, y));
      y += 40;
    }
  }
}
```
