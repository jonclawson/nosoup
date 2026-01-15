import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path';

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

const s3Delete = async ( key: string, options?: { bucket?: string }) => {
  const command = new DeleteObjectCommand({
      Bucket: options?.bucket || S3_BUCKET,
      Key: key,
    })
    return await s3Client.send(command);
}

const s3DeleteMany = async ( keys: string[], options?: { bucket?: string }) => {
   const deleteParams = {
        Bucket: options?.bucket || S3_BUCKET,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
          Quiet: false,
        },
      };
      const command = new DeleteObjectsCommand(deleteParams);
      return await s3Client.send(command);
}
// Generic interface for extending to other storage providers in the future
// export const uploadFile = s3Upload
export const uploadFile = async ( key: string, body: Buffer | Uint8Array | Blob | string, options?: { bucket?: string, fileType?: string }) => {
  if (process.env.R2_USE_R2 !== 'true') {
    const uploadsDir = path.join(process.cwd(), 'public', 'files')
    const filePath = path.join(uploadsDir, key)
    await fs.writeFile(filePath, body as Buffer)
  }
  if (process.env.R2_USE_R2 === 'true') {
    try {
      const bucketName = options?.bucket || S3_BUCKET;
      await s3Upload(key, body, { bucket: bucketName, fileType: options?.fileType });
      console.log(`Successfully uploaded ${key} to R2 bucket ${bucketName}`);
    } catch (err) {
      console.error('Error uploading to R2:', err);
      throw err;
    }
  }
}
export const downloadFile = s3Download
export const deleteFile = async ( key: string, options?: { bucket?: string }) => {
    if (process.env.R2_USE_R2 !== 'true') {
    const uploadsDir = path.join(process.cwd(), 'public', 'files')
    const filePath = path.join(uploadsDir, key)
    try {
      return await fs.unlink(filePath)
    } catch (err) {
      console.error('Error deleting file:', filePath, err)
      return err;
    }
  }
  if (process.env.R2_USE_R2 === 'true') {
    return await s3Delete(key, options);
  }
}
// export const deleteFiles = s3DeleteMany
export const deleteFiles = async ( keys: string[], options?: { bucket?: string }) => {
   if (process.env.R2_USE_R2 === 'true' && keys.length > 0) {
    try {
      const res = await s3DeleteMany(keys, options)
      console.log('Successfully deleted files from R2:', keys, res)
    } catch (err) {
      console.error('Error deleting files from R2:', err)
      throw err;
    }
  }
  else {
  // Delete from local storage
  const uploadsDir = path.join(process.cwd(), 'public', 'files')
  for (const key of keys) {
    const filePath = path.join(uploadsDir, key)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.error('Error deleting file:', filePath, err)
      // Continue deleting other files even if one fails
    }
  }
}
}
const fileStorage = {
  uploadFile,
  downloadFile,
  deleteFile,
  deleteFiles
}

export default fileStorage
