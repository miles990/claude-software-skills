---
name: rust
description: Rust programming patterns and ownership concepts
domain: programming-languages
version: 1.0.0
tags: [rust, ownership, lifetimes, traits, async]
---

# Rust

## Overview

Rust programming patterns including ownership, lifetimes, traits, and async programming.

---

## Ownership and Borrowing

### Basic Ownership

```rust
fn main() {
    // Ownership transfer (move)
    let s1 = String::from("hello");
    let s2 = s1; // s1 is moved to s2
    // println!("{}", s1); // Error: s1 is no longer valid

    // Clone for deep copy
    let s3 = String::from("hello");
    let s4 = s3.clone();
    println!("{} {}", s3, s4); // Both valid

    // Copy types (stack-only data)
    let x = 5;
    let y = x; // Copy, not move
    println!("{} {}", x, y); // Both valid
}

// Ownership and functions
fn takes_ownership(s: String) {
    println!("{}", s);
} // s is dropped here

fn makes_copy(x: i32) {
    println!("{}", x);
} // x goes out of scope, nothing special

fn gives_ownership() -> String {
    String::from("hello")
}

fn takes_and_gives_back(s: String) -> String {
    s
}
```

### Borrowing

```rust
// Immutable borrow
fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope but doesn't drop the value

// Mutable borrow
fn append_world(s: &mut String) {
    s.push_str(" world");
}

fn main() {
    let s = String::from("hello");

    // Multiple immutable borrows OK
    let r1 = &s;
    let r2 = &s;
    println!("{} {}", r1, r2);

    // Mutable borrow (only one at a time)
    let mut s2 = String::from("hello");
    let r3 = &mut s2;
    r3.push_str(" world");
    println!("{}", r3);

    // Cannot have mutable and immutable at same time
    let mut s3 = String::from("hello");
    let r4 = &s3;
    // let r5 = &mut s3; // Error!
    println!("{}", r4);
}
```

### Lifetimes

```rust
// Explicit lifetime annotations
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Struct with lifetime
struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn level(&self) -> i32 {
        3
    }

    fn announce_and_return(&self, announcement: &str) -> &str {
        println!("Attention: {}", announcement);
        self.part
    }
}

// Multiple lifetimes
fn complex<'a, 'b>(x: &'a str, y: &'b str) -> &'a str
where
    'b: 'a, // 'b outlives 'a
{
    x
}

// Static lifetime
fn static_string() -> &'static str {
    "I live forever"
}
```

---

## Structs and Enums

### Structs

```rust
#[derive(Debug, Clone, PartialEq)]
struct User {
    id: u64,
    email: String,
    name: String,
    active: bool,
}

impl User {
    // Associated function (constructor)
    fn new(email: String, name: String) -> Self {
        Self {
            id: generate_id(),
            email,
            name,
            active: true,
        }
    }

    // Method
    fn deactivate(&mut self) {
        self.active = false;
    }

    // Method returning reference
    fn email(&self) -> &str {
        &self.email
    }
}

// Tuple struct
struct Color(u8, u8, u8);
struct Point(f64, f64, f64);

// Unit struct
struct AlwaysEqual;
```

### Enums

```rust
// Basic enum
enum Direction {
    North,
    South,
    East,
    West,
}

// Enum with data
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

impl Message {
    fn process(&self) {
        match self {
            Message::Quit => println!("Quit"),
            Message::Move { x, y } => println!("Move to ({}, {})", x, y),
            Message::Write(text) => println!("Write: {}", text),
            Message::ChangeColor(r, g, b) => println!("Color: ({}, {}, {})", r, g, b),
        }
    }
}

// Result and Option
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Division by zero"))
    } else {
        Ok(a / b)
    }
}

fn find_user(id: u64) -> Option<User> {
    // ...
    None
}
```

---

## Traits

```rust
// Trait definition
trait Summary {
    fn summarize(&self) -> String;

    // Default implementation
    fn summarize_author(&self) -> String {
        String::from("(unknown author)")
    }
}

// Implement trait
impl Summary for User {
    fn summarize(&self) -> String {
        format!("{} ({})", self.name, self.email)
    }
}

// Trait bounds
fn notify<T: Summary>(item: &T) {
    println!("Breaking news: {}", item.summarize());
}

// Multiple trait bounds
fn notify_multiple<T: Summary + Clone>(item: &T) {
    let cloned = item.clone();
    println!("{}", cloned.summarize());
}

// where clause
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Summary + Clone,
    U: Clone + std::fmt::Debug,
{
    // ...
    0
}

// Return trait
fn create_summarizable() -> impl Summary {
    User::new(
        String::from("test@example.com"),
        String::from("Test"),
    )
}

// Trait objects (dynamic dispatch)
fn process_summaries(items: &[&dyn Summary]) {
    for item in items {
        println!("{}", item.summarize());
    }
}
```

---

## Error Handling

```rust
use std::fs::File;
use std::io::{self, Read};
use thiserror::Error;

// Custom error with thiserror
#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Parse error: {0}")]
    Parse(#[from] std::num::ParseIntError),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {field} - {message}")]
    Validation { field: String, message: String },
}

// Using Result
fn read_file(path: &str) -> Result<String, AppError> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// ? operator chains
fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&mut username)?;
    Ok(username)
}

// Option handling
fn find_and_process(id: u64) -> Option<String> {
    let user = find_user(id)?;
    let data = process_user(&user)?;
    Some(data)
}

// Combinators
fn get_user_email(id: u64) -> Option<String> {
    find_user(id)
        .map(|user| user.email)
        .filter(|email| !email.is_empty())
}

fn parse_and_double(s: &str) -> Result<i32, std::num::ParseIntError> {
    s.parse::<i32>().map(|n| n * 2)
}
```

---

## Async Programming

```rust
use tokio;
use futures::future;

// Async function
async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {
    let response = reqwest::get(url).await?;
    let body = response.text().await?;
    Ok(body)
}

// Concurrent execution
async fn fetch_all(urls: Vec<&str>) -> Vec<Result<String, reqwest::Error>> {
    let futures: Vec<_> = urls.iter().map(|url| fetch_data(url)).collect();
    future::join_all(futures).await
}

// Select (race)
use tokio::select;
use tokio::time::{sleep, Duration};

async fn fetch_with_timeout(url: &str) -> Result<String, &'static str> {
    select! {
        result = fetch_data(url) => result.map_err(|_| "fetch error"),
        _ = sleep(Duration::from_secs(5)) => Err("timeout"),
    }
}

// Spawn tasks
async fn process_items(items: Vec<String>) {
    let handles: Vec<_> = items
        .into_iter()
        .map(|item| {
            tokio::spawn(async move {
                process_item(&item).await
            })
        })
        .collect();

    for handle in handles {
        if let Err(e) = handle.await {
            eprintln!("Task failed: {}", e);
        }
    }
}

// Streams
use futures::stream::{self, StreamExt};

async fn process_stream() {
    let numbers = stream::iter(vec![1, 2, 3, 4, 5]);

    numbers
        .map(|n| async move { n * 2 })
        .buffer_unordered(3)
        .for_each(|n| async move {
            println!("{}", n);
        })
        .await;
}

// Channels
use tokio::sync::mpsc;

async fn channel_example() {
    let (tx, mut rx) = mpsc::channel(32);

    tokio::spawn(async move {
        for i in 0..10 {
            tx.send(i).await.unwrap();
        }
    });

    while let Some(value) = rx.recv().await {
        println!("Received: {}", value);
    }
}
```

---

## Collections and Iterators

```rust
use std::collections::{HashMap, HashSet, VecDeque};

// Vec operations
let mut vec = vec![1, 2, 3];
vec.push(4);
vec.extend([5, 6, 7]);
let first = vec.first();
let last = vec.pop();

// HashMap
let mut map: HashMap<String, i32> = HashMap::new();
map.insert(String::from("key"), 42);
map.entry(String::from("key2")).or_insert(0);

// Iterator methods
let numbers = vec![1, 2, 3, 4, 5];

let doubled: Vec<_> = numbers.iter().map(|x| x * 2).collect();

let sum: i32 = numbers.iter().sum();

let evens: Vec<_> = numbers.iter().filter(|x| *x % 2 == 0).collect();

let found = numbers.iter().find(|&&x| x > 3);

let all_positive = numbers.iter().all(|x| *x > 0);

// Chaining
let result: i32 = numbers
    .iter()
    .filter(|x| *x % 2 == 0)
    .map(|x| x * 2)
    .sum();

// Custom iterator
struct Counter {
    count: u32,
    max: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count < self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}
```

---

## Smart Pointers

```rust
use std::rc::Rc;
use std::cell::RefCell;
use std::sync::{Arc, Mutex};

// Box - heap allocation
let boxed = Box::new(5);
let list = Box::new(Node {
    value: 1,
    next: Some(Box::new(Node { value: 2, next: None })),
});

// Rc - reference counting
let a = Rc::new(5);
let b = Rc::clone(&a);
let c = Rc::clone(&a);
println!("count: {}", Rc::strong_count(&a)); // 3

// RefCell - interior mutability
let cell = RefCell::new(5);
*cell.borrow_mut() += 1;
println!("{}", cell.borrow()); // 6

// Rc<RefCell<T>> - shared mutable state
let shared = Rc::new(RefCell::new(vec![1, 2, 3]));
let shared2 = Rc::clone(&shared);
shared.borrow_mut().push(4);
shared2.borrow_mut().push(5);

// Arc - thread-safe Rc
let arc = Arc::new(5);
let arc2 = Arc::clone(&arc);

// Arc<Mutex<T>> - shared mutable state across threads
let counter = Arc::new(Mutex::new(0));
let handles: Vec<_> = (0..10)
    .map(|_| {
        let counter = Arc::clone(&counter);
        std::thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        })
    })
    .collect();

for handle in handles {
    handle.join().unwrap();
}
```

---

## Related Skills

- [[system-design]] - Systems programming
- [[desktop-apps]] - Tauri applications
- [[performance-optimization]] - Low-level optimization
