
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

  const S3Client = jest.fn().mockImplementation(() => ({ send: sendMock }))

  return {
    __esModule: true,
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    __sendMock: sendMock,
  }
})

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

  test('upload sends a PutObjectCommand with default bucket and returns result', async () => {
    const { __sendMock, PutObjectCommand } = (await import('@aws-sdk/client-s3')) as any
    const { default: fileStorage } = await import('../../lib/file-storage')

    const result = { ETag: 'abc' }
    __sendMock.mockResolvedValueOnce(result)

    await expect(fileStorage.uploadFile('path/to/key', 'hello', {fileType: 'image/png'})).resolves.toEqual(result)

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
})
