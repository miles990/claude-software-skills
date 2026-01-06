// swift-tools-version: 5.9
// ===========================================
// Swift Package Manager Template
// Usage: Copy to project root
// ===========================================

import PackageDescription

let package = Package(
    name: "MyPackage",
    platforms: [
        .macOS(.v14),
        .iOS(.v17),
        .tvOS(.v17),
        .watchOS(.v10),
        .visionOS(.v1)
    ],
    products: [
        // Library product
        .library(
            name: "MyPackage",
            targets: ["MyPackage"]
        ),
        // Executable product
        .executable(
            name: "my-cli",
            targets: ["MyCLI"]
        ),
    ],
    dependencies: [
        // HTTP client
        .package(url: "https://github.com/swift-server/async-http-client.git", from: "1.19.0"),

        // Argument parsing for CLI
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),

        // Logging
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),

        // JSON handling
        .package(url: "https://github.com/Flight-School/AnyCodable.git", from: "0.6.0"),

        // Date handling
        .package(url: "https://github.com/malcommac/SwiftDate.git", from: "7.0.0"),

        // Testing (development only)
        // .package(url: "https://github.com/Quick/Quick.git", from: "7.3.0"),
        // .package(url: "https://github.com/Quick/Nimble.git", from: "13.2.0"),
    ],
    targets: [
        // Main library target
        .target(
            name: "MyPackage",
            dependencies: [
                .product(name: "AsyncHTTPClient", package: "async-http-client"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "AnyCodable", package: "AnyCodable"),
                .product(name: "SwiftDate", package: "SwiftDate"),
            ],
            path: "Sources/MyPackage",
            swiftSettings: [
                .enableUpcomingFeature("BareSlashRegexLiterals"),
                .enableExperimentalFeature("StrictConcurrency"),
            ]
        ),

        // CLI executable target
        .executableTarget(
            name: "MyCLI",
            dependencies: [
                "MyPackage",
                .product(name: "ArgumentParser", package: "swift-argument-parser"),
            ],
            path: "Sources/MyCLI"
        ),

        // Test target
        .testTarget(
            name: "MyPackageTests",
            dependencies: [
                "MyPackage",
                // .product(name: "Quick", package: "Quick"),
                // .product(name: "Nimble", package: "Nimble"),
            ],
            path: "Tests/MyPackageTests"
        ),
    ],
    swiftLanguageVersions: [.v5]
)
