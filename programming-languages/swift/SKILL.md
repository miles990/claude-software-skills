---
name: swift
description: Swift programming patterns for iOS and macOS
domain: programming-languages
version: 1.0.0
tags: [swift, ios, macos, swiftui, concurrency]
---

# Swift

## Overview

Swift programming patterns including protocols, generics, async/await, and SwiftUI.

---

## Swift Fundamentals

### Structs and Classes

```swift
import Foundation

// Struct (value type, preferred for most cases)
struct User: Identifiable, Codable {
    let id: UUID
    var email: String
    var name: String
    var createdAt: Date

    // Memberwise initializer provided automatically
    // Custom initializer
    init(email: String, name: String) {
        self.id = UUID()
        self.email = email
        self.name = name
        self.createdAt = Date()
    }

    // Computed property
    var displayName: String {
        "\(name) <\(email)>"
    }

    // Mutating method (for structs)
    mutating func updateEmail(_ newEmail: String) {
        email = newEmail
    }
}

// Class (reference type)
class UserManager {
    static let shared = UserManager() // Singleton

    private var users: [UUID: User] = [:]

    private init() {}

    func add(_ user: User) {
        users[user.id] = user
    }

    func find(id: UUID) -> User? {
        users[id]
    }
}

// Actor (thread-safe reference type)
actor UserStore {
    private var users: [UUID: User] = [:]

    func add(_ user: User) {
        users[user.id] = user
    }

    func find(id: UUID) -> User? {
        users[id]
    }

    func count() -> Int {
        users.count
    }
}
```

### Enums and Pattern Matching

```swift
// Enum with associated values
enum Result<Success, Failure: Error> {
    case success(Success)
    case failure(Failure)

    var isSuccess: Bool {
        if case .success = self { return true }
        return false
    }

    func map<NewSuccess>(_ transform: (Success) -> NewSuccess) -> Result<NewSuccess, Failure> {
        switch self {
        case .success(let value):
            return .success(transform(value))
        case .failure(let error):
            return .failure(error)
        }
    }
}

// Enum with raw values
enum Status: String, Codable, CaseIterable {
    case pending = "pending"
    case active = "active"
    case inactive = "inactive"

    var displayName: String {
        switch self {
        case .pending: return "Pending Review"
        case .active: return "Active"
        case .inactive: return "Inactive"
        }
    }
}

// Pattern matching
func process(_ result: Result<User, Error>) {
    switch result {
    case .success(let user) where user.email.contains("@admin"):
        print("Admin user: \(user.name)")
    case .success(let user):
        print("Regular user: \(user.name)")
    case .failure(let error):
        print("Error: \(error.localizedDescription)")
    }
}

// If-case pattern
if case .success(let user) = result {
    print(user.name)
}

// Guard-case pattern
func handleSuccess(_ result: Result<User, Error>) -> User? {
    guard case .success(let user) = result else {
        return nil
    }
    return user
}
```

### Optionals

```swift
// Optional declaration
var name: String? = nil
var age: Int? = 25

// Optional binding
if let name = name {
    print("Name: \(name)")
}

// Multiple bindings
if let name = name, let age = age, age > 18 {
    print("\(name) is \(age) years old")
}

// Guard let (early exit)
func processUser(_ user: User?) -> String {
    guard let user = user else {
        return "No user"
    }
    return user.displayName
}

// Nil coalescing
let displayName = name ?? "Anonymous"

// Optional chaining
let uppercased = name?.uppercased()

// Map and flatMap
let nameLength = name.map { $0.count }
let parsed: Int? = "42".flatMap { Int($0) }

// Implicitly unwrapped (use sparingly)
var apiKey: String!
```

---

## Protocols and Generics

### Protocols

```swift
// Protocol definition
protocol Repository {
    associatedtype Entity: Identifiable

    func find(id: Entity.ID) async throws -> Entity?
    func findAll() async throws -> [Entity]
    func save(_ entity: Entity) async throws
    func delete(id: Entity.ID) async throws
}

// Protocol with default implementation
extension Repository {
    func findAll() async throws -> [Entity] {
        // Default implementation
        []
    }
}

// Protocol composition
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

typealias Person = Named & Aged

func greet(_ person: some Person) {
    print("Hello, \(person.name)!")
}

// Protocol with Self requirement
protocol Copyable {
    func copy() -> Self
}

// Conforming to protocols
struct UserRepository: Repository {
    typealias Entity = User

    func find(id: UUID) async throws -> User? {
        // Implementation
        nil
    }

    func save(_ entity: User) async throws {
        // Implementation
    }

    func delete(id: UUID) async throws {
        // Implementation
    }
}
```

### Generics

```swift
// Generic function
func swap<T>(_ a: inout T, _ b: inout T) {
    let temp = a
    a = b
    b = temp
}

// Generic type
struct Stack<Element> {
    private var items: [Element] = []

    mutating func push(_ item: Element) {
        items.append(item)
    }

    mutating func pop() -> Element? {
        items.popLast()
    }

    var top: Element? {
        items.last
    }

    var isEmpty: Bool {
        items.isEmpty
    }
}

// Generic constraints
func findIndex<T: Equatable>(of value: T, in array: [T]) -> Int? {
    for (index, item) in array.enumerated() {
        if item == value {
            return index
        }
    }
    return nil
}

// Where clause
func allItemsMatch<C1: Container, C2: Container>(
    _ c1: C1,
    _ c2: C2
) -> Bool where C1.Item == C2.Item, C1.Item: Equatable {
    guard c1.count == c2.count else { return false }

    for i in 0..<c1.count {
        if c1[i] != c2[i] { return false }
    }
    return true
}

// Opaque types (some)
func makeCollection() -> some Collection {
    [1, 2, 3]
}

// Primary associated types (Swift 5.7+)
func process<C: Collection<String>>(_ collection: C) {
    for item in collection {
        print(item)
    }
}
```

---

## Async/Await (Swift 5.5+)

```swift
// Async function
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Concurrent execution
func fetchAllUsers(ids: [String]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            group.addTask {
                try await fetchUser(id: id)
            }
        }

        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}

// Async sequences
struct NumberSequence: AsyncSequence {
    typealias Element = Int

    let start: Int
    let end: Int

    struct AsyncIterator: AsyncIteratorProtocol {
        var current: Int
        let end: Int

        mutating func next() async -> Int? {
            guard current <= end else { return nil }
            defer { current += 1 }
            try? await Task.sleep(nanoseconds: 100_000_000)
            return current
        }
    }

    func makeAsyncIterator() -> AsyncIterator {
        AsyncIterator(current: start, end: end)
    }
}

// Using async for-in
func processNumbers() async {
    for await number in NumberSequence(start: 1, end: 10) {
        print(number)
    }
}

// Task groups
func processItems(_ items: [Item]) async throws -> [Result] {
    try await withThrowingTaskGroup(of: Result.self) { group in
        for item in items {
            group.addTask {
                try await process(item)
            }
        }
        return try await group.reduce(into: []) { $0.append($1) }
    }
}

// Actors for thread-safe state
actor Counter {
    private var value = 0

    func increment() {
        value += 1
    }

    func get() -> Int {
        value
    }
}

// @MainActor for UI updates
@MainActor
class ViewModel: ObservableObject {
    @Published var users: [User] = []

    func loadUsers() async {
        do {
            let fetched = try await fetchAllUsers(ids: ["1", "2", "3"])
            users = fetched
        } catch {
            print(error)
        }
    }
}
```

---

## SwiftUI Patterns

```swift
import SwiftUI

// View composition
struct UserListView: View {
    @StateObject private var viewModel = UserListViewModel()

    var body: some View {
        NavigationStack {
            List(viewModel.users) { user in
                NavigationLink(value: user) {
                    UserRow(user: user)
                }
            }
            .navigationTitle("Users")
            .navigationDestination(for: User.self) { user in
                UserDetailView(user: user)
            }
            .refreshable {
                await viewModel.refresh()
            }
            .task {
                await viewModel.loadUsers()
            }
        }
    }
}

struct UserRow: View {
    let user: User

    var body: some View {
        HStack {
            AsyncImage(url: user.avatarURL) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                ProgressView()
            }
            .frame(width: 44, height: 44)
            .clipShape(Circle())

            VStack(alignment: .leading) {
                Text(user.name)
                    .font(.headline)
                Text(user.email)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// View model with Combine
@MainActor
class UserListViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: Error?

    private let userService: UserService

    init(userService: UserService = .shared) {
        self.userService = userService
    }

    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }

        do {
            users = try await userService.fetchUsers()
        } catch {
            self.error = error
        }
    }

    func refresh() async {
        await loadUsers()
    }
}

// Custom view modifier
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 4)
    }
}

extension View {
    func card() -> some View {
        modifier(CardModifier())
    }
}

// Environment values
private struct UserServiceKey: EnvironmentKey {
    static let defaultValue = UserService.shared
}

extension EnvironmentValues {
    var userService: UserService {
        get { self[UserServiceKey.self] }
        set { self[UserServiceKey.self] = newValue }
    }
}
```

---

## Error Handling

```swift
// Define errors
enum NetworkError: Error, LocalizedError {
    case invalidURL
    case noData
    case decodingFailed(Error)
    case serverError(statusCode: Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingFailed(let error):
            return "Decoding failed: \(error.localizedDescription)"
        case .serverError(let code):
            return "Server error: \(code)"
        }
    }
}

// Throwing functions
func fetchData(from urlString: String) async throws -> Data {
    guard let url = URL(string: urlString) else {
        throw NetworkError.invalidURL
    }

    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse else {
        throw NetworkError.noData
    }

    guard (200...299).contains(httpResponse.statusCode) else {
        throw NetworkError.serverError(statusCode: httpResponse.statusCode)
    }

    return data
}

// Result type
func fetchUser(id: String) async -> Result<User, NetworkError> {
    do {
        let data = try await fetchData(from: "https://api.example.com/users/\(id)")
        let user = try JSONDecoder().decode(User.self, from: data)
        return .success(user)
    } catch let error as NetworkError {
        return .failure(error)
    } catch {
        return .failure(.decodingFailed(error))
    }
}

// Do-catch
do {
    let user = try await fetchData(from: "...")
    print(user)
} catch NetworkError.invalidURL {
    print("Bad URL")
} catch {
    print("Other error: \(error)")
}

// try? and try!
let user = try? await fetchUser(id: "1") // Returns optional
let definiteUser = try! loadFromCache() // Force unwrap (crashes on error)
```

---

## Related Skills

- [[mobile]] - iOS/macOS development
- [[frontend]] - SwiftUI patterns
- [[testing]] - XCTest, Quick/Nimble
