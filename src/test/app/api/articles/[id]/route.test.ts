import { NextRequest, NextResponse } from 'next/server'
import { GET, PUT, DELETE } from '@/app/api/articles/[id]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string
    constructor(url: string, init?: any) {
      this.url = url
      Object.assign(this, init)
    }
    formData() {
      return Promise.resolve(this.body || new FormData())
    }
  },
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => {
      return {
        status: init?.status || 200,
        json: () => Promise.resolve(data),
      }
    }),
  },
}))

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    menuTab: {
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}))

jest.mock('path', () => ({
  join: jest.fn(() => '/mock/path'),
}))

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}))

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
}))

jest.mock('slugify', () => jest.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')))

describe('/api/articles/[id]/route', () => {
  const mockArticle = {
    id: '1',
    title: 'Test Article',
    slug: 'test-article',
    body: 'Test body',
    published: true,
    sticky: false,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user1',
    author: { id: 'user1', name: 'Test User', email: 'test@example.com', role: 'user' },
    fields: [{ id: 'field1', type: 'text', value: 'value' }],
    tags: [{ id: 'tag1', name: 'tag1' }],
    tab: { id: 'tab1', name: 'tab1', link: '/test-article', order: 1 },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return article for authenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const request = {} as NextRequest
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.title).toBe('Test Article')
    })

    it('should return published article for unauthenticated user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const request = {} as NextRequest
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
    })

    it('should return 404 if article not found', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

      const request = {} as NextRequest
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(404)
    })

    it('should return 500 on error', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

      const request = {} as NextRequest
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(500)
    })
  })

  describe('PUT', () => {
    const formData = new FormData()
    formData.append('title', 'Updated Title')
    formData.append('body', 'Updated body')
    formData.append('fields', '[]')
    formData.append('tags', '[]')
    formData.append('published', 'true')

    it('should update article successfully', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.menuTab.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.article.update as jest.Mock).mockResolvedValue(mockArticle)

      const request = {
        formData: jest.fn().mockResolvedValue(formData)
      } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = {
        formData: jest.fn().mockResolvedValue(formData)
      } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('should return 404 if article not found', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(404)
    })

    it('should return 403 if not author', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user2' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: formData,
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(403)
    })

    it('should return 400 if title or body missing', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const badFormData = new FormData()
      badFormData.append('title', '')
      badFormData.append('body', 'body')

      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: badFormData,
      })
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE', () => {
    it('should delete article successfully', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1', role: 'user' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.delete as jest.Mock).mockResolvedValue(mockArticle)

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(401)
    })

    it('should return 404 if article not found', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(404)
    })

    it('should return 403 if not author and user role', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user2', role: 'user' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(403)
    })
  })
})