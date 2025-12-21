import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock Next.js server components
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string
    constructor(url: string, init?: RequestInit) {
      this.url = url
    }
    formData() {
      return Promise.resolve(new FormData())
    }
  } as any
}

// Mock NextResponse
if (typeof global.Response === 'undefined') {
  global.Response = class {
    constructor(public body?: any, public init?: ResponseInit) {}
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }
  } as any
}

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock AWS SDK clients to avoid loading shared-ini-file-loader during tests
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn(),
}))

// Mock credential provider to prevent attempts to read credential files
jest.mock('@aws-sdk/credential-provider-node', () => ({
  fromIni: jest.fn(),
  fromEnv: jest.fn(),
  fromNodeProviderChain: jest.fn(),
}))

// Ensure HOME is defined in test env (some envs may not have it)
if (!process.env.HOME) process.env.HOME = '/tmp'