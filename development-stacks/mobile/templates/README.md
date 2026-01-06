# Mobile Templates

Configuration templates for React Native (Expo) and Flutter projects.

## Files

| Template | Purpose |
|----------|---------|
| `app.json` | Expo app configuration |
| `eas.json` | EAS Build configuration |
| `pubspec.yaml` | Flutter dependencies |

## Usage

### React Native (Expo)

```bash
# Create new Expo project
npx create-expo-app my-app
cd my-app

# Copy templates
cp templates/app.json ./app.json
cp templates/eas.json ./eas.json

# Install EAS CLI
npm install -g eas-cli

# Build
eas build --platform ios
eas build --platform android
```

### Flutter

```bash
# Create new Flutter project
flutter create my_app
cd my_app

# Copy pubspec
cp templates/pubspec.yaml ./pubspec.yaml

# Get dependencies
flutter pub get

# Run code generation
flutter pub run build_runner build
```

## Key Configuration

### app.json (Expo)

- Bundle identifiers for iOS/Android
- Permissions configuration
- Plugins (camera, router, etc.)
- Splash screen and icons

### eas.json (EAS Build)

- Development: Internal distribution, simulator builds
- Preview: Internal distribution, device builds
- Production: App Store / Play Store builds

### pubspec.yaml (Flutter)

- State management: Riverpod (default)
- Navigation: go_router
- Network: dio
- Storage: shared_preferences, secure_storage
- Code generation: freezed, json_serializable

## Build Commands

### Expo

```bash
# Development build
eas build --profile development --platform ios

# Preview build
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Flutter

```bash
# Debug
flutter run

# Release build
flutter build ios --release
flutter build appbundle --release

# With flavor
flutter run --dart-define=FLAVOR=prod
```
