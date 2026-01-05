---
name: architecture-patterns
description: Software architecture patterns and best practices
domain: software-design
version: 1.0.0
tags: [architecture, microservices, monolithic, event-driven, serverless, ddd]
---

# Architecture Patterns

## Overview

Architecture patterns provide proven solutions for structuring software systems. Choosing the right architecture is crucial for scalability, maintainability, and team productivity.

## Patterns

### Monolithic Architecture

**Description**: Single deployable unit containing all application functionality.

**Key Features**:
- Simple deployment and development
- Shared database and memory
- Straightforward debugging

**Use Cases**:
- MVPs and startups
- Small teams (< 10 developers)
- Simple domain logic

**Best Practices**:
```
src/
├── modules/          # Feature-based organization
│   ├── users/
│   ├── orders/
│   └── products/
├── shared/           # Cross-cutting concerns
└── infrastructure/   # External services
```

---

### Microservices Architecture

**Description**: Distributed system of independently deployable services.

**Key Features**:
- Independent deployment and scaling
- Technology diversity per service
- Fault isolation

**Use Cases**:
- Large teams needing autonomy
- Complex domains with clear boundaries
- High scalability requirements

**Key Components**:
| Component | Purpose | Tools |
|-----------|---------|-------|
| API Gateway | Entry point, routing | Kong, AWS API Gateway |
| Service Discovery | Service registration | Consul, Kubernetes DNS |
| Config Management | Centralized config | Spring Cloud Config, Consul |
| Circuit Breaker | Fault tolerance | Resilience4j, Hystrix |

**Best Practices**:
1. Design around business capabilities
2. Decentralize data management
3. Design for failure
4. Automate deployment

---

### Event-Driven Architecture

**Description**: Systems communicating through events.

**Key Patterns**:

| Pattern | Description | Use Case |
|---------|-------------|----------|
| Event Sourcing | Store state as events | Audit trails, temporal queries |
| CQRS | Separate read/write models | High-read workloads |
| Saga | Distributed transactions | Cross-service workflows |

**Event Sourcing Example**:
```typescript
// Events are the source of truth
interface OrderEvent {
  id: string;
  type: 'OrderCreated' | 'ItemAdded' | 'OrderShipped';
  timestamp: Date;
  payload: unknown;
}

// Rebuild state from events
function rebuildOrder(events: OrderEvent[]): Order {
  return events.reduce((order, event) => {
    switch (event.type) {
      case 'OrderCreated': return { ...event.payload };
      case 'ItemAdded': return { ...order, items: [...order.items, event.payload] };
      case 'OrderShipped': return { ...order, status: 'shipped' };
    }
  }, {} as Order);
}
```

---

### Serverless Architecture

**Description**: Cloud-managed execution without server management.

**Key Features**:
- Pay-per-execution pricing
- Auto-scaling to zero
- Reduced operational overhead

**Considerations**:
| Aspect | Impact |
|--------|--------|
| Cold Start | 100ms-2s latency on first invocation |
| Timeout | Usually 15-30 min max execution |
| State | Must use external storage |
| Vendor Lock-in | Platform-specific features |

**Best Practices**:
1. Keep functions small and focused
2. Minimize dependencies
3. Use connection pooling for databases
4. Implement proper error handling

---

### Clean Architecture

**Description**: Dependency-inverted architecture with domain at center.

**Layer Structure**:
```
┌──────────────────────────────────────┐
│           Frameworks & Drivers       │  ← External (DB, Web, UI)
├──────────────────────────────────────┤
│           Interface Adapters         │  ← Controllers, Gateways
├──────────────────────────────────────┤
│           Application Business       │  ← Use Cases
├──────────────────────────────────────┤
│           Enterprise Business        │  ← Entities, Domain Rules
└──────────────────────────────────────┘
```

**Dependency Rule**: Dependencies point inward. Inner layers know nothing about outer layers.

---

### Domain-Driven Design (DDD)

**Description**: Architecture aligned with business domain.

**Strategic Patterns**:
| Pattern | Purpose |
|---------|---------|
| Bounded Context | Clear domain boundaries |
| Context Map | Relationships between contexts |
| Ubiquitous Language | Shared vocabulary |

**Tactical Patterns**:
| Pattern | Purpose |
|---------|---------|
| Entity | Objects with identity |
| Value Object | Immutable descriptors |
| Aggregate | Consistency boundary |
| Repository | Collection-like persistence |
| Domain Event | Something that happened |

---

## Decision Guide

```
START
  │
  ├─ Team size < 10? ──────────────────→ Monolith
  │
  ├─ Need independent deployments? ────→ Microservices
  │
  ├─ Audit trail required? ────────────→ Event Sourcing
  │
  ├─ Variable/unpredictable load? ─────→ Serverless
  │
  ├─ Complex business logic? ──────────→ Clean Architecture + DDD
  │
  └─ Default ──────────────────────────→ Modular Monolith
```

## Common Pitfalls

### 1. Premature Microservices
**Problem**: Starting with microservices for a simple application
**Solution**: Start monolithic, extract services when boundaries are clear

### 2. Distributed Monolith
**Problem**: Microservices that must deploy together
**Solution**: Ensure services are truly independent with clear API contracts

### 3. Ignoring Data Boundaries
**Problem**: Shared database across services
**Solution**: Each service owns its data, use events for synchronization

## Related Skills

- [[api-design]] - API design for service communication
- [[system-design]] - Large-scale system considerations
- [[devops-cicd]] - Deployment strategies for each pattern
