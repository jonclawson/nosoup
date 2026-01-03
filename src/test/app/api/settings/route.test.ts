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
    setting: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

describe('GET /api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', async () => {
    const { GET } = await import('@/app/api/settings/route')
    expect(GET).toBeDefined()
  })

  it('should return all settings', async () => {
    const mockSettings = [
      { key: 'siteName', value: 'My Site' },
      { key: 'siteDescription', value: 'A great site' },
    ]

    ;(prisma.setting.findMany as jest.Mock).mockResolvedValue(mockSettings)

    const { GET } = await import('@/app/api/settings/route')
    const result = await GET()

    expect(prisma.setting.findMany).toHaveBeenCalled()
    expect(NextResponse.json).toHaveBeenCalledWith(
      mockSettings,
      { status: 200 }
    )
  })

  it('should format settings correctly', async () => {
    const mockSettings = [
      { key: 'theme', value: 'dark', extra: 'ignored' },
      { key: 'language', value: 'en', extra: 'ignored' },
    ]

    ;(prisma.setting.findMany as jest.Mock).mockResolvedValue(mockSettings)

    const { GET } = await import('@/app/api/settings/route')
    await GET()

    const formattedSettings = [
      { key: 'theme', value: 'dark' },
      { key: 'language', value: 'en' },
    ]

    expect(NextResponse.json).toHaveBeenCalledWith(
      formattedSettings,
      expect.any(Object)
    )
  })

  it('should handle empty settings list', async () => {
    ;(prisma.setting.findMany as jest.Mock).mockResolvedValue([])

    const { GET } = await import('@/app/api/settings/route')
    await GET()

    expect(NextResponse.json).toHaveBeenCalledWith([], { status: 200 })
  })

  it('should return 500 on database error', async () => {
    const dbError = new Error('Database connection failed')
    ;(prisma.setting.findMany as jest.Mock).mockRejectedValue(dbError)

    const { GET } = await import('@/app/api/settings/route')
    await GET()

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  })
})

describe('POST /api/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', async () => {
    const { POST } = await import('@/app/api/settings/route')
    expect(POST).toBeDefined()
  })

  it('should create a new setting', async () => {
    const mockNewSetting = { key: 'newKey', value: 'newValue' }

    ;(prisma.setting.create as jest.Mock).mockResolvedValue(mockNewSetting)

    const formData = new FormData()
    formData.append('key', 'newKey')
    formData.append('value', 'newValue')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any

    const { POST } = await import('@/app/api/settings/route')
    await POST(mockRequest)

    expect(prisma.setting.create).toHaveBeenCalledWith({
      data: { key: 'newKey', value: 'newValue' },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { key: 'newKey', value: 'newValue' },
      { status: 201 }
    )
  })

  it('should extract key and value from form data', async () => {
    ;(prisma.setting.create as jest.Mock).mockResolvedValue({
      key: 'siteTitle',
      value: 'Test Site',
    })

    const formData = new FormData()
    formData.append('key', 'siteTitle')
    formData.append('value', 'Test Site')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any

    const { POST } = await import('@/app/api/settings/route')
    await POST(mockRequest)

    expect(mockRequest.formData).toHaveBeenCalled()
    expect(prisma.setting.create).toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    const dbError = new Error('Unique constraint failed')
    ;(prisma.setting.create as jest.Mock).mockRejectedValue(dbError)

    const formData = new FormData()
    formData.append('key', 'duplicate')
    formData.append('value', 'value')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any

    const { POST } = await import('@/app/api/settings/route')
    await POST(mockRequest)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  })

  it('should return 201 status on successful creation', async () => {
    ;(prisma.setting.create as jest.Mock).mockResolvedValue({
      key: 'testKey',
      value: 'testValue',
    })

    const formData = new FormData()
    formData.append('key', 'testKey')
    formData.append('value', 'testValue')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(formData),
    } as any

    const { POST } = await import('@/app/api/settings/route')
    await POST(mockRequest)

    const calls = (NextResponse.json as jest.Mock).mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[1]).toEqual({ status: 201 })
  })
})