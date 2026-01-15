
jest.mock('@aws-sdk/client-s3', () => {
  const sendMock = jest.fn()

  class PutObjectCommand {
    input: any
    constructor(input: any) {
      this.input = input
    }
  }
  class GetObjectCommand {
    input: any
    constructor(input: any) {
      this.input = input
    }
  }
  class DeleteObjectCommand {
    input: any
    constructor(input: any) {
      this.input = input
    }
  }
  class DeleteObjectsCommand {
    input: any
    constructor(input: any) {
      this.input = input
    }
  }

  const S3Client = jest.fn().mockImplementation(() => ({ send: sendMock }))

  return {
    __esModule: true,
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    __sendMock: sendMock,
  }
})

// Mock fs operations so tests can assert local file handling without touching disk
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  unlink: jest.fn(),
}))

describe('fileStorage (src/lib/file-storage.ts)', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    process.env.R2_BUCKET_NAME = 'test-bucket'
    process.env.R2_ACCOUNT_ID = 'acct'
    process.env.R2_ACCESS_KEY_ID = 'ak'
    process.env.R2_SECRET_ACCESS_KEY = 'sk'
    process.env.NODE_ENV = 'test'


    delete (global as any).s3Client
  })

  afterAll(() => {
    process.env = ORIGINAL_ENV
  })

  test('upload sends a PutObjectCommand with default bucket and sets ContentType', async () => {
    process.env.R2_USE_R2 = 'true'
    const { __sendMock, PutObjectCommand } = (await import('@aws-sdk/client-s3')) as any
    const { default: fileStorage } = await import('../../lib/file-storage')

    __sendMock.mockResolvedValueOnce({ ETag: 'abc' })

    // uploadFile doesn't return the S3 response, it returns undefined on success
    await expect(fileStorage.uploadFile('path/to/key', 'hello', {fileType: 'image/png'})).resolves.toBeUndefined()

    expect(__sendMock).toHaveBeenCalledTimes(1)
    const cmd = __sendMock.mock.calls[0][0]
    expect(cmd).toBeInstanceOf(PutObjectCommand)
    expect(cmd.input).toMatchObject({ Bucket: 'test-bucket', Key: 'path/to/key', Body: 'hello', ContentType: 'image/png' })
  })

  test('download sends a GetObjectCommand with provided bucket and returns result', async () => {
    const { __sendMock, GetObjectCommand } = (await import('@aws-sdk/client-s3')) as any
    const { default: fileStorage } = await import('../../lib/file-storage')

    const result = { Body: 'file-contents' }
    __sendMock.mockResolvedValueOnce(result)

    await expect(fileStorage.downloadFile('key', { bucket: 'other-bucket' })).resolves.toEqual(result)

    expect(__sendMock).toHaveBeenCalledTimes(1)
    const cmd = __sendMock.mock.calls[0][0]
    expect(cmd).toBeInstanceOf(GetObjectCommand)
    expect(cmd.input).toMatchObject({ Bucket: 'other-bucket', Key: 'key' })
  })

  test('uploadFile writes local file when R2 not enabled', async () => {
    // ensure R2 is not used
    delete process.env.R2_USE_R2
    const fs = await import('fs/promises') as any
    fs.writeFile.mockResolvedValueOnce(undefined)

    const { __sendMock } = (await import('@aws-sdk/client-s3')) as any
    __sendMock.mockClear()

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.uploadFile('local.png', Buffer.from('ok'))).resolves.toBeUndefined()

    expect(fs.writeFile).toHaveBeenCalled()
    expect(__sendMock).not.toHaveBeenCalled()
  })

  test('uploadFile uploads to R2 when enabled and sets ContentType', async () => {
    process.env.R2_USE_R2 = 'true'
    process.env.R2_BUCKET_NAME = 'test-bucket'

    const { __sendMock, PutObjectCommand } = (await import('@aws-sdk/client-s3')) as any
    // make send return success and ensure PutObjectCommand captures input
    __sendMock.mockResolvedValueOnce({ ETag: 'etag' })
    ;(PutObjectCommand as jest.Mock) ??= (PutObjectCommand as any)

    const { default: fileStorage } = await import('../../lib/file-storage')

    const result = await fileStorage.uploadFile('r2.png', Buffer.from('ok'), { fileType: 'image/png' })
    expect(result).toBeUndefined() // uploadFile doesn't return value on success

    expect(__sendMock).toHaveBeenCalled()
    const sentCmd = __sendMock.mock.calls[0][0]
    expect(sentCmd.input.ContentType).toBe('image/png')
  })

  test('uploadFile throws if R2 upload fails', async () => {
    process.env.R2_USE_R2 = 'true'
    const { __sendMock } = (await import('@aws-sdk/client-s3')) as any
    __sendMock.mockRejectedValueOnce(new Error('upload fail'))

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.uploadFile('r2.png', Buffer.from('ok'))).rejects.toThrow('upload fail')
  })

  test('deleteFile removes local file when R2 not enabled', async () => {
    delete process.env.R2_USE_R2
    const fs = await import('fs/promises') as any
    fs.unlink.mockResolvedValueOnce(undefined)

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.deleteFile('local.png')).resolves.toBeUndefined()
    expect(fs.unlink).toHaveBeenCalled()
  })

  test('deleteFile calls R2 delete when enabled', async () => {
    process.env.R2_USE_R2 = 'true'
    const { __sendMock, DeleteObjectCommand } = (await import('@aws-sdk/client-s3')) as any
    __sendMock.mockResolvedValueOnce({})

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.deleteFile('r2.png')).resolves.toEqual({})
    expect(__sendMock).toHaveBeenCalled()
    const sentCmd = __sendMock.mock.calls[0][0]
    expect(sentCmd).toBeInstanceOf(DeleteObjectCommand)
  })

  test('deleteFiles deletes multiple locally and continues on error', async () => {
    delete process.env.R2_USE_R2
    const fs = await import('fs/promises') as any
    fs.unlink
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('nope'))
      .mockResolvedValueOnce(undefined)

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.deleteFiles(['a.png', 'b.png', 'c.png'])).resolves.toBeUndefined()
    expect(fs.unlink).toHaveBeenCalledTimes(3)
  })

  test('deleteFiles calls R2 DeleteObjects when enabled', async () => {
    process.env.R2_USE_R2 = 'true'
    process.env.R2_BUCKET_NAME = 'test-bucket'
    const { __sendMock, DeleteObjectsCommand } = (await import('@aws-sdk/client-s3')) as any
    __sendMock.mockResolvedValueOnce({})

    const { default: fileStorage } = await import('../../lib/file-storage')

    await expect(fileStorage.deleteFiles(['a.png', 'b.png'])).resolves.toBeUndefined()
    expect(__sendMock).toHaveBeenCalled()
    const sentCmd = __sendMock.mock.calls[0][0]
    expect(sentCmd).toBeInstanceOf(DeleteObjectsCommand)
  })
})
