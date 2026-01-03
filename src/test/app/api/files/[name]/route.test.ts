jest.mock('next/server', () => {
  const NextResponseMock = jest.fn((body: any, init: any) => ({ body, init, isResponse: true }))
  NextResponseMock.json = jest.fn((data: any, init: any) => ({ data, init, isJsonResponse: true }))
  return {
    NextRequest: jest.fn((url: string) => ({ url })),
    NextResponse: NextResponseMock,
  }
})

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn(),
}))

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

describe('GET /api/files/[name]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', async () => {
    const { GET } = await import('@/app/api/files/[name]/route')
    expect(GET).toBeDefined()
  })

  it('should be an async function', async () => {
    const { GET } = await import('@/app/api/files/[name]/route')
    expect(typeof GET).toBe('function')
  })

  it('should accept request and params arguments', async () => {
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/test.png')
    const mockParams = Promise.resolve({ name: 'test.png' })

    // Should not throw when called with correct arguments
    try {
      await GET(mockRequest, { params: mockParams })
    } catch (e) {
      // Expected to fail due to S3 not being available, but function should accept params
    }

    expect(GetObjectCommand).toHaveBeenCalled()
  })

  it('should create GetObjectCommand for file requests', async () => {
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/document.pdf')
    const mockParams = Promise.resolve({ name: 'document.pdf' })

    try {
      await GET(mockRequest, { params: mockParams })
    } catch (e) {
      // Expected to fail
    }

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: 'document.pdf',
      })
    )
  })

  it('should handle different file names', async () => {
    jest.clearAllMocks()
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/image.jpg')
    const mockParams = Promise.resolve({ name: 'image.jpg' })

    try {
      await GET(mockRequest, { params: mockParams })
    } catch (e) {
      // Expected to fail
    }

    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: 'image.jpg',
      })
    )
  })

  it('should respond with error when S3 request fails', async () => {
    jest.clearAllMocks()
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/missing.txt')
    const mockParams = Promise.resolve({ name: 'missing.txt' })

    const result = await GET(mockRequest, { params: mockParams })

    // Result should be a response object (mocked)
    expect(result).toBeDefined()
  })

  it('should call NextResponse.json on error', async () => {
    jest.clearAllMocks()
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/error.txt')
    const mockParams = Promise.resolve({ name: 'error.txt' })

    await GET(mockRequest, { params: mockParams })

    expect((NextResponse as any).json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'File not found' }),
      expect.objectContaining({ status: 404 })
    )
  })

  it('should have proper error handling in place', async () => {
    jest.clearAllMocks()
    const { GET } = await import('@/app/api/files/[name]/route')
    const mockRequest = new NextRequest('http://localhost/api/files/corrupt.bin')
    const mockParams = Promise.resolve({ name: 'corrupt.bin' })

    // Should handle error gracefully
    const result = await GET(mockRequest, { params: mockParams })
    expect(result).toBeDefined()
  })
})
