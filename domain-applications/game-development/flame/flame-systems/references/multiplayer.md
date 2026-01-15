# Multiplayer System Reference

## Architecture Overview

```dart
// Client-Server model
// Server: Authoritative game state
// Client: Input sending + state interpolation

enum NetworkRole { server, client }
enum ConnectionState { disconnected, connecting, connected, error }
```

## Network Message

```dart
abstract class NetworkMessage {
  final String type;
  final int timestamp;

  NetworkMessage(this.type) : timestamp = DateTime.now().millisecondsSinceEpoch;

  Map<String, dynamic> toJson();
  factory NetworkMessage.fromJson(Map<String, dynamic> json);
}

class PlayerInputMessage extends NetworkMessage {
  final String playerId;
  final Vector2 moveDirection;
  final bool isShooting;

  PlayerInputMessage({
    required this.playerId,
    required this.moveDirection,
    this.isShooting = false,
  }) : super('player_input');

  @override
  Map<String, dynamic> toJson() => {
    'type': type,
    'timestamp': timestamp,
    'playerId': playerId,
    'moveDirection': {'x': moveDirection.x, 'y': moveDirection.y},
    'isShooting': isShooting,
  };
}

class GameStateMessage extends NetworkMessage {
  final List<PlayerState> players;
  final List<EntityState> entities;

  GameStateMessage({
    required this.players,
    required this.entities,
  }) : super('game_state');
}

class PlayerState {
  final String id;
  final Vector2 position;
  final int health;
  final String animation;
}
```

## WebSocket Client

```dart
class NetworkClient {
  WebSocketChannel? _channel;
  ConnectionState state = ConnectionState.disconnected;
  String? playerId;

  final _messageController = StreamController<NetworkMessage>.broadcast();
  Stream<NetworkMessage> get messages => _messageController.stream;

  Future<void> connect(String serverUrl) async {
    state = ConnectionState.connecting;

    try {
      _channel = WebSocketChannel.connect(Uri.parse(serverUrl));

      _channel!.stream.listen(
        (data) {
          final json = jsonDecode(data);
          final message = NetworkMessage.fromJson(json);
          _messageController.add(message);
        },
        onDone: () {
          state = ConnectionState.disconnected;
          onDisconnected?.call();
        },
        onError: (error) {
          state = ConnectionState.error;
          onError?.call(error.toString());
        },
      );

      state = ConnectionState.connected;
      onConnected?.call();
    } catch (e) {
      state = ConnectionState.error;
      onError?.call(e.toString());
    }
  }

  void send(NetworkMessage message) {
    if (state != ConnectionState.connected) return;
    _channel?.sink.add(jsonEncode(message.toJson()));
  }

  void disconnect() {
    _channel?.sink.close();
    state = ConnectionState.disconnected;
  }

  void Function()? onConnected;
  void Function()? onDisconnected;
  void Function(String)? onError;
}
```

## State Synchronization

```dart
class NetworkSync extends Component with HasGameRef {
  final NetworkClient client;
  final Map<String, NetworkPlayer> remotePlayers = {};

  // Interpolation buffer
  final Map<String, List<PlayerState>> stateBuffer = {};
  static const interpolationDelay = 100; // ms

  @override
  void onMount() {
    client.messages.listen(_handleMessage);
    super.onMount();
  }

  void _handleMessage(NetworkMessage message) {
    switch (message.type) {
      case 'game_state':
        _handleGameState(message as GameStateMessage);
        break;
      case 'player_joined':
        _handlePlayerJoined(message);
        break;
      case 'player_left':
        _handlePlayerLeft(message);
        break;
    }
  }

  void _handleGameState(GameStateMessage state) {
    for (final playerState in state.players) {
      if (playerState.id == client.playerId) {
        // Local player - reconcile
        _reconcileLocalPlayer(playerState);
      } else {
        // Remote player - buffer for interpolation
        stateBuffer.putIfAbsent(playerState.id, () => []);
        stateBuffer[playerState.id]!.add(playerState);

        // Keep buffer size limited
        if (stateBuffer[playerState.id]!.length > 10) {
          stateBuffer[playerState.id]!.removeAt(0);
        }
      }
    }
  }

  @override
  void update(double dt) {
    // Interpolate remote players
    final renderTime = DateTime.now().millisecondsSinceEpoch - interpolationDelay;

    for (final entry in stateBuffer.entries) {
      final playerId = entry.key;
      final buffer = entry.value;

      if (buffer.length < 2) continue;

      // Find states to interpolate between
      PlayerState? from, to;
      for (int i = 0; i < buffer.length - 1; i++) {
        if (buffer[i].timestamp <= renderTime && buffer[i + 1].timestamp >= renderTime) {
          from = buffer[i];
          to = buffer[i + 1];
          break;
        }
      }

      if (from != null && to != null) {
        final t = (renderTime - from.timestamp) / (to.timestamp - from.timestamp);
        final interpolatedPos = Vector2(
          from.position.x + (to.position.x - from.position.x) * t,
          from.position.y + (to.position.y - from.position.y) * t,
        );

        remotePlayers[playerId]?.position = interpolatedPos;
      }
    }
  }
}
```

## Input Prediction (Client-side)

```dart
class InputPredictor {
  final List<PendingInput> pendingInputs = [];
  int inputSequence = 0;

  void sendInput(Vector2 moveDirection, NetworkClient client) {
    final input = PendingInput(
      sequence: inputSequence++,
      moveDirection: moveDirection,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );

    pendingInputs.add(input);

    // Send to server
    client.send(PlayerInputMessage(
      playerId: client.playerId!,
      moveDirection: moveDirection,
    ));

    // Apply locally (prediction)
    localPlayer.applyInput(moveDirection);
  }

  void reconcile(PlayerState serverState, int lastProcessedInput) {
    // Remove acknowledged inputs
    pendingInputs.removeWhere((i) => i.sequence <= lastProcessedInput);

    // Reset to server state
    localPlayer.position = serverState.position;

    // Reapply pending inputs
    for (final input in pendingInputs) {
      localPlayer.applyInput(input.moveDirection);
    }
  }
}

class PendingInput {
  final int sequence;
  final Vector2 moveDirection;
  final int timestamp;

  PendingInput({
    required this.sequence,
    required this.moveDirection,
    required this.timestamp,
  });
}
```

## Lobby System

```dart
class LobbyManager {
  final NetworkClient client;
  final List<LobbyRoom> rooms = [];
  LobbyRoom? currentRoom;

  Future<void> refreshRooms() async {
    client.send(RequestRoomsMessage());
  }

  Future<void> createRoom(String name, int maxPlayers) async {
    client.send(CreateRoomMessage(name: name, maxPlayers: maxPlayers));
  }

  Future<void> joinRoom(String roomId) async {
    client.send(JoinRoomMessage(roomId: roomId));
  }

  Future<void> leaveRoom() async {
    client.send(LeaveRoomMessage());
    currentRoom = null;
  }

  void setReady(bool ready) {
    client.send(SetReadyMessage(ready: ready));
  }
}

class LobbyRoom {
  final String id;
  final String name;
  final String hostId;
  final int maxPlayers;
  final List<LobbyPlayer> players;
  final bool isStarted;

  bool get isFull => players.length >= maxPlayers;
  bool get canStart => players.every((p) => p.isReady) && players.length >= 2;
}

class LobbyPlayer {
  final String id;
  final String name;
  final bool isReady;
  final bool isHost;
}
```

## Lobby UI

```dart
class LobbyUI extends PositionComponent {
  final LobbyManager lobbyManager;

  @override
  void render(Canvas canvas) {
    if (lobbyManager.currentRoom == null) {
      _drawRoomList(canvas);
    } else {
      _drawRoomLobby(canvas);
    }
  }

  void _drawRoomList(Canvas canvas) {
    _drawText(canvas, 'Available Rooms', Vector2(10, 10), size: 24);

    double y = 50;
    for (final room in lobbyManager.rooms) {
      final status = room.isFull ? '(Full)' : '${room.players.length}/${room.maxPlayers}';
      _drawText(canvas, '${room.name} $status', Vector2(10, y));
      _drawButton(canvas, 'Join', Vector2(300, y - 5), enabled: !room.isFull);
      y += 40;
    }

    _drawButton(canvas, 'Create Room', Vector2(10, size.y - 50));
    _drawButton(canvas, 'Refresh', Vector2(150, size.y - 50));
  }

  void _drawRoomLobby(Canvas canvas) {
    final room = lobbyManager.currentRoom!;
    _drawText(canvas, room.name, Vector2(10, 10), size: 24);

    double y = 50;
    for (final player in room.players) {
      final status = player.isReady ? '[Ready]' : '[Not Ready]';
      final host = player.isHost ? '(Host)' : '';
      _drawText(canvas, '${player.name} $host $status', Vector2(10, y));
      y += 30;
    }

    _drawButton(canvas, 'Ready', Vector2(10, size.y - 50));
    _drawButton(canvas, 'Leave', Vector2(150, size.y - 50));

    if (room.canStart && _isHost()) {
      _drawButton(canvas, 'Start Game', Vector2(size.x - 150, size.y - 50));
    }
  }
}
```

## Simple Firebase Realtime Database

```dart
class FirebaseMultiplayer {
  final DatabaseReference _db = FirebaseDatabase.instance.ref();
  String? roomId;
  String? playerId;

  Future<void> createRoom() async {
    final roomRef = _db.child('rooms').push();
    roomId = roomRef.key;

    await roomRef.set({
      'hostId': playerId,
      'state': 'waiting',
      'players': {playerId: {'x': 0, 'y': 0, 'ready': false}},
    });
  }

  void listenToRoom() {
    _db.child('rooms/$roomId').onValue.listen((event) {
      final data = event.snapshot.value as Map?;
      if (data != null) {
        _updateFromServerState(data);
      }
    });
  }

  void updatePosition(Vector2 position) {
    _db.child('rooms/$roomId/players/$playerId').update({
      'x': position.x,
      'y': position.y,
    });
  }
}
```
