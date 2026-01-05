---
name: go
description: Go programming patterns and idioms
domain: programming-languages
version: 1.0.0
tags: [go, golang, concurrency, goroutines, channels]
---

# Go

## Overview

Go programming patterns including concurrency, error handling, and idiomatic Go code.

---

## Basic Patterns

### Structs and Methods

```go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

// Struct definition
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	metadata  map[string]interface{} // unexported (private)
}

// Constructor function
func NewUser(email, name string) *User {
	return &User{
		ID:        generateID(),
		Email:     email,
		Name:      name,
		CreatedAt: time.Now(),
		metadata:  make(map[string]interface{}),
	}
}

// Value receiver (for read-only)
func (u User) FullName() string {
	return u.Name
}

// Pointer receiver (for mutations or large structs)
func (u *User) SetMetadata(key string, value interface{}) {
	u.metadata[key] = value
}

// Embedding (composition)
type Admin struct {
	User        // Embedded struct
	Permissions []string
}

func (a *Admin) HasPermission(perm string) bool {
	for _, p := range a.Permissions {
		if p == perm {
			return true
		}
	}
	return false
}
```

### Interfaces

```go
// Interface definition
type Repository interface {
	Find(id string) (*User, error)
	FindAll() ([]*User, error)
	Create(user *User) error
	Update(user *User) error
	Delete(id string) error
}

// Interface implementation (implicit)
type MemoryRepository struct {
	users map[string]*User
}

func NewMemoryRepository() *MemoryRepository {
	return &MemoryRepository{
		users: make(map[string]*User),
	}
}

func (r *MemoryRepository) Find(id string) (*User, error) {
	user, ok := r.users[id]
	if !ok {
		return nil, ErrNotFound
	}
	return user, nil
}

func (r *MemoryRepository) Create(user *User) error {
	r.users[user.ID] = user
	return nil
}

// Compile-time interface check
var _ Repository = (*MemoryRepository)(nil)

// Empty interface (any type)
func PrintAny(v interface{}) {
	fmt.Printf("%v\n", v)
}

// Type assertion
func ProcessValue(v interface{}) {
	switch val := v.(type) {
	case string:
		fmt.Println("String:", val)
	case int:
		fmt.Println("Int:", val)
	case *User:
		fmt.Println("User:", val.Name)
	default:
		fmt.Println("Unknown type")
	}
}
```

---

## Error Handling

```go
import (
	"errors"
	"fmt"
)

// Sentinel errors
var (
	ErrNotFound   = errors.New("not found")
	ErrBadRequest = errors.New("bad request")
)

// Custom error type
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}

// Error wrapping
func GetUser(id string) (*User, error) {
	user, err := repository.Find(id)
	if err != nil {
		return nil, fmt.Errorf("getting user %s: %w", id, err)
	}
	return user, nil
}

// Error checking
func ProcessUser(id string) error {
	user, err := GetUser(id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return fmt.Errorf("user not found: %s", id)
		}
		var validationErr *ValidationError
		if errors.As(err, &validationErr) {
			return fmt.Errorf("validation failed: %s", validationErr.Field)
		}
		return err
	}
	// Process user...
	return nil
}

// Multi-error handling
type MultiError struct {
	Errors []error
}

func (m *MultiError) Error() string {
	var msgs []string
	for _, err := range m.Errors {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

func (m *MultiError) Add(err error) {
	if err != nil {
		m.Errors = append(m.Errors, err)
	}
}

func (m *MultiError) HasErrors() bool {
	return len(m.Errors) > 0
}
```

---

## Concurrency

### Goroutines and Channels

```go
// Basic goroutine
func main() {
	go func() {
		fmt.Println("Hello from goroutine")
	}()

	time.Sleep(100 * time.Millisecond)
}

// Channel basics
func worker(jobs <-chan int, results chan<- int) {
	for job := range jobs {
		results <- job * 2
	}
}

func main() {
	jobs := make(chan int, 100)
	results := make(chan int, 100)

	// Start workers
	for w := 0; w < 3; w++ {
		go worker(jobs, results)
	}

	// Send jobs
	for j := 0; j < 9; j++ {
		jobs <- j
	}
	close(jobs)

	// Collect results
	for r := 0; r < 9; r++ {
		fmt.Println(<-results)
	}
}

// Select for multiple channels
func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(100 * time.Millisecond)
		ch1 <- "one"
	}()

	go func() {
		time.Sleep(200 * time.Millisecond)
		ch2 <- "two"
	}()

	for i := 0; i < 2; i++ {
		select {
		case msg1 := <-ch1:
			fmt.Println("Received:", msg1)
		case msg2 := <-ch2:
			fmt.Println("Received:", msg2)
		case <-time.After(500 * time.Millisecond):
			fmt.Println("Timeout")
		}
	}
}
```

### Concurrency Patterns

```go
import (
	"context"
	"sync"
)

// Worker pool
type WorkerPool struct {
	numWorkers int
	jobs       chan func()
	wg         sync.WaitGroup
}

func NewWorkerPool(numWorkers int) *WorkerPool {
	pool := &WorkerPool{
		numWorkers: numWorkers,
		jobs:       make(chan func(), numWorkers*2),
	}
	pool.Start()
	return pool
}

func (p *WorkerPool) Start() {
	for i := 0; i < p.numWorkers; i++ {
		go func() {
			for job := range p.jobs {
				job()
				p.wg.Done()
			}
		}()
	}
}

func (p *WorkerPool) Submit(job func()) {
	p.wg.Add(1)
	p.jobs <- job
}

func (p *WorkerPool) Wait() {
	p.wg.Wait()
}

func (p *WorkerPool) Close() {
	close(p.jobs)
}

// Fan-out, fan-in
func FanOut(ctx context.Context, input <-chan int, workers int) []<-chan int {
	outputs := make([]<-chan int, workers)
	for i := 0; i < workers; i++ {
		outputs[i] = worker(ctx, input)
	}
	return outputs
}

func FanIn(ctx context.Context, channels ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	merged := make(chan int)

	output := func(c <-chan int) {
		defer wg.Done()
		for v := range c {
			select {
			case merged <- v:
			case <-ctx.Done():
				return
			}
		}
	}

	wg.Add(len(channels))
	for _, c := range channels {
		go output(c)
	}

	go func() {
		wg.Wait()
		close(merged)
	}()

	return merged
}

// Rate limiter
type RateLimiter struct {
	ticker *time.Ticker
	tokens chan struct{}
}

func NewRateLimiter(rate int, burst int) *RateLimiter {
	rl := &RateLimiter{
		ticker: time.NewTicker(time.Second / time.Duration(rate)),
		tokens: make(chan struct{}, burst),
	}

	// Fill initial burst
	for i := 0; i < burst; i++ {
		rl.tokens <- struct{}{}
	}

	// Refill tokens
	go func() {
		for range rl.ticker.C {
			select {
			case rl.tokens <- struct{}{}:
			default:
			}
		}
	}()

	return rl
}

func (rl *RateLimiter) Wait(ctx context.Context) error {
	select {
	case <-rl.tokens:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}
```

---

## Context

```go
import (
	"context"
	"time"
)

// Context with timeout
func FetchWithTimeout(url string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

// Context with values
type contextKey string

const userIDKey contextKey = "userID"

func WithUserID(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func GetUserID(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDKey).(string)
	return userID, ok
}

// Passing context through layers
func Handler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx = WithUserID(ctx, r.Header.Get("X-User-ID"))

	result, err := ProcessRequest(ctx)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(result)
}

func ProcessRequest(ctx context.Context) (*Result, error) {
	// Check for cancellation
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	userID, ok := GetUserID(ctx)
	if !ok {
		return nil, errors.New("user ID not found in context")
	}

	return fetchData(ctx, userID)
}
```

---

## Generics (Go 1.18+)

```go
// Generic function
func Map[T, U any](items []T, fn func(T) U) []U {
	result := make([]U, len(items))
	for i, item := range items {
		result[i] = fn(item)
	}
	return result
}

func Filter[T any](items []T, predicate func(T) bool) []T {
	var result []T
	for _, item := range items {
		if predicate(item) {
			result = append(result, item)
		}
	}
	return result
}

func Reduce[T, U any](items []T, initial U, fn func(U, T) U) U {
	result := initial
	for _, item := range items {
		result = fn(result, item)
	}
	return result
}

// Generic type constraint
type Number interface {
	~int | ~int32 | ~int64 | ~float32 | ~float64
}

func Sum[T Number](items []T) T {
	var sum T
	for _, item := range items {
		sum += item
	}
	return sum
}

// Generic struct
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	item := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return item, true
}

// Usage
stack := &Stack[int]{}
stack.Push(1)
stack.Push(2)
val, ok := stack.Pop() // val = 2, ok = true
```

---

## Testing

```go
import (
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Basic test
func TestSum(t *testing.T) {
	result := Sum([]int{1, 2, 3})
	if result != 6 {
		t.Errorf("expected 6, got %d", result)
	}
}

// Table-driven tests
func TestSumTableDriven(t *testing.T) {
	tests := []struct {
		name     string
		input    []int
		expected int
	}{
		{"empty", []int{}, 0},
		{"single", []int{5}, 5},
		{"multiple", []int{1, 2, 3}, 6},
		{"negative", []int{-1, 1}, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Sum(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

// Test with testify
func TestUser(t *testing.T) {
	user := NewUser("test@example.com", "Test User")

	require.NotNil(t, user)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "Test User", user.Name)
	assert.NotEmpty(t, user.ID)
}

// Benchmark
func BenchmarkSum(b *testing.B) {
	items := make([]int, 1000)
	for i := range items {
		items[i] = i
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		Sum(items)
	}
}
```

---

## Related Skills

- [[backend]] - Go web services
- [[cloud-platforms]] - Cloud-native Go
- [[system-design]] - System architecture
