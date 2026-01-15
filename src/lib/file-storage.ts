import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const S3_BUCKET = process.env.R2_BUCKET_NAME!
const S3_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const S3_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const S3_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const S3_REGION = 'auto' // R2 uses 'auto'

const globalForS3 = global as unknown as { s3Client: S3Client }

const s3Client = 
  globalForS3.s3Client || new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
})
if (process.env.NODE_ENV !== "production") globalForS3.s3Client = s3Client


const s3Upload = ( key: string, body: Buffer | Uint8Array | Blob | string, options?: { bucket?: string, fileType?: string }) => {
  const command = new PutObjectCommand({
    Bucket: options?.bucket || S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: options?.fileType
  })
  return s3Client.send(command)
}

const s3Download = async ( key: string, options?: { bucket?: string }) => {
   const command = new GetObjectCommand({
        Bucket: options?.bucket || S3_BUCKET,
        Key: key,
      })
      return await s3Client.send(command);
}
// Generic interface for extending to other storage providers in the future
export const uploadFile = s3Upload
export const downloadFile = s3Download
const fileStorage = {
  uploadFile,
  downloadFile,
}

export default fileStorage
