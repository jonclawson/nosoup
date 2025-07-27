# Testing Documentation

## Overview

This project uses Jest for unit testing with comprehensive test coverage for API routes and components.

## Test Setup

### Dependencies
- `jest` - Testing framework
- `@types/jest` - TypeScript types for Jest
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers
- `jest-environment-jsdom` - DOM testing environment

### Configuration
- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.ts` - Global test setup and mocks

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only page component tests
npm test -- --testPathPatterns="page.test.tsx"

# Run only API route tests
npm test -- --testPathPatterns="route.test.ts"
```

## Test Structure

### API Route Tests
Located in `src/test/api/**/route.test.ts`

#### Articles API Tests (`src/test/api/articles/route.test.ts`)

**GET /api/articles**
- Returns all articles with author information
- Returns empty array when no articles exist
- Handles database errors gracefully

**POST /api/articles**
- Creates new article when user is authenticated
- Returns 401 when user is not authenticated
- Returns 400 when title is missing
- Returns 400 when body is missing
- Returns 400 when both title and body are missing
- Handles database errors gracefully
- Handles invalid JSON in request body

### Page Component Tests
Located in `src/test/**/page.test.tsx`

#### Articles Page Tests (`src/test/articles/page.test.tsx`)

**ArticlesPage Component**
- Renders the page with articles
- Renders the page with empty articles list
- Handles database errors gracefully
- Serializes dates correctly
- Has correct styling classes
- Passes correct props to ArticleList component

**GET /api/articles**
- Returns all articles with author information
- Returns empty array when no articles exist
- Handles database errors gracefully

**POST /api/articles**
- Creates new article when user is authenticated
- Returns 401 when user is not authenticated
- Returns 400 when title is missing
- Returns 400 when body is missing
- Returns 400 when both title and body are missing
- Handles database errors gracefully
- Handles invalid JSON in request body

## Test Coverage

### What's Tested
- **API Routes** - All HTTP methods and error scenarios
- **Authentication** - Session validation and role-based access
- **Data Validation** - Input validation and error handling
- **Database Operations** - CRUD operations with proper mocking
- **Error Handling** - Graceful error responses

### Mocking Strategy
- **NextAuth.js** - Session management and authentication
- **Prisma Client** - Database operations
- **bcryptjs** - Password hashing
- **NextRequest** - HTTP request handling

## Adding New Tests

### For API Routes
1. Create `route.test.ts` in `src/test/api/[route-path]/`
2. Import the route handlers (`GET`, `POST`, etc.) from the actual route file
3. Mock dependencies using Jest
4. Test all scenarios: success, validation errors, authentication errors, database errors

### Example Test Structure
```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/your-route/route'

describe('/api/your-route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return data successfully', async () => {
      // Test implementation
    })
  })

  describe('POST', () => {
    it('should create resource when authenticated', async () => {
      // Test implementation
    })
  })
})
```

## Best Practices

1. **Mock External Dependencies** - Don't test external libraries
2. **Test Error Scenarios** - Cover all error paths
3. **Use Descriptive Test Names** - Clear what each test validates
4. **Clean Up After Tests** - Use `beforeEach` to reset mocks
5. **Test Edge Cases** - Invalid input, missing data, etc.

## Coverage Goals

- **API Routes**: 100% coverage
- **Components**: 80%+ coverage
- **Error Handling**: 100% coverage
- **Authentication**: 100% coverage

## Debugging Tests

If tests fail, check:
1. **Mock Setup** - Ensure all dependencies are properly mocked
2. **Import Paths** - Verify relative imports are correct
3. **Test Environment** - Check Jest configuration
4. **Console Output** - Look for error messages in test output 