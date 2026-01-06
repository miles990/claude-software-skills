# Java/Kotlin Templates

Build configuration templates for JVM projects.

## Files

| Template | Purpose |
|----------|---------|
| `build.gradle.kts` | Kotlin DSL Gradle build (Kotlin/JVM) |
| `pom.xml` | Maven build (Spring Boot) |

## Usage

### Gradle (Kotlin)

```bash
# Copy template
cp templates/build.gradle.kts ./build.gradle.kts

# Initialize wrapper
gradle wrapper --gradle-version 8.5

# Common commands
./gradlew build       # Build project
./gradlew test        # Run tests
./gradlew shadowJar   # Create fat JAR
./gradlew detekt      # Run linter
```

### Maven (Java)

```bash
# Copy template
cp templates/pom.xml ./pom.xml

# Common commands
mvn clean install     # Build project
mvn test              # Run tests
mvn package           # Create JAR
mvn spring-boot:run   # Run Spring Boot app
```

## Gradle Features

| Feature | Plugin/Dependency |
|---------|-------------------|
| Fat JAR | Shadow plugin |
| Coroutines | kotlinx-coroutines |
| HTTP Client | Ktor |
| Serialization | kotlinx-serialization |
| Testing | Kotest + MockK |
| Linting | Detekt |

## Maven Features

| Feature | Dependency |
|---------|------------|
| Web Framework | Spring Boot |
| ORM | Spring Data JPA |
| Boilerplate | Lombok |
| Mapping | MapStruct |
| Testing | JUnit 5 + Testcontainers |
| Coverage | JaCoCo |

## Project Structure

```
my-project/
├── build.gradle.kts    # or pom.xml
├── settings.gradle.kts # Gradle settings
├── src/
│   ├── main/
│   │   ├── kotlin/     # Kotlin sources
│   │   ├── java/       # Java sources
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── kotlin/
│       └── java/
└── gradle/
    └── wrapper/
```

## Customization

### Gradle - Change main class
```kotlin
application {
    mainClass.set("com.yourcompany.MainKt")
}
```

### Maven - Change Java version
```xml
<properties>
    <java.version>21</java.version>
</properties>
```

### Add new dependency (Gradle)
```kotlin
dependencies {
    implementation("group:artifact:version")
}
```

### Add new dependency (Maven)
```xml
<dependency>
    <groupId>group</groupId>
    <artifactId>artifact</artifactId>
    <version>version</version>
</dependency>
```
