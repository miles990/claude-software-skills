# C#/.NET Templates

Project configuration templates for .NET applications.

## Files

| Template | Purpose |
|----------|---------|
| `WebApi.csproj` | ASP.NET Core Web API project |
| `appsettings.json` | Application configuration |

## Usage

### Create new project

```bash
# Create solution
dotnet new sln -n MyApp

# Create Web API project
dotnet new webapi -n MyApp.Api -o src/MyApp.Api

# Copy templates
cp templates/WebApi.csproj src/MyApp.Api/MyApp.Api.csproj
cp templates/appsettings.json src/MyApp.Api/appsettings.json

# Add to solution
dotnet sln add src/MyApp.Api/MyApp.Api.csproj

# Restore and build
dotnet restore
dotnet build
```

### Common Commands

```bash
dotnet run                    # Run application
dotnet watch run              # Run with hot reload
dotnet test                   # Run tests
dotnet ef migrations add Init # Add EF migration
dotnet ef database update     # Apply migrations
dotnet publish -c Release     # Publish for production
```

## Project Template Features

| Feature | Package |
|---------|---------|
| ORM | Entity Framework Core |
| Database | PostgreSQL (Npgsql) |
| Auth | JWT Bearer |
| Docs | Swagger/OpenAPI |
| Validation | FluentValidation |
| Mapping | AutoMapper |
| Logging | Serilog |
| Caching | Redis |
| Health | AspNetCore.HealthChecks |

## Configuration Sections

### appsettings.json

| Section | Purpose |
|---------|---------|
| `ConnectionStrings` | Database and cache connections |
| `Jwt` | JWT authentication settings |
| `Cors` | Allowed origins |
| `RateLimiting` | Request rate limits |
| `Serilog` | Structured logging |
| `HealthChecks` | Health endpoint config |

## Project Structure

```
MyApp/
├── MyApp.sln
├── src/
│   └── MyApp.Api/
│       ├── MyApp.Api.csproj
│       ├── Program.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Controllers/
│       ├── Models/
│       ├── Services/
│       └── Data/
│           └── AppDbContext.cs
└── tests/
    └── MyApp.Tests/
```

## Environment Variables

Override settings via environment:

```bash
# Connection string
ConnectionStrings__DefaultConnection="Host=prod-db;..."

# JWT secret
Jwt__Secret="production-secret-key"

# Logging level
Logging__LogLevel__Default="Warning"
```

## Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.Api.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```
