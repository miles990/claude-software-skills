# Swift Templates

Swift Package Manager configuration templates.

## Files

| Template | Purpose |
|----------|---------|
| `Package.swift` | SPM package manifest |

## Usage

### Quick Start

```bash
# Create package
mkdir MyPackage && cd MyPackage

# Copy template
cp templates/Package.swift ./Package.swift

# Create directory structure
mkdir -p Sources/MyPackage Sources/MyCLI Tests/MyPackageTests

# Create initial files
touch Sources/MyPackage/MyPackage.swift
touch Sources/MyCLI/main.swift
touch Tests/MyPackageTests/MyPackageTests.swift

# Build
swift build

# Run CLI
swift run my-cli

# Test
swift test
```

## Package Features

### Products

| Product | Type | Description |
|---------|------|-------------|
| MyPackage | Library | Main library |
| my-cli | Executable | CLI tool |

### Dependencies

| Package | Purpose |
|---------|---------|
| async-http-client | HTTP networking |
| swift-argument-parser | CLI argument parsing |
| swift-log | Logging |
| AnyCodable | JSON handling |
| SwiftDate | Date utilities |

### Platform Support

| Platform | Minimum Version |
|----------|-----------------|
| macOS | 14.0 |
| iOS | 17.0 |
| tvOS | 17.0 |
| watchOS | 10.0 |
| visionOS | 1.0 |

## Project Structure

```
MyPackage/
├── Package.swift
├── Sources/
│   ├── MyPackage/
│   │   ├── MyPackage.swift
│   │   └── Models/
│   └── MyCLI/
│       └── main.swift
├── Tests/
│   └── MyPackageTests/
│       └── MyPackageTests.swift
└── README.md
```

## Common Commands

```bash
# Build
swift build
swift build -c release

# Run
swift run my-cli

# Test
swift test
swift test --filter MyPackageTests

# Clean
swift package clean

# Update dependencies
swift package update

# Generate Xcode project
swift package generate-xcodeproj
```

## CLI Example

```swift
// Sources/MyCLI/main.swift
import ArgumentParser
import MyPackage

@main
struct MyCLI: ParsableCommand {
    static let configuration = CommandConfiguration(
        commandName: "my-cli",
        abstract: "A Swift CLI tool"
    )

    @Argument(help: "Input value")
    var input: String

    @Flag(name: .shortAndLong, help: "Verbose output")
    var verbose = false

    func run() throws {
        print("Processing: \(input)")
    }
}
```

## Library Example

```swift
// Sources/MyPackage/MyPackage.swift
import Logging

public struct MyPackage {
    private let logger = Logger(label: "com.example.mypackage")

    public init() {}

    public func process(_ input: String) async throws -> String {
        logger.info("Processing input")
        return input.uppercased()
    }
}
```

## Customization

### Add iOS-only target

```swift
.target(
    name: "MyiOSFeature",
    dependencies: ["MyPackage"],
    path: "Sources/MyiOSFeature"
),
```

### Add plugin

```swift
.plugin(
    name: "MyPlugin",
    capability: .buildTool()
)
```

### Enable Swift 6 features

```swift
swiftSettings: [
    .enableUpcomingFeature("ExistentialAny"),
    .enableUpcomingFeature("StrictConcurrency"),
]
```
