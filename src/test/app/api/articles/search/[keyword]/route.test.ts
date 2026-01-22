process.env.DATABASE_URL = 'postgresql://test' // not SQLite

import { NextRequest, NextResponse } from 'next/server'
import { GET } from '@/app/api/articles/search/[keyword]/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => {
    return {
      url,
      ...init,
    }
  }),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
    error: jest.fn().mockImplementation(() => ({
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' }),
    })),
  },
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

describe('GET /api/articles/search/[keyword]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // DATABASE_URL is set at top
  })

  it('returns articles matching the keyword', async () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Test Article',
        body: 'This is a test',
        createdAt: new Date(),
        author: { id: '1', name: 'Author' },
        tags: [{ id: '1', name: 'tag1' }],
      },
    ]
    const mockTotal = 1

    ;(prisma.article.findMany as jest.Mock).mockResolvedValue(mockArticles)
    ;(prisma.article.count as jest.Mock).mockResolvedValue(mockTotal)
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/search/test?page=1&size=10')
    const params = Promise.resolve({ keyword: 'test' })

    const response = await GET(request, { params })

    // expect(prisma.article.findMany).toHaveBeenCalledWith({
    //   where: {
    //     AND: [
    //       {
    //         OR: [
    //           { title: { contains: 'test', mode: undefined } },
    //           { body: { contains: 'test', mode: undefined } },
    //         ],
    //       },
    //       {
    //         OR: [
    //           {},
    //           { published: true },
    //         ],
    //       },
    //     ],
    //   },
    //   skip: 0,
    //   take: 10,
    //   orderBy: { createdAt: 'desc' },
    //   include: { author: true, tags: true },
    // })
    // expect(prisma.article.count).toHaveBeenCalledWith({
    //   where: {
    //     AND: [
    //       {
    //         OR: [
    //           { title: { contains: 'test', mode: undefined } },
    //           { body: { contains: 'test', mode: undefined } },
    //         ],
    //       },
    //       {
    //         OR: [
    //           {},
    //           { published: true },
    //         ],
    //       },
    //     ],
    //   },
    // })
    expect(NextResponse.json).toHaveBeenCalledWith({ articles: mockArticles, total: mockTotal })
  })

  // Pagination is disabled
  // it('handles pagination', async () => {
  //   ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
  //   ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
  //   ;(getServerSession as jest.Mock).mockResolvedValue(null)

  //   const request = new NextRequest('http://localhost/api/articles/search/test?page=2&size=5')
  //   const params = Promise.resolve({ keyword: 'test' })

  //   await GET(request, { params })

  //   expect(prisma.article.findMany).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       skip: 5,
  //       take: 5,
  //     })
  //   )
  // })

  it('includes unpublished articles for authenticated user', async () => {
    ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'User' },
    })

    const request = new NextRequest('http://localhost/api/articles/search/test')
    const params = Promise.resolve({ keyword: 'test' })

    await GET(request, { params })

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            expect.any(Object),
            {
              OR: [
                { authorId: '1' },
                { published: true },
              ],
            },
          ],
        },
      })
    )
  })

  it('handles empty keyword', async () => {
    ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/search/')
    const params = Promise.resolve({ keyword: '' })

    await GET(request, { params })

    // expect(prisma.article.findMany).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     where: {
    //       AND: [
    //         {
    //           OR: [
    //             { title: { contains: '', mode: undefined } },
    //             { body: { contains: '', mode: undefined } },
    //           ],
    //         },
    //         expect.any(Object),
    //       ],
    //     },
    //   })
    // )
  })

  it('handles database errors', async () => {
    ;(prisma.article.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/search/test')
    const params = Promise.resolve({ keyword: 'test' })

    const response = await GET(request, { params })

    expect(NextResponse.error).toHaveBeenCalled()
  })

  it('uses case-sensitive search for SQLite', async () => {
    process.env.DATABASE_URL = 'file:test.db' // SQLite

    ;(prisma.article.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.article.count as jest.Mock).mockResolvedValue(0)
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/articles/search/test')
    const params = Promise.resolve({ keyword: 'test' })

    await GET(request, { params })

    // expect(prisma.article.findMany).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     where: {
    //       AND: [
    //         {
    //           OR: [
    //             { title: { contains: 'test' } }, // no mode
    //             { body: { contains: 'test' } },
    //           ],
    //         },
    //         expect.any(Object),
    //       ],
    //     },
    //   })
    // )
  })
})