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
    field: {
      findMany: jest.fn().mockResolvedValue([]),
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

    it('should write image files to disk when R2 is not enabled', async () => {
      delete process.env.R2_USE_R2
      const file = {
        arrayBuffer: async () => new Uint8Array([1,2,3]).buffer,
        name: '.png',
        type: 'image/png'
      }
      const fields = [{ type: 'image' }]

      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.menuTab.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.article.update as jest.Mock).mockResolvedValue(mockArticle)

      const form = {
        get: (k: string) => {
          if (k === 'title') return 'Updated Title'
          if (k === 'body') return 'Updated body'
          if (k === 'fields') return JSON.stringify(fields)
          if (k === 'tags') return '[]'
          if (k === 'published') return 'true'
          if (k === 'files[0]') return file
          return null
        }
      }

      const request = { formData: jest.fn().mockResolvedValue(form) } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
      const fs = await import('fs/promises')
      expect(fs.writeFile).toHaveBeenCalled()
    })

    it('should upload files to R2 when R2_USE_R2 is true and succeed', async () => {
      process.env.R2_USE_R2 = 'true'
      process.env.R2_BUCKET_NAME = 'test-bucket'

      const file = {
        arrayBuffer: async () => new Uint8Array([4,5,6]).buffer,
        name: '.png',
        type: 'image/png'
      }
      const fields = [{ type: 'image' }]

      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.menuTab.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.article.update as jest.Mock).mockResolvedValue(mockArticle)

      const client = await import('@aws-sdk/client-s3')
      // set send on prototype so existing s3Client instance (created at module init) has send
      client.S3Client.prototype.send = jest.fn().mockResolvedValue({})
      // ensure PutObjectCommand stores its input for inspection
      ;(client.PutObjectCommand as unknown as jest.Mock).mockImplementation(function (input: any) { (this as any).input = input; return this })

      const form = {
        get: (k: string) => {
          if (k === 'title') return 'Updated Title'
          if (k === 'body') return 'Updated body'
          if (k === 'fields') return JSON.stringify(fields)
          if (k === 'tags') return '[]'
          if (k === 'published') return 'true'
          if (k === 'files[0]') return file
          return null
        }
      }

      const request = { formData: jest.fn().mockResolvedValue(form) } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
      const clientModule = await import('@aws-sdk/client-s3')
      expect(clientModule.S3Client.prototype.send).toHaveBeenCalled()
      // inspect the command passed to send to ensure ContentType was set
      const sentCmd = clientModule.S3Client.prototype.send.mock.calls[0][0]
      expect(sentCmd.input).toBeDefined()
      expect(sentCmd.input.ContentType).toBe('image/png')
    })

    it('returns 500 if R2 upload fails', async () => {
      process.env.R2_USE_R2 = 'true'
      process.env.R2_BUCKET_NAME = 'test-bucket'

      const file = {
        arrayBuffer: async () => new Uint8Array([4,5,6]).buffer,
        name: '.png',
        type: 'image/png'
      }
      const fields = [{ type: 'image' }]

      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const client = await import('@aws-sdk/client-s3')
      // set send on prototype to simulate rejection
      client.S3Client.prototype.send = jest.fn().mockRejectedValue(new Error('upload fail'))
      ;(client.PutObjectCommand as unknown as jest.Mock).mockImplementation(function (input: any) { (this as any).input = input; return this })

      const form = {
        get: (k: string) => {
          if (k === 'title') return 'Updated Title'
          if (k === 'body') return 'Updated body'
          if (k === 'fields') return JSON.stringify(fields)
          if (k === 'tags') return '[]'
          if (k === 'published') return 'true'
          if (k === 'files[0]') return file
          return null
        }
      }

      const request = { formData: jest.fn().mockResolvedValue(form) } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(500)
      const clientModule = await import('@aws-sdk/client-s3')
      const sentCmd = clientModule.S3Client.prototype.send.mock.calls[0][0]
      expect(sentCmd.input.ContentType).toBe('image/png')
    })

    it('returns 500 if file processing throws', async () => {
      delete process.env.R2_USE_R2
      const badFile = {
        arrayBuffer: async () => { throw new Error('boom') },
        name: '.png',
        type: 'image/png'
      }
      const fields = [{ type: 'image' }]

      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)

      const form = {
        get: (k: string) => {
          if (k === 'title') return 'Updated Title'
          if (k === 'body') return 'Updated body'
          if (k === 'fields') return JSON.stringify(fields)
          if (k === 'tags') return '[]'
          if (k === 'published') return 'true'
          if (k === 'files[0]') return badFile
          return null
        }
      }

      const request = { formData: jest.fn().mockResolvedValue(form) } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(500)
    })

    it('returns 404 when update throws P2025', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.update as jest.Mock).mockRejectedValue({ code: 'P2025' })

      const form = {
        get: (k: string) => {
          if (k === 'title') return 'Updated Title'
          if (k === 'body') return 'Updated body'
          if (k === 'fields') return '[]'
          if (k === 'tags') return '[]'
          if (k === 'published') return 'true'
          return null
        }
      }

      const request = { formData: jest.fn().mockResolvedValue(form) } as any
      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(404)
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

    it('allows admin to delete any article', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'admin', role: 'admin' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.delete as jest.Mock).mockResolvedValue(mockArticle)

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(200)
    })

    it('returns 404 when delete throws P2025', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user1' } })
      ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
      ;(prisma.article.delete as jest.Mock).mockRejectedValue({ code: 'P2025' })

      const request = new NextRequest('http://localhost/api/articles/1', { method: 'DELETE' })
      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) })

      expect(response.status).toBe(404)
    })
  })
})