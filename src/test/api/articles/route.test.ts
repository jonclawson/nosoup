import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/articles/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import fs from 'fs/promises'
import path from 'path'

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => {
    return {
      url,
      ...init,
      formData: () => Promise.resolve(init?.body || new FormData()),
    }
  }),
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
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}))

jest.mock('path', () => ({
  join: jest.fn(),
}))

describe('/api/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return articles with pagination', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Test Article',
          body: 'Test Body',
          published: true,
          sticky: false,
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          author: { id: '1', name: 'Test User', email: 'test@example.com' },
          fields: [],
          tags: [],
        },
      ]
      const mockTotal = 1

      ;(prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles)
      ;(prisma.article.count as jest.Mock).mockResolvedValue(mockTotal)
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/articles?page=1&size=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
      expect(data.pagination).toEqual({
        page: 1,
        size: 10,
        total: 1,
        totalPages: 1,
      })
      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            {},
            { OR: [] },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fields: {
            select: {
              id: true,
              type: true,
              value: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          {},
          { createdAt: 'desc' },
        ],
        skip: 0,
        take: 10,
      })
    })

    it('should filter by published when user is not authenticated', async () => {
      ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/articles?published=true')
      await GET(request)

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {},
              {
                OR: [
                  { published: true },
                  { AND: [{}, { published: true }] },
                ],
              },
            ],
          },
        })
      )
    })

    it('should include unpublished articles for author when authenticated', async () => {
      ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { id: '1' },
      })

      const request = new NextRequest('http://localhost:3000/api/articles?published=false')
      await GET(request)

      expect(prisma.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              {},
              {
                OR: [
                  { published: true },
                  {
                    AND: [
                      { authorId: '1' },
                      { published: false },
                    ],
                  },
                ],
              },
            ],
          },
        })
      )
    })

    it('should handle errors', async () => {
      ;(prisma.article.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const request = new NextRequest('http://localhost:3000/api/articles')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch articles')
    })
  })

  describe('POST', () => {
    it('should create a new article successfully', async () => {
      const mockSession = { user: { id: '1' } }
      const mockArticle = {
        id: '1',
        title: 'New Article',
        body: 'New Body',
        published: true,
        sticky: false,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: '1', name: 'Test User', email: 'test@example.com' },
        fields: [],
        tags: [],
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.article.create as jest.Mock).mockResolvedValue(mockArticle)
      ;(path.join as jest.Mock).mockReturnValue('/uploads/test.jpg')
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)

      const formData = new FormData()
      formData.append('title', 'New Article')
      formData.append('body', 'New Body')
      formData.append('published', 'true')
      formData.append('fields', '[]')
      formData.append('tags', '[]')

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: formData,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('New Article')
      expect(prisma.article.create).toHaveBeenCalledWith({
        data: {
          title: 'New Article',
          body: 'New Body',
          authorId: '1',
          published: true,
          sticky: false,
          featured: false,
          fields: {
            create: [],
          },
          tags: {
            create: [],
          },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          fields: {
            select: {
              id: true,
              type: true,
              value: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    })

    it('should handle file uploads', async () => {
      const mockSession = { user: { id: '1' } }
      const mockArticle = {
        id: '1',
        title: 'Article with Image',
        body: 'Body',
        published: true,
        sticky: false,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: '1', name: 'Test User', email: 'test@example.com' },
        fields: [{ id: '1', type: 'image', value: '/uploads/test.jpg' }],
        tags: [],
      }

      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.article.create as jest.Mock).mockResolvedValue(mockArticle)
      ;(path.join as jest.Mock).mockReturnValue('/uploads/test.jpg')
      ;(fs.mkdir as jest.Mock).mockResolvedValue(undefined)
      ;(fs.writeFile as jest.Mock).mockResolvedValue(undefined)

      const file = { arrayBuffer: () => Promise.resolve(Buffer.from('test')), name: 'test.jpg' }
      const mockFormData = {
        get: jest.fn((key) => {
          if (key === 'title') return 'Article with Image'
          if (key === 'body') return 'Body'
          if (key === 'published') return 'true'
          if (key === 'fields') return '[{"type": "image", "value": ""}]'
          if (key === 'tags') return '[]'
          if (key === 'files[0]') return file
        })
      }

      const request = NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: mockFormData,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(fs.writeFile).toHaveBeenCalled()
      expect(data.fields[0].value).toBe('/uploads/test.jpg')
    })

    it('should return 401 if not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('title', 'Test')
      formData.append('body', 'Test')

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: formData,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 400 if title or body is missing', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })

      const formData = new FormData()
      formData.append('title', '')
      formData.append('body', 'Test')

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: formData,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and body are required')
    })

    it('should handle creation errors', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })
      ;(prisma.article.create as jest.Mock).mockRejectedValue(new Error('DB Error'))

      const formData = new FormData()
      formData.append('title', 'Test')
      formData.append('body', 'Test')
      formData.append('fields', '[]')
      formData.append('tags', '[]')

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        body: formData,
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create article')
    })
  })
})
