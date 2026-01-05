---
name: java-kotlin
description: Java and Kotlin programming patterns
domain: programming-languages
version: 1.0.0
tags: [java, kotlin, jvm, spring, android]
---

# Java & Kotlin

## Overview

Modern Java and Kotlin patterns for JVM development.

---

## Java Modern Features

### Records and Sealed Classes (Java 17+)

```java
// Record - immutable data class
public record User(
    String id,
    String email,
    String name,
    Instant createdAt
) {
    // Compact constructor for validation
    public User {
        Objects.requireNonNull(id);
        Objects.requireNonNull(email);
        if (!email.contains("@")) {
            throw new IllegalArgumentException("Invalid email");
        }
    }

    // Static factory method
    public static User create(String email, String name) {
        return new User(UUID.randomUUID().toString(), email, name, Instant.now());
    }
}

// Sealed classes - restricted hierarchy
public sealed interface Shape
    permits Circle, Rectangle, Triangle {
    double area();
}

public record Circle(double radius) implements Shape {
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

public record Rectangle(double width, double height) implements Shape {
    @Override
    public double area() {
        return width * height;
    }
}

public final class Triangle implements Shape {
    private final double base;
    private final double height;

    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }

    @Override
    public double area() {
        return 0.5 * base * height;
    }
}
```

### Pattern Matching

```java
// Pattern matching for instanceof (Java 16+)
public String describe(Object obj) {
    if (obj instanceof String s) {
        return "String of length " + s.length();
    } else if (obj instanceof Integer i) {
        return "Integer: " + i;
    } else if (obj instanceof List<?> list && !list.isEmpty()) {
        return "Non-empty list with " + list.size() + " elements";
    }
    return "Unknown type";
}

// Pattern matching for switch (Java 21+)
public double calculateArea(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t -> 0.5 * t.base() * t.height();
    };
}

// Guard patterns
public String classify(Shape shape) {
    return switch (shape) {
        case Circle c when c.radius() > 10 -> "Large circle";
        case Circle c -> "Small circle";
        case Rectangle r when r.width() == r.height() -> "Square";
        case Rectangle r -> "Rectangle";
        default -> "Other shape";
    };
}
```

### Streams and Optionals

```java
import java.util.stream.*;
import java.util.Optional;

public class StreamExamples {
    // Basic operations
    public List<String> processUsers(List<User> users) {
        return users.stream()
            .filter(u -> u.active())
            .map(User::name)
            .sorted()
            .distinct()
            .collect(Collectors.toList());
    }

    // Grouping
    public Map<String, List<User>> groupByDomain(List<User> users) {
        return users.stream()
            .collect(Collectors.groupingBy(
                u -> u.email().substring(u.email().indexOf("@") + 1)
            ));
    }

    // Statistics
    public DoubleSummaryStatistics getStats(List<Order> orders) {
        return orders.stream()
            .mapToDouble(Order::total)
            .summaryStatistics();
    }

    // Parallel processing
    public long countLargeFiles(Path directory) throws IOException {
        try (Stream<Path> paths = Files.walk(directory)) {
            return paths
                .parallel()
                .filter(Files::isRegularFile)
                .filter(p -> {
                    try {
                        return Files.size(p) > 1_000_000;
                    } catch (IOException e) {
                        return false;
                    }
                })
                .count();
        }
    }

    // Optional handling
    public String getUserEmail(Long userId) {
        return findUser(userId)
            .map(User::email)
            .filter(email -> !email.isBlank())
            .orElse("unknown@example.com");
    }

    public User getOrCreate(Long userId) {
        return findUser(userId)
            .orElseGet(() -> createUser(userId));
    }
}
```

---

## Kotlin Fundamentals

### Data Classes and Null Safety

```kotlin
// Data class (like Java record)
data class User(
    val id: String = UUID.randomUUID().toString(),
    val email: String,
    val name: String,
    val createdAt: Instant = Instant.now()
) {
    init {
        require(email.contains("@")) { "Invalid email" }
    }
}

// Null safety
fun processUser(user: User?) {
    // Safe call
    val name = user?.name

    // Elvis operator
    val displayName = user?.name ?: "Anonymous"

    // Smart cast after null check
    if (user != null) {
        println(user.email) // user is User, not User?
    }

    // let for null-safe operations
    user?.let {
        sendEmail(it.email)
    }

    // Not-null assertion (use sparingly)
    val email = user!!.email // throws if null
}

// Platform types from Java
fun handleJavaString(javaString: String?) {
    // Treat Java strings as nullable
    val length = javaString?.length ?: 0
}
```

### Extension Functions and Properties

```kotlin
// Extension function
fun String.toSlug(): String =
    this.lowercase()
        .replace(Regex("[^a-z0-9]+"), "-")
        .trim('-')

// Extension property
val String.wordCount: Int
    get() = this.split(Regex("\\s+")).size

// Extension on nullable type
fun String?.orEmpty(): String = this ?: ""

// Usage
val slug = "Hello World".toSlug() // "hello-world"
val count = "Hello World".wordCount // 2

// Scope functions
data class Config(var host: String = "", var port: Int = 0)

val config = Config().apply {
    host = "localhost"
    port = 8080
}

val result = user.let { it.name.uppercase() }

val processedUser = user.also { log.info("Processing ${it.id}") }

val transformed = with(user) {
    "$name <$email>"
}
```

### Coroutines

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

// Suspend function
suspend fun fetchUser(id: String): User {
    return withContext(Dispatchers.IO) {
        api.getUser(id)
    }
}

// Concurrent execution
suspend fun fetchAllUsers(ids: List<String>): List<User> = coroutineScope {
    ids.map { id ->
        async { fetchUser(id) }
    }.awaitAll()
}

// Structured concurrency
suspend fun processOrders(orders: List<Order>) = coroutineScope {
    orders.forEach { order ->
        launch {
            processOrder(order)
        }
    }
}

// Exception handling
suspend fun safeFetch(id: String): Result<User> = runCatching {
    fetchUser(id)
}

// Flow (cold stream)
fun fetchUsers(): Flow<User> = flow {
    val users = api.getAllUsers()
    users.forEach { user ->
        emit(user)
        delay(100)
    }
}

// Flow operators
suspend fun processUserFlow() {
    fetchUsers()
        .filter { it.active }
        .map { it.name }
        .catch { e -> emit("Error: ${e.message}") }
        .collect { name ->
            println(name)
        }
}

// StateFlow for state management
class UserViewModel : ViewModel() {
    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()

    fun loadUser(id: String) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            try {
                val user = fetchUser(id)
                _state.value = UiState.Success(user)
            } catch (e: Exception) {
                _state.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

### Sealed Classes and When

```kotlin
// Sealed class hierarchy
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val cause: Throwable? = null) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

// Exhaustive when
fun <T> handleResult(result: Result<T>): String = when (result) {
    is Result.Success -> "Success: ${result.data}"
    is Result.Error -> "Error: ${result.message}"
    Result.Loading -> "Loading..."
}

// Sealed interface
sealed interface UiEvent {
    data class ShowMessage(val message: String) : UiEvent
    data class Navigate(val route: String) : UiEvent
    object GoBack : UiEvent
}

// When with guards
fun describe(value: Any): String = when {
    value is String && value.isEmpty() -> "Empty string"
    value is String -> "String: $value"
    value is Int && value > 0 -> "Positive int"
    value is Int -> "Non-positive int"
    else -> "Unknown"
}
```

---

## Functional Patterns

```kotlin
// Higher-order functions
inline fun <T> List<T>.customFilter(predicate: (T) -> Boolean): List<T> {
    val result = mutableListOf<T>()
    for (item in this) {
        if (predicate(item)) {
            result.add(item)
        }
    }
    return result
}

// Function composition
infix fun <A, B, C> ((B) -> C).compose(other: (A) -> B): (A) -> C = { a ->
    this(other(a))
}

val double: (Int) -> Int = { it * 2 }
val addOne: (Int) -> Int = { it + 1 }
val doubleThenAddOne = addOne compose double
println(doubleThenAddOne(3)) // 7

// Currying
fun add(a: Int): (Int) -> Int = { b -> a + b }
val add5 = add(5)
println(add5(3)) // 8

// Memoization
fun <T, R> ((T) -> R).memoize(): (T) -> R {
    val cache = mutableMapOf<T, R>()
    return { key ->
        cache.getOrPut(key) { this(key) }
    }
}

val fibonacci: (Int) -> Long = { n: Int ->
    if (n <= 1) n.toLong()
    else fibonacci(n - 1) + fibonacci(n - 2)
}.memoize()
```

---

## DSL Building

```kotlin
// Type-safe builder DSL
class HtmlBuilder {
    private val children = mutableListOf<String>()

    fun head(block: HeadBuilder.() -> Unit) {
        children.add(HeadBuilder().apply(block).build())
    }

    fun body(block: BodyBuilder.() -> Unit) {
        children.add(BodyBuilder().apply(block).build())
    }

    fun build() = "<html>${children.joinToString("")}</html>"
}

class BodyBuilder {
    private val children = mutableListOf<String>()

    fun div(classes: String = "", block: BodyBuilder.() -> Unit = {}) {
        children.add("<div class=\"$classes\">${BodyBuilder().apply(block).build()}</div>")
    }

    fun p(text: String) {
        children.add("<p>$text</p>")
    }

    fun build() = children.joinToString("")
}

fun html(block: HtmlBuilder.() -> Unit) = HtmlBuilder().apply(block).build()

// Usage
val page = html {
    body {
        div("container") {
            p("Hello, World!")
        }
    }
}

// Test DSL
class TestContext {
    fun given(description: String, block: () -> Unit) {
        println("Given: $description")
        block()
    }

    fun whenever(description: String, block: () -> Unit) {
        println("When: $description")
        block()
    }

    fun then(description: String, block: () -> Unit) {
        println("Then: $description")
        block()
    }
}

fun test(name: String, block: TestContext.() -> Unit) {
    println("Test: $name")
    TestContext().apply(block)
}

// Usage
test("user registration") {
    given("a new user email") { }
    whenever("registering the user") { }
    then("user should be created") { }
}
```

---

## Related Skills

- [[backend]] - Spring Boot development
- [[mobile]] - Android development
- [[testing]] - JUnit, Kotest
