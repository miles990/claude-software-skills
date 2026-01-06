/**
 * Circuit Breaker Template
 * Usage: Protect services from cascading failures
 */

// ===========================================
// Types
// ===========================================

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Failure threshold before opening (default: 5) */
  failureThreshold: number;
  /** Success threshold to close from half-open (default: 2) */
  successThreshold: number;
  /** Time before attempting recovery in ms (default: 30000) */
  resetTimeout: number;
  /** Request timeout in ms (default: 10000) */
  timeout: number;
  /** Monitor window in ms (default: 60000) */
  monitorWindow: number;
  /** Failure rate threshold percentage (default: 50) */
  failureRateThreshold: number;
  /** Minimum requests before evaluating failure rate */
  minimumRequests: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalRequests: number;
  failureRate: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  lastStateChange: Date;
}

// ===========================================
// Circuit Breaker Implementation
// ===========================================

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private lastStateChange: number = Date.now();
  private requestLog: Array<{ timestamp: number; success: boolean }> = [];
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      failureThreshold: 5,
      successThreshold: 2,
      resetTimeout: 30000,
      timeout: 10000,
      monitorWindow: 60000,
      failureRateThreshold: 50,
      minimumRequests: 10,
      ...options,
    };
  }

  /**
   * Execute function through circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open');
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Get current stats
   */
  getStats(): CircuitBreakerStats {
    this.pruneRequestLog();
    const totalRequests = this.requestLog.length;
    const failures = this.requestLog.filter(r => !r.success).length;

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests,
      failureRate: totalRequests > 0 ? (failures / totalRequests) * 100 : 0,
      lastFailure: this.lastFailureTime ? new Date(this.lastFailureTime) : undefined,
      lastSuccess: this.successes > 0 ? new Date() : undefined,
      lastStateChange: new Date(this.lastStateChange),
    };
  }

  /**
   * Manually reset circuit
   */
  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.requestLog = [];
    this.lastStateChange = Date.now();
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  // ===========================================
  // Private Methods
  // ===========================================

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new TimeoutError('Request timed out')),
          this.options.timeout
        );
      }),
    ]);
  }

  private onSuccess(): void {
    this.recordRequest(true);

    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.transitionTo('closed');
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.recordRequest(false);
    this.lastFailureTime = Date.now();
    this.failures++;

    if (this.state === 'half-open') {
      this.transitionTo('open');
    } else if (this.state === 'closed') {
      if (this.shouldOpen()) {
        this.transitionTo('open');
      }
    }
  }

  private shouldOpen(): boolean {
    // Check absolute failure threshold
    if (this.failures >= this.options.failureThreshold) {
      return true;
    }

    // Check failure rate
    this.pruneRequestLog();
    if (this.requestLog.length >= this.options.minimumRequests) {
      const failures = this.requestLog.filter(r => !r.success).length;
      const failureRate = (failures / this.requestLog.length) * 100;
      if (failureRate >= this.options.failureRateThreshold) {
        return true;
      }
    }

    return false;
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastStateChange >= this.options.resetTimeout;
  }

  private transitionTo(newState: CircuitState): void {
    console.log(`Circuit breaker: ${this.state} -> ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();

    if (newState === 'half-open') {
      this.successes = 0;
    } else if (newState === 'closed') {
      this.failures = 0;
      this.successes = 0;
    }
  }

  private recordRequest(success: boolean): void {
    this.requestLog.push({ timestamp: Date.now(), success });
    this.pruneRequestLog();
  }

  private pruneRequestLog(): void {
    const cutoff = Date.now() - this.options.monitorWindow;
    this.requestLog = this.requestLog.filter(r => r.timestamp > cutoff);
  }
}

// ===========================================
// Error Classes
// ===========================================

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ===========================================
// Circuit Breaker Registry
// ===========================================

export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  get(name: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(options));
    }
    return this.breakers.get(name)!;
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  reset(name: string): void {
    this.breakers.get(name)?.reset();
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// ===========================================
// Usage Example
// ===========================================

/*
import { CircuitBreaker, CircuitBreakerRegistry, CircuitOpenError } from './circuit-breaker';

// Single circuit breaker
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  timeout: 5000,
});

async function callExternalService() {
  try {
    const result = await circuitBreaker.execute(async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('API error');
      return response.json();
    });
    return result;
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      // Return cached/fallback data
      return getCachedData();
    }
    throw error;
  }
}

// Multiple circuit breakers with registry
const registry = new CircuitBreakerRegistry();

const userServiceBreaker = registry.get('user-service', { failureThreshold: 3 });
const paymentServiceBreaker = registry.get('payment-service', { failureThreshold: 2 });

// Get all stats
console.log(registry.getAllStats());
*/

export default CircuitBreaker;
