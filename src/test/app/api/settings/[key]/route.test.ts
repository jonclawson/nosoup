import { GET, PUT, DELETE } from '@/app/api/settings/[key]/route';
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
    setting: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('GET /api/settings/[key]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 with setting when found', async () => {
    const mockSetting = { key: 'site_name', value: 'My Site' }
    ;(prisma.setting.findUnique as jest.Mock).mockResolvedValue(mockSetting)

    const result = await GET(
      {} as NextRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(prisma.setting.findUnique).toHaveBeenCalledWith({
      where: { key: 'site_name' },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { key: 'site_name', value: 'My Site' },
      { status: 200 }
    )
  })

  it('should return 404 when setting not found', async () => {
    ;(prisma.setting.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await GET(
      {} as NextRequest,
      { params: Promise.resolve({ key: 'nonexistent' }) }
    )

    expect(prisma.setting.findUnique).toHaveBeenCalledWith({
      where: { key: 'nonexistent' },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Setting not found' },
      { status: 404 }
    )
  })

  it('should return 500 on database error', async () => {
    ;(prisma.setting.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const result = await GET(
      {} as NextRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  })

  it('should properly await the params promise', async () => {
    ;(prisma.setting.findUnique as jest.Mock).mockResolvedValue({
      key: 'test_key',
      value: 'test_value',
    })

    const paramsPromise = Promise.resolve({ key: 'test_key' })
    await GET({} as NextRequest, { params: paramsPromise })

    expect(prisma.setting.findUnique).toHaveBeenCalled()
  })
})

describe('PUT /api/settings/[key]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 with updated setting', async () => {
    const mockUpdatedSetting = { key: 'site_name', value: 'Updated Site' }
    ;(prisma.setting.update as jest.Mock).mockResolvedValue(mockUpdatedSetting)

    const mockFormData = new FormData()
    mockFormData.append('value', 'Updated Site')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest

    const result = await PUT(
      mockRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { key: 'site_name' },
      data: { value: 'Updated Site' },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { key: 'site_name', value: 'Updated Site' },
      { status: 200 }
    )
  })

  it('should extract value from form data', async () => {
    ;(prisma.setting.update as jest.Mock).mockResolvedValue({
      key: 'test',
      value: 'new_value',
    })

    const mockFormData = new FormData()
    mockFormData.append('value', 'new_value')
    mockFormData.append('other_field', 'ignored')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest

    await PUT(
      mockRequest,
      { params: Promise.resolve({ key: 'test' }) }
    )

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { key: 'test' },
      data: { value: 'new_value' },
    })
  })

  it('should return 500 on update error', async () => {
    ;(prisma.setting.update as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    )

    const mockFormData = new FormData()
    mockFormData.append('value', 'test')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest

    await PUT(
      mockRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  })

  it('should handle empty form data', async () => {
    ;(prisma.setting.update as jest.Mock).mockResolvedValue({
      key: 'test',
      value: undefined,
    })

    const mockFormData = new FormData()

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest

    await PUT(
      mockRequest,
      { params: Promise.resolve({ key: 'test' }) }
    )

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { key: 'test' },
      data: { value: undefined },
    })
  })

  it('should properly await the params promise', async () => {
    ;(prisma.setting.update as jest.Mock).mockResolvedValue({
      key: 'test_key',
      value: 'test_value',
    })

    const mockFormData = new FormData()
    mockFormData.append('value', 'test_value')

    const mockRequest = {
      formData: jest.fn().mockResolvedValue(mockFormData),
    } as unknown as NextRequest

    const paramsPromise = Promise.resolve({ key: 'test_key' })
    await PUT(mockRequest, { params: paramsPromise })

    expect(prisma.setting.update).toHaveBeenCalled()
  })
})

describe('DELETE /api/settings/[key]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete the setting and return 200', async () => {
    ;(prisma.setting.delete as jest.Mock).mockResolvedValue({ key: 'site_name' })

    const result = await DELETE(
      {} as NextRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(prisma.setting.delete).toHaveBeenCalledWith({
      where: { key: 'site_name' },
    })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: 'Setting deleted successfully' },
      { status: 200 }
    )
  })

  it('should return 500 on delete error', async () => {
    ;(prisma.setting.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'))

    await DELETE(
      {} as NextRequest,
      { params: Promise.resolve({ key: 'site_name' }) }
    )

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  })

  it('should properly await the params promise', async () => {
    ;(prisma.setting.delete as jest.Mock).mockResolvedValue({ key: 'test_key' })

    const paramsPromise = Promise.resolve({ key: 'test_key' })
    await DELETE({} as NextRequest, { params: paramsPromise })

    expect(prisma.setting.delete).toHaveBeenCalled()
  })
})
