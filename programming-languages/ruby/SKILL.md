---
name: ruby
description: Ruby programming patterns and idioms
domain: programming-languages
version: 1.0.0
tags: [ruby, rails, metaprogramming, blocks, gems]
---

# Ruby

## Overview

Ruby programming patterns including blocks, metaprogramming, and idiomatic Ruby code.

---

## Core Ruby Patterns

### Classes and Modules

```ruby
# Class definition
class User
  attr_accessor :name, :email
  attr_reader :id
  attr_writer :password

  # Class variable
  @@count = 0

  # Class method
  def self.count
    @@count
  end

  # Initialize
  def initialize(name, email)
    @id = SecureRandom.uuid
    @name = name
    @email = email
    @@count += 1
  end

  # Instance method
  def display_name
    "#{name} <#{email}>"
  end

  # Private methods
  private

  def validate_email
    email.include?('@')
  end
end

# Inheritance
class Admin < User
  attr_accessor :permissions

  def initialize(name, email, permissions = [])
    super(name, email)
    @permissions = permissions
  end

  def has_permission?(perm)
    permissions.include?(perm)
  end
end

# Modules for mixins
module Timestampable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def timestamped_attrs
      [:created_at, :updated_at]
    end
  end

  def touch
    @updated_at = Time.now
  end

  def created_at
    @created_at ||= Time.now
  end
end

# Including module
class Document
  include Timestampable
  include Comparable

  attr_accessor :title, :content

  def <=>(other)
    title <=> other.title
  end
end

# Module for namespacing
module MyApp
  module Services
    class UserService
      def create(params)
        # ...
      end
    end
  end
end
```

### Blocks, Procs, and Lambdas

```ruby
# Block usage
[1, 2, 3].each { |n| puts n }

[1, 2, 3].map do |n|
  n * 2
end

# Yield to block
def with_timing
  start = Time.now
  result = yield
  elapsed = Time.now - start
  puts "Elapsed: #{elapsed}s"
  result
end

with_timing { sleep(0.1) }

# Block with arguments
def transform_items(items)
  items.map { |item| yield(item) }
end

transform_items([1, 2, 3]) { |n| n * 2 }

# Check if block given
def optional_block
  if block_given?
    yield
  else
    "No block provided"
  end
end

# Convert block to proc
def with_block(&block)
  block.call(42)
end

# Proc
my_proc = Proc.new { |x| x * 2 }
my_proc.call(21) # => 42

# Lambda
my_lambda = ->(x) { x * 2 }
my_lambda.call(21) # => 42

# Proc vs Lambda differences
proc_example = Proc.new { |x, y| x }
proc_example.call(1) # Works, y is nil

lambda_example = ->(x, y) { x }
# lambda_example.call(1) # ArgumentError

# Symbol to proc
['a', 'b', 'c'].map(&:upcase)
# Equivalent to: ['a', 'b', 'c'].map { |s| s.upcase }
```

### Enumerable and Iterators

```ruby
# Array operations
numbers = [1, 2, 3, 4, 5]

# Map/collect
doubled = numbers.map { |n| n * 2 }

# Select/filter
evens = numbers.select(&:even?)

# Reject
odds = numbers.reject(&:even?)

# Reduce/inject
sum = numbers.reduce(0) { |acc, n| acc + n }
sum = numbers.reduce(:+)

# Each with index
numbers.each_with_index do |n, i|
  puts "#{i}: #{n}"
end

# Find
found = numbers.find { |n| n > 3 }

# Any/all/none
numbers.any?(&:even?) # true
numbers.all? { |n| n > 0 } # true
numbers.none? { |n| n > 10 } # true

# Group by
users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' }
]

grouped = users.group_by { |u| u[:role] }
# => { 'admin' => [...], 'user' => [...] }

# Partition
passed, failed = scores.partition { |s| s >= 60 }

# Flat map
nested = [[1, 2], [3, 4]]
flat = nested.flat_map { |arr| arr.map { |n| n * 2 } }

# Lazy evaluation
(1..Float::INFINITY).lazy
  .select(&:even?)
  .map { |n| n * 2 }
  .take(10)
  .to_a

# Custom iterator
class Countdown
  include Enumerable

  def initialize(start)
    @start = start
  end

  def each
    @start.downto(0) { |n| yield n }
  end
end

Countdown.new(5).to_a # => [5, 4, 3, 2, 1, 0]
```

---

## Metaprogramming

```ruby
# Method missing
class DynamicProxy
  def initialize(target)
    @target = target
  end

  def method_missing(method, *args, &block)
    puts "Calling #{method} with #{args}"
    @target.send(method, *args, &block)
  end

  def respond_to_missing?(method, include_private = false)
    @target.respond_to?(method) || super
  end
end

# Define method dynamically
class User
  ROLES = %w[admin moderator user]

  ROLES.each do |role|
    define_method("#{role}?") do
      @role == role
    end
  end
end

# Class macro
class MyModel
  def self.attribute(name, type)
    define_method(name) do
      instance_variable_get("@#{name}")
    end

    define_method("#{name}=") do |value|
      instance_variable_set("@#{name}", value)
    end
  end

  attribute :name, :string
  attribute :age, :integer
end

# Hook methods
class Base
  def self.inherited(subclass)
    puts "#{subclass} inherits from #{self}"
  end

  def self.method_added(method_name)
    puts "Method #{method_name} added"
  end
end

# Instance eval / class eval
class Config
  def self.configure(&block)
    instance_eval(&block)
  end

  def self.setting(name, value)
    define_singleton_method(name) { value }
  end
end

Config.configure do
  setting :api_key, 'abc123'
  setting :timeout, 30
end

# Send / public_send
obj.send(:private_method) # Can call private
obj.public_send(:public_method) # Only public

# Refinements (safer monkey patching)
module StringExtensions
  refine String do
    def to_slug
      downcase.gsub(/\s+/, '-')
    end
  end
end

class MyClass
  using StringExtensions

  def process(title)
    title.to_slug
  end
end
```

---

## Error Handling

```ruby
# Basic exception handling
begin
  risky_operation
rescue StandardError => e
  puts "Error: #{e.message}"
  puts e.backtrace.first(5).join("\n")
ensure
  cleanup
end

# Multiple rescue clauses
begin
  parse_file(path)
rescue Errno::ENOENT
  puts "File not found"
rescue JSON::ParserError => e
  puts "Invalid JSON: #{e.message}"
rescue => e
  puts "Unknown error: #{e.class}"
end

# Retry
attempts = 0
begin
  attempts += 1
  connect_to_server
rescue ConnectionError
  retry if attempts < 3
  raise
end

# Custom exceptions
class AppError < StandardError
  attr_reader :code

  def initialize(message, code: nil)
    super(message)
    @code = code
  end
end

class ValidationError < AppError
  attr_reader :errors

  def initialize(errors)
    super("Validation failed")
    @errors = errors
  end
end

# Raise with custom exception
raise ValidationError.new({ email: ['is invalid'] })

# Re-raise with context
begin
  process_order(order)
rescue => e
  raise "Failed to process order #{order.id}: #{e.message}"
end

# Result object pattern
class Result
  attr_reader :value, :error

  def self.success(value)
    new(value: value)
  end

  def self.failure(error)
    new(error: error)
  end

  def initialize(value: nil, error: nil)
    @value = value
    @error = error
  end

  def success?
    error.nil?
  end

  def failure?
    !success?
  end

  def then
    return self if failure?
    yield(value)
  end
end

# Usage
def create_user(params)
  return Result.failure('Email required') unless params[:email]

  user = User.create(params)
  Result.success(user)
rescue ActiveRecord::RecordInvalid => e
  Result.failure(e.message)
end
```

---

## Testing with RSpec

```ruby
# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:posts) }
    it { is_expected.to belong_to(:organization) }
  end

  describe '#display_name' do
    subject(:user) { build(:user, name: 'John', email: 'john@example.com') }

    it 'returns formatted name with email' do
      expect(user.display_name).to eq('John <john@example.com>')
    end
  end

  describe '.active' do
    let!(:active_user) { create(:user, active: true) }
    let!(:inactive_user) { create(:user, active: false) }

    it 'returns only active users' do
      expect(User.active).to contain_exactly(active_user)
    end
  end

  context 'when user is admin' do
    subject(:admin) { build(:user, :admin) }

    it 'has admin privileges' do
      expect(admin).to be_admin
    end
  end
end

# spec/services/user_service_spec.rb
RSpec.describe UserService do
  describe '#create' do
    subject(:service) { described_class.new }

    let(:params) { { email: 'test@example.com', name: 'Test' } }
    let(:email_service) { instance_double(EmailService) }

    before do
      allow(EmailService).to receive(:new).and_return(email_service)
      allow(email_service).to receive(:send_welcome)
    end

    it 'creates a user' do
      expect { service.create(params) }.to change(User, :count).by(1)
    end

    it 'sends welcome email' do
      service.create(params)
      expect(email_service).to have_received(:send_welcome)
    end

    context 'with invalid params' do
      let(:params) { { email: '' } }

      it 'raises validation error' do
        expect { service.create(params) }.to raise_error(ValidationError)
      end
    end
  end
end
```

---

## Concurrency

```ruby
# Threads
threads = []
results = []
mutex = Mutex.new

5.times do |i|
  threads << Thread.new do
    result = heavy_computation(i)
    mutex.synchronize { results << result }
  end
end

threads.each(&:join)

# Thread pool with Concurrent Ruby
require 'concurrent'

pool = Concurrent::FixedThreadPool.new(5)

futures = urls.map do |url|
  Concurrent::Future.execute(executor: pool) do
    fetch_url(url)
  end
end

results = futures.map(&:value)

# Async/await with Async gem
require 'async'

Async do
  results = urls.map do |url|
    Async do
      fetch_url(url)
    end
  end.map(&:wait)
end

# Fiber (cooperative concurrency)
fiber = Fiber.new do
  puts "Start"
  Fiber.yield 1
  puts "Middle"
  Fiber.yield 2
  puts "End"
end

fiber.resume # "Start", returns 1
fiber.resume # "Middle", returns 2
fiber.resume # "End", returns nil

# Ractor (Ruby 3.0+ parallel execution)
ractor = Ractor.new do
  val = Ractor.receive
  val * 2
end

ractor.send(21)
result = ractor.take # => 42
```

---

## Related Skills

- [[backend]] - Ruby on Rails
- [[testing]] - RSpec, Minitest
- [[automation-scripts]] - Ruby scripting
