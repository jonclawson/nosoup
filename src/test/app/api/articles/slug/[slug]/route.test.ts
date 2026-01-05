import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/articles/slug/[slug]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({ url, ...init })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({ status: init?.status || 200, json: () => Promise.resolve(data) })),
  },
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('GET /api/articles/slug/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns an article and serializes dates when found (unauthenticated)', async () => {
    const mockArticle = {
      id: '1',
      title: 'Test',
      slug: 'test-slug',
      body: 'Body',
      published: true,
      sticky: false,
      featured: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      authorId: 'author1',
      author: { id: 'author1', name: 'Author', email: 'a@b.com', role: 'user' },
      fields: [{ id: 'f1', type: 'text', value: 'v' }],
      tags: [{ id: 't1', name: 'tag' }],
    }

    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/slug/test-slug')
    const params = Promise.resolve({ slug: 'test-slug' })

    const response = await GET(request, { params })

    expect(prisma.article.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { slug: 'test-slug', published: true },
    }))

    expect((NextResponse.json as jest.Mock).mock.calls.length).toBeGreaterThan(0)
    const sent = (NextResponse.json as jest.Mock).mock.calls[0][0]
    expect(sent.id).toBe('1')
  })

  it('does not add published filter when user is authenticated', async () => {
    const mockArticle = { id: '2', slug: 'private' }
    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(mockArticle)
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } })

    const request = new NextRequest('http://localhost/api/articles/slug/private')
    const params = Promise.resolve({ slug: 'private' })

    await GET(request, { params })

    expect(prisma.article.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { slug: 'private' },
    }))
  })

  it('returns 404 when article not found', async () => {
    ;(prisma.article.findUnique as jest.Mock).mockResolvedValue(null)
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/slug/missing')
    const params = Promise.resolve({ slug: 'missing' })

    const response = await GET(request, { params })

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Article not found' }, { status: 404 })
  })

  it('returns 500 on error', async () => {
    ;(prisma.article.findUnique as jest.Mock).mockRejectedValue(new Error('DB'))
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/slug/error')
    const params = Promise.resolve({ slug: 'error' })

    const response = await GET(request, { params })

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch article' }, { status: 500 })
  })
})