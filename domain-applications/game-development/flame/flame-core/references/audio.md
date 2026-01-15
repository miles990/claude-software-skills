# Audio System

## Setup

```yaml
# pubspec.yaml
dependencies:
  flame_audio: ^2.1.0
```

## Basic Audio

### FlameAudio (Static Methods)

```dart
import 'package:flame_audio/flame_audio.dart';

class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    // Preload audio files
    await FlameAudio.audioCache.loadAll([
      'bgm.mp3',
      'jump.wav',
      'coin.wav',
      'explosion.wav',
    ]);
  }
}

// Play sound effect (fire and forget)
FlameAudio.play('coin.wav');

// Play with volume
FlameAudio.play('jump.wav', volume: 0.5);

// Play background music (loops)
FlameAudio.bgm.play('bgm.mp3');

// Stop background music
FlameAudio.bgm.stop();

// Pause/Resume BGM
FlameAudio.bgm.pause();
FlameAudio.bgm.resume();
```

### AudioPool (For Frequent Sounds)

```dart
class MyGame extends FlameGame {
  late AudioPool shootPool;
  late AudioPool hitPool;

  @override
  Future<void> onLoad() async {
    // Create audio pools for frequently played sounds
    shootPool = await FlameAudio.createPool(
      'shoot.wav',
      maxPlayers: 4,  // Allow 4 simultaneous plays
    );

    hitPool = await FlameAudio.createPool(
      'hit.wav',
      maxPlayers: 8,
    );
  }

  void shoot() {
    shootPool.start(volume: 0.7);
  }

  void onHit() {
    hitPool.start();
  }
}
```

## Audio Component

### AudioPlayerComponent

```dart
class AmbientSound extends PositionComponent with HasGameRef {
  late AudioPlayerComponent audioPlayer;

  @override
  Future<void> onLoad() async {
    audioPlayer = AudioPlayerComponent(
      source: AssetSource('ambient_forest.mp3'),
      volume: 0.3,
      isLooping: true,
    );
    add(audioPlayer);

    // Start playing
    audioPlayer.player.play();
  }

  @override
  void onRemove() {
    audioPlayer.player.stop();
    super.onRemove();
  }
}
```

## Audio Manager Pattern

```dart
class AudioManager extends Component with HasGameRef {
  static AudioManager? _instance;
  static AudioManager get instance => _instance!;

  late AudioPool sfxJump;
  late AudioPool sfxCoin;
  late AudioPool sfxHit;
  late AudioPool sfxExplosion;

  double _sfxVolume = 1.0;
  double _bgmVolume = 0.7;
  bool _isMuted = false;

  double get sfxVolume => _isMuted ? 0 : _sfxVolume;
  double get bgmVolume => _isMuted ? 0 : _bgmVolume;

  @override
  Future<void> onLoad() async {
    _instance = this;

    // Initialize audio pools
    sfxJump = await FlameAudio.createPool('sfx/jump.wav', maxPlayers: 2);
    sfxCoin = await FlameAudio.createPool('sfx/coin.wav', maxPlayers: 4);
    sfxHit = await FlameAudio.createPool('sfx/hit.wav', maxPlayers: 4);
    sfxExplosion = await FlameAudio.createPool('sfx/explosion.wav', maxPlayers: 3);
  }

  // Sound Effects
  void playJump() => sfxJump.start(volume: sfxVolume);
  void playCoin() => sfxCoin.start(volume: sfxVolume);
  void playHit() => sfxHit.start(volume: sfxVolume * 0.8);
  void playExplosion() => sfxExplosion.start(volume: sfxVolume);

  // Background Music
  void playBGM(String filename) {
    FlameAudio.bgm.play(filename, volume: bgmVolume);
  }

  void stopBGM() => FlameAudio.bgm.stop();
  void pauseBGM() => FlameAudio.bgm.pause();
  void resumeBGM() => FlameAudio.bgm.resume();

  // Volume Control
  void setSfxVolume(double volume) {
    _sfxVolume = volume.clamp(0.0, 1.0);
  }

  void setBgmVolume(double volume) {
    _bgmVolume = volume.clamp(0.0, 1.0);
    FlameAudio.bgm.audioPlayer?.setVolume(_bgmVolume);
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    if (_isMuted) {
      FlameAudio.bgm.audioPlayer?.setVolume(0);
    } else {
      FlameAudio.bgm.audioPlayer?.setVolume(_bgmVolume);
    }
  }
}

// Usage in game
class MyGame extends FlameGame {
  @override
  Future<void> onLoad() async {
    add(AudioManager());

    // Start BGM after manager is loaded
    AudioManager.instance.playBGM('music/level1.mp3');
  }
}

// Usage in components
class Player extends SpriteComponent {
  void jump() {
    AudioManager.instance.playJump();
    // ... jump logic
  }

  void collectCoin() {
    AudioManager.instance.playCoin();
    // ... collect logic
  }
}
```

## Positional Audio

### Distance-Based Volume

```dart
class PositionalAudioSource extends PositionComponent with HasGameRef {
  final String audioFile;
  final double maxDistance;
  final double baseVolume;

  late AudioPlayerComponent _audioPlayer;

  PositionalAudioSource({
    required this.audioFile,
    this.maxDistance = 300,
    this.baseVolume = 1.0,
    required super.position,
  });

  @override
  Future<void> onLoad() async {
    _audioPlayer = AudioPlayerComponent(
      source: AssetSource(audioFile),
      isLooping: true,
    );
    add(_audioPlayer);
    _audioPlayer.player.play();
  }

  @override
  void update(double dt) {
    super.update(dt);

    // Get player position
    final player = game.children.whereType<Player>().firstOrNull;
    if (player == null) return;

    // Calculate distance
    final distance = position.distanceTo(player.position);

    // Calculate volume based on distance
    final volume = distance < maxDistance
        ? baseVolume * (1 - distance / maxDistance)
        : 0.0;

    _audioPlayer.player.setVolume(volume);
  }
}

// Usage: Ambient sound in world
world.add(PositionalAudioSource(
  audioFile: 'ambient/waterfall.mp3',
  position: Vector2(500, 300),
  maxDistance: 200,
));
```

## Music Playlist

```dart
class MusicPlaylist extends Component {
  final List<String> tracks;
  int _currentIndex = 0;
  bool _isPlaying = false;

  MusicPlaylist({required this.tracks});

  Future<void> play() async {
    if (tracks.isEmpty) return;
    _isPlaying = true;
    await _playCurrentTrack();
  }

  Future<void> _playCurrentTrack() async {
    if (!_isPlaying) return;

    await FlameAudio.bgm.play(tracks[_currentIndex]);

    // Listen for track end
    FlameAudio.bgm.audioPlayer?.onPlayerComplete.listen((_) {
      _nextTrack();
    });
  }

  void _nextTrack() {
    _currentIndex = (_currentIndex + 1) % tracks.length;
    _playCurrentTrack();
  }

  void stop() {
    _isPlaying = false;
    FlameAudio.bgm.stop();
  }

  void shuffle() {
    tracks.shuffle();
    _currentIndex = 0;
  }
}

// Usage
final playlist = MusicPlaylist(tracks: [
  'music/theme1.mp3',
  'music/theme2.mp3',
  'music/theme3.mp3',
]);
playlist.shuffle();
playlist.play();
```

## Audio Settings UI

```dart
class AudioSettingsOverlay extends StatefulWidget {
  final VoidCallback onClose;

  const AudioSettingsOverlay({required this.onClose});

  @override
  State<AudioSettingsOverlay> createState() => _AudioSettingsOverlayState();
}

class _AudioSettingsOverlayState extends State<AudioSettingsOverlay> {
  double _sfxVolume = AudioManager.instance._sfxVolume;
  double _bgmVolume = AudioManager.instance._bgmVolume;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Audio Settings', style: TextStyle(fontSize: 24)),
                const SizedBox(height: 24),

                // SFX Volume
                Row(
                  children: [
                    const Icon(Icons.volume_up),
                    const SizedBox(width: 16),
                    const Text('Sound Effects'),
                    Expanded(
                      child: Slider(
                        value: _sfxVolume,
                        onChanged: (value) {
                          setState(() => _sfxVolume = value);
                          AudioManager.instance.setSfxVolume(value);
                        },
                      ),
                    ),
                  ],
                ),

                // BGM Volume
                Row(
                  children: [
                    const Icon(Icons.music_note),
                    const SizedBox(width: 16),
                    const Text('Music'),
                    Expanded(
                      child: Slider(
                        value: _bgmVolume,
                        onChanged: (value) {
                          setState(() => _bgmVolume = value);
                          AudioManager.instance.setBgmVolume(value);
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: widget.onClose,
                  child: const Text('Close'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

## Best Practices

### File Organization

```
assets/
└── audio/
    ├── sfx/           # Sound effects (.wav)
    │   ├── jump.wav
    │   ├── coin.wav
    │   └── hit.wav
    ├── music/         # Background music (.mp3/.ogg)
    │   ├── menu.mp3
    │   └── level1.mp3
    └── ambient/       # Ambient sounds (.mp3)
        └── forest.mp3
```

### Format Recommendations

| Type | Format | Reason |
|------|--------|--------|
| SFX | `.wav` | Low latency, no decoding |
| Music | `.mp3` / `.ogg` | Smaller file size |
| Ambient | `.mp3` | Smaller file size |

### Memory Management

```dart
// Preload frequently used sounds at game start
@override
Future<void> onLoad() async {
  await FlameAudio.audioCache.loadAll([
    'sfx/jump.wav',
    'sfx/coin.wav',
    // ... frequently used sounds
  ]);
}

// Clear cache when changing levels (optional)
void onLevelChange() {
  FlameAudio.audioCache.clearAll();
  // Preload new level sounds
}
```

### Platform Considerations

```dart
// Check platform for audio support
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class AudioManager extends Component {
  bool get isAudioSupported {
    if (kIsWeb) {
      // Web has autoplay restrictions
      return true; // But may require user interaction first
    }
    return true;
  }

  void playWithFallback(String filename) {
    try {
      FlameAudio.play(filename);
    } catch (e) {
      debugPrint('Audio playback failed: $e');
    }
  }
}
```
