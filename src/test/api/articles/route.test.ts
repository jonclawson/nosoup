import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/articles/route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// Mock NextAuth
jest.mock('next-auth')
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

// Mock Prisma
jest.mock('../../../lib/prisma')
const mockPrisma = prisma as any

describe('/api/articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all articles with author information', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Test Article 1',
          body: 'Test body 1',
          authorId: 'user1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          author: {
            id: 'user1',
            name: 'Test User 1',
            email: 'test1@example.com'
          }
        },
        {
          id: '2',
          title: 'Test Article 2',
          body: 'Test body 2',
          authorId: 'user2',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
          author: {
            id: 'user2',
            name: 'Test User 2',
            email: 'test2@example.com'
          }
        }
      ]

      mockPrisma.article.findMany.mockResolvedValue(mockArticles)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0]).toEqual({
        ...mockArticles[0],
        createdAt: mockArticles[0].createdAt.toISOString(),
        updatedAt: mockArticles[0].updatedAt.toISOString()
      })
      expect(data[1]).toEqual({
        ...mockArticles[1],
        createdAt: mockArticles[1].createdAt.toISOString(),
        updatedAt: mockArticles[1].updatedAt.toISOString()
      })
      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    it('should return empty array when no articles exist', async () => {
      mockPrisma.article.findMany.mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.article.findMany.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch articles' })
    })
  })

  describe('POST', () => {
    const mockSession = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      }
    }

    const validArticleData = {
      title: 'Test Article',
      body: 'Test article body content'
    }

    it('should create a new article when user is authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const mockCreatedArticle = {
        id: 'new-article-id',
        title: validArticleData.title,
        body: validArticleData.body,
        authorId: mockSession.user.id,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        author: {
          id: mockSession.user.id,
          name: mockSession.user.name,
          email: mockSession.user.email
        }
      }

      mockPrisma.article.create.mockResolvedValue(mockCreatedArticle)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validArticleData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        ...mockCreatedArticle,
        createdAt: mockCreatedArticle.createdAt.toISOString(),
        updatedAt: mockCreatedArticle.updatedAt.toISOString()
      })
      expect(mockPrisma.article.create).toHaveBeenCalledWith({
        data: {
          title: validArticleData.title,
          body: validArticleData.body,
          authorId: mockSession.user.id
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validArticleData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Authentication required' })
    })

    it('should return 400 when title is missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: 'Test body without title'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Title and body are required' })
    })

    it('should return 400 when body is missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test title without body'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Title and body are required' })
    })

    it('should return 400 when both title and body are missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Title and body are required' })
    })

    it('should handle database errors gracefully', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)
      mockPrisma.article.create.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validArticleData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create article' })
    })

    it('should handle invalid JSON in request body', async () => {
      mockGetServerSession.mockResolvedValue(mockSession as any)

      const request = new NextRequest('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create article' })
    })
  })
}) 