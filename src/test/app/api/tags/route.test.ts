import { GET } from '@/app/api/tags/route';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('next/server', () => {
  const NextResponseMock = jest.fn((data: any, init: any) => ({ data, init, isResponse: true }))
  NextResponseMock.json = jest.fn((data: any, init: any) => ({ data, init, isJsonResponse: true }))
  return {
    NextRequest: jest.fn(),
    NextResponse: NextResponseMock,
  }
})

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      findMany: jest.fn(),
    },
  },
}))

describe('GET /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return all tags ordered alphabetically', async () => {
    const mockTags = [
      { id: 1, name: 'javascript' },
      { id: 2, name: 'react' },
      { id: 3, name: 'typescript' },
    ]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    const result = await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(mockTags)
  })

  it('should filter tags by search parameter (non-sqlite and sqlite differences)', async () => {
    const mockTags = [
      { id: 1, name: 'javascript' },
      { id: 2, name: 'react' },
    ]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('search=java'),
      },
    } as unknown as NextRequest

    // non-SQLite: should include mode: 'insensitive'
    delete process.env.DATABASE_URL
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'java',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })

    ;(prisma.tag.findMany as jest.Mock).mockClear()

    // SQLite: DATABASE_URL starts with 'file:' — mode should be omitted
    process.env.DATABASE_URL = 'file:dev.db'
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'java',
        },
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })

    delete process.env.DATABASE_URL
  })

  it('should perform case-insensitive search (non-sqlite and sqlite differences)', async () => {
    const mockTags = [{ id: 2, name: 'react' }]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('search=REACT'),
      },
    } as unknown as NextRequest

    // non-SQLite
    delete process.env.DATABASE_URL
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'REACT',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })

    ;(prisma.tag.findMany as jest.Mock).mockClear()

    // SQLite
    process.env.DATABASE_URL = 'file:dev.db'
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      where: {
        name: {
          contains: 'REACT',
        },
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })

    delete process.env.DATABASE_URL
  })

  it('should return empty array when no tags match search', async () => {
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue([])

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('search=nonexistent'),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith([])
  })

  it('should select only name field from tags', async () => {
    const mockTags = [{ id: 1, name: 'javascript' }]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    const callArgs = (prisma.tag.findMany as jest.Mock).mock.calls[0][0]
    expect(callArgs.select).toEqual({ id: true, name: true })
  })

  it('should return distinct tag names', async () => {
    const mockTags = [
      { id: 1, name: 'javascript' },
      { id: 2, name: 'react' },
      { id: 3, name: 'typescript' },
    ]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    const callArgs = (prisma.tag.findMany as jest.Mock).mock.calls[0][0]
    expect(callArgs.distinct).toEqual(['name'])
  })

  it('should order results alphabetically by name ascending', async () => {
    const mockTags = [
      { id: 1, name: 'javascript' },
      { id: 2, name: 'react' },
      { id: 3, name: 'typescript' },
    ]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    const callArgs = (prisma.tag.findMany as jest.Mock).mock.calls[0][0]
    expect(callArgs.orderBy).toEqual({ name: 'asc' })
  })

  it('should return 500 on database error', async () => {
    ;(prisma.tag.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  })

  it('should handle search parameter with special characters (non-sqlite and sqlite differences)', async () => {
    const mockTags = [{ id: 4, name: 'c++' }]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams('search=c%2B%2B'),
      },
    } as unknown as NextRequest

    // non-SQLite
    delete process.env.DATABASE_URL
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        name: {
          contains: 'c++',
          mode: 'insensitive',
        },
      },
    }))

    ;(prisma.tag.findMany as jest.Mock).mockClear()

    // SQLite
    process.env.DATABASE_URL = 'file:dev.db'
    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        name: {
          contains: 'c++',
        },
      },
    }))

    delete process.env.DATABASE_URL
  })

  it('should handle missing search parameter as empty string', async () => {
    const mockTags = [
      { id: 1, name: 'javascript' },
      { id: 2, name: 'react' },
    ]
    ;(prisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags)

    const mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams(),
      },
    } as unknown as NextRequest

    await GET(mockRequest)

    expect(prisma.tag.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    })
  })
})
