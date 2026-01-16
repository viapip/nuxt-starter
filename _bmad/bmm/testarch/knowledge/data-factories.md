# Data Factories and API-First Setup

## Principle

Prefer factory functions that accept overrides and return complete objects (`createUser(overrides)`). Seed test state through APIs, tasks, or direct DB helpers before visiting the UI—never via slow UI interactions. UI is for validation only, not setup.

## Rationale

Static fixtures (JSON files, hardcoded objects) create brittle tests that:

- Fail when schemas evolve (missing new required fields)
- Cause collisions in parallel execution (same user IDs)
- Hide test intent (what matters for _this_ test?)

Dynamic factories with overrides provide:

- **Parallel safety**: UUIDs and timestamps prevent collisions
- **Schema evolution**: Defaults adapt to schema changes automatically
- **Explicit intent**: Overrides show what matters for each test
- **Speed**: API setup is 10-50x faster than UI

## Pattern Examples

### Example 1: Factory Function with Overrides

**Context**: When creating test data, build factory functions with sensible defaults and explicit overrides. Use `faker` for dynamic values that prevent collisions.

**Implementation**:

```typescript
// test-utils/factories/user-factory.ts
import { faker } from '@faker-js/faker'

type User = {
  id: string
  email: string
  name: string
  role: 'admin' | 'moderator' | 'user'
  createdAt: Date
  isActive: boolean
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    createdAt: new Date(),
    email: faker.internet.email(),
    id: faker.string.uuid(),
    isActive: true,
    name: faker.person.fullName(),
    role: 'user',
    ...overrides,
  }
}

// test-utils/factories/product-factory.ts
type Product = {
  id: string
  name: string
  price: number
  stock: number
  category: string
}

export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    category: faker.commerce.department(),
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: Number.parseFloat(faker.commerce.price()),
    stock: faker.number.int({ max: 100, min: 0 }),
    ...overrides,
  }
}

// Usage in tests:
test('admin can delete users', async ({ apiRequest, page }) => {
  // Default user
  const user = createUser()

  // Admin user (explicit override shows intent)
  const admin = createUser({ role: 'admin' })

  // Seed via API (fast!)
  await apiRequest({ data: user, method: 'POST', url: '/api/users' })
  await apiRequest({ data: admin, method: 'POST', url: '/api/users' })

  // Now test UI behavior
  await page.goto('/admin/users')
  await page.click(`[data-testid="delete-user-${user.id}"]`)
  await expect(page.getByText(`User ${user.name} deleted`))
    .toBeVisible()
})
```

**Key Points**:

- `Partial<User>` allows overriding any field without breaking type safety
- Faker generates unique values—no collisions in parallel tests
- Override shows test intent: `createUser({ role: 'admin' })` is explicit
- Factory lives in `test-utils/factories/` for easy reuse

### Example 2: Nested Factory Pattern

**Context**: When testing relationships (orders with users and products), nest factories to create complete object graphs. Control relationship data explicitly.

**Implementation**:

```typescript
// test-utils/factories/order-factory.ts
import { createProduct } from './product-factory'
import { createUser } from './user-factory'

type OrderItem = {
  product: Product
  quantity: number
  price: number
}

type Order = {
  id: string
  user: User
  items: OrderItem[]
  total: number
  status: 'delivered' | 'paid' | 'pending' | 'shipped'
  createdAt: Date
}

export function createOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  const product = overrides.product || createProduct()
  const quantity = overrides.quantity || faker.number.int({ max: 5, min: 1 })

  return {
    price: product.price * quantity,
    product,
    quantity,
    ...overrides,
  }
}

export function createOrder(overrides: Partial<Order> = {}): Order {
  const items = overrides.items || [createOrderItem(), createOrderItem()]
  const total = items.reduce((sum, item) => {
    return sum + item.price
  }, 0)

  return {
    createdAt: new Date(),
    id: faker.string.uuid(),
    items,
    status: 'pending',
    total,
    user: overrides.user || createUser(),
    ...overrides,
  }
}

// Usage in tests:
test('user can view order details', async ({ apiRequest, page }) => {
  const user = createUser({ email: 'test@example.com' })
  const product1 = createProduct({ name: 'Widget A', price: 10.0 })
  const product2 = createProduct({ name: 'Widget B', price: 15.0 })

  // Explicit relationships
  const order = createOrder({
    items: [
      createOrderItem({ product: product1, quantity: 2 }), // $20
      createOrderItem({ product: product2, quantity: 1 }), // $15
    ],
    user,
  })

  // Seed via API
  await apiRequest({ data: user, method: 'POST', url: '/api/users' })
  await apiRequest({ data: product1, method: 'POST', url: '/api/products' })
  await apiRequest({ data: product2, method: 'POST', url: '/api/products' })
  await apiRequest({ data: order, method: 'POST', url: '/api/orders' })

  // Test UI
  await page.goto(`/orders/${order.id}`)
  await expect(page.getByText('Widget A x 2'))
    .toBeVisible()
  await expect(page.getByText('Widget B x 1'))
    .toBeVisible()
  await expect(page.getByText('Total: $35.00'))
    .toBeVisible()
})
```

**Key Points**:

- Nested factories handle relationships (order → user, order → products)
- Overrides cascade: provide custom user/products or use defaults
- Calculated fields (total) derived automatically from nested data
- Explicit relationships make test data clear and maintainable

### Example 3: Factory with API Seeding

**Context**: When tests need data setup, always use API calls or database tasks—never UI navigation. Wrap factory usage with seeding utilities for clean test setup.

**Implementation**:

```typescript
// playwright/support/helpers/seed-helpers.ts
import { APIRequestContext } from '@playwright/test'

import { createProduct, Product } from '../../test-utils/factories/product-factory'
import { createUser, User } from '../../test-utils/factories/user-factory'

// Playwright globalSetup for shared data
// playwright/support/global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

import { seedUser } from './helpers/seed-helpers'

export async function seedUser(request: APIRequestContext, overrides: Partial<User> = {}): Promise<User> {
  const user = createUser(overrides)

  const response = await request.post('/api/users', {
    data: user,
  })

  if (!response.ok()) {
    throw new Error(`Failed to seed user: ${response.status()}`)
  }

  return user
}

export async function seedProduct(request: APIRequestContext, overrides: Partial<Product> = {}): Promise<Product> {
  const product = createProduct(overrides)

  const response = await request.post('/api/products', {
    data: product,
  })

  if (!response.ok()) {
    throw new Error(`Failed to seed product: ${response.status()}`)
  }

  return product
}

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const context = page.context()

  // Seed admin user for all tests
  const admin = await seedUser(context.request, {
    email: 'admin@example.com',
    role: 'admin',
  })

  // Save auth state for reuse
  await context.storageState({ path: 'playwright/.auth/admin.json' })

  await browser.close()
}

export default globalSetup

// Cypress equivalent with cy.task
// cypress/support/tasks.ts
export async function seedDatabase(entity: string, data: unknown) {
  // Direct database insert or API call
  if (entity === 'users') {
    await db.users.create(data)
  }

  return null
}

// Usage in Cypress tests:
beforeEach(() => {
  const user = createUser({ email: 'test@example.com' })
  cy.task('db:seed', { data: user, entity: 'users' })
})
```

**Key Points**:

- API seeding is 10-50x faster than UI-based setup
- `globalSetup` seeds shared data once (e.g., admin user)
- Per-test seeding uses `seedUser()` helpers for isolation
- Cypress `cy.task` allows direct database access for speed

### Example 4: Anti-Pattern - Hardcoded Test Data

**Problem**:

```typescript
// ❌ BAD: Hardcoded test data
test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@test.com'); // Hardcoded
  await page.fill('[data-testid="password"]', 'password123'); // Hardcoded
  await page.click('[data-testid="submit"]');

  // What if this user already exists? Test fails in parallel runs.
  // What if schema adds required fields? Test breaks.
});

// ❌ BAD: Static JSON fixtures
// fixtures/users.json
{
  "users": [
    { "id": 1, "email": "user1@test.com", "name": "User 1" },
    { "id": 2, "email": "user2@test.com", "name": "User 2" }
  ]
}

test('admin can delete user', async ({ page }) => {
  const users = require('../fixtures/users.json');
  // Brittle: IDs collide in parallel, schema drift breaks tests
});
```

**Why It Fails**:

- **Parallel collisions**: Hardcoded IDs (`id: 1`, `email: 'test@test.com'`) cause failures when tests run concurrently
- **Schema drift**: Adding required fields (`phoneNumber`, `address`) breaks all tests using fixtures
- **Hidden intent**: Does this test need `email: 'test@test.com'` specifically, or any email?
- **Slow setup**: UI-based data creation is 10-50x slower than API

**Better Approach**: Use factories

```typescript
// ✅ GOOD: Factory-based data
test('user can login', async ({ apiRequest, page }) => {
  const user = createUser({ email: 'unique@example.com', password: 'secure123' })

  // Seed via API (fast, parallel-safe)
  await apiRequest({ data: user, method: 'POST', url: '/api/users' })

  // Test UI
  await page.goto('/login')
  await page.fill('[data-testid="email"]', user.email)
  await page.fill('[data-testid="password"]', user.password)
  await page.click('[data-testid="submit"]')

  await expect(page)
    .toHaveURL('/dashboard')
})

// ✅ GOOD: Factories adapt to schema changes automatically
// When `phoneNumber` becomes required, update factory once:
export function createUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email(),
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number(), // NEW field, all tests get it automatically
    role: 'user',
    ...overrides,
  }
}
```

**Key Points**:

- Factories generate unique, parallel-safe data
- Schema evolution handled in one place (factory), not every test
- Test intent explicit via overrides
- API seeding is fast and reliable

### Example 5: Factory Composition

**Context**: When building specialized factories, compose simpler factories instead of duplicating logic. Layer overrides for specific test scenarios.

**Implementation**:

```typescript
// test-utils/factories/user-factory.ts (base)
export function createUser(overrides: Partial<User> = {}): User {
  return {
    createdAt: new Date(),
    email: faker.internet.email(),
    id: faker.string.uuid(),
    isActive: true,
    name: faker.person.fullName(),
    role: 'user',
    ...overrides,
  }
}

// Compose specialized factories
export function createAdminUser(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', ...overrides })
}

export function createModeratorUser(overrides: Partial<User> = {}): User {
  return createUser({ role: 'moderator', ...overrides })
}

export function createInactiveUser(overrides: Partial<User> = {}): User {
  return createUser({ isActive: false, ...overrides })
}

// Account-level factories with feature flags
type Account = {
  id: string
  owner: User
  plan: 'enterprise' | 'free' | 'pro'
  features: string[]
  maxUsers: number
}

export function createAccount(overrides: Partial<Account> = {}): Account {
  return {
    features: [],
    id: faker.string.uuid(),
    maxUsers: 1,
    owner: overrides.owner || createUser(),
    plan: 'free',
    ...overrides,
  }
}

export function createProAccount(overrides: Partial<Account> = {}): Account {
  return createAccount({
    features: ['advanced-analytics', 'priority-support'],
    maxUsers: 10,
    plan: 'pro',
    ...overrides,
  })
}

export function createEnterpriseAccount(overrides: Partial<Account> = {}): Account {
  return createAccount({
    features: [
      'advanced-analytics',
      'priority-support',
      'sso',
      'audit-logs'
    ],
    maxUsers: 100,
    plan: 'enterprise',
    ...overrides,
  })
}

// Usage in tests:
test('pro accounts can access analytics', async ({ apiRequest, page }) => {
  const admin = createAdminUser({ email: 'admin@company.com' })
  const account = createProAccount({ owner: admin })

  await apiRequest({ data: admin, method: 'POST', url: '/api/users' })
  await apiRequest({ data: account, method: 'POST', url: '/api/accounts' })

  await page.goto('/analytics')
  await expect(page.getByText('Advanced Analytics'))
    .toBeVisible()
})

test('free accounts cannot access analytics', async ({ apiRequest, page }) => {
  const user = createUser({ email: 'user@company.com' })
  const account = createAccount({ owner: user }) // Defaults to free plan

  await apiRequest({ data: user, method: 'POST', url: '/api/users' })
  await apiRequest({ data: account, method: 'POST', url: '/api/accounts' })

  await page.goto('/analytics')
  await expect(page.getByText('Upgrade to Pro'))
    .toBeVisible()
})
```

**Key Points**:

- Compose specialized factories from base factories (`createAdminUser` → `createUser`)
- Defaults cascade: `createProAccount` sets plan + features automatically
- Still allow overrides: `createProAccount({ maxUsers: 50 })` works
- Test intent clear: `createProAccount()` vs `createAccount({ plan: 'pro', features: [...] })`

## Integration Points

- **Used in workflows**: `*atdd` (test generation), `*automate` (test expansion), `*framework` (factory setup)
- **Related fragments**:
  - `fixture-architecture.md` - Pure functions and fixtures for factory integration
  - `network-first.md` - API-first setup patterns
  - `test-quality.md` - Parallel-safe, deterministic test design

## Cleanup Strategy

Ensure factories work with cleanup patterns:

```typescript
// Track created IDs for cleanup
const createdUsers: string[] = []

afterEach(async ({ apiRequest }) => {
  // Clean up all users created during test
  for (const userId of createdUsers) {
    await apiRequest({ method: 'DELETE', url: `/api/users/${userId}` })
  }
  createdUsers.length = 0
})

test('user registration flow', async ({ apiRequest, page }) => {
  const user = createUser()
  createdUsers.push(user.id)

  await apiRequest({ data: user, method: 'POST', url: '/api/users' })
  // ... test logic
})
```

## Feature Flag Integration

When working with feature flags, layer them into factories:

```typescript
export function createUserWithFlags(overrides: Partial<User> = {}, flags: Record<string, boolean> = {}): { flags: Record<string, boolean> } & User {
  return {
    ...createUser(overrides),
    flags: {
      'beta-features': false,
      'new-dashboard': false,
      ...flags,
    },
  }
}

// Usage:
const user = createUserWithFlags(
  { email: 'test@example.com' },
  {
    'beta-features': true,
    'new-dashboard': true,
  },
)
```

_Source: Murat Testing Philosophy (lines 94-120), API-first testing patterns, faker.js documentation._
