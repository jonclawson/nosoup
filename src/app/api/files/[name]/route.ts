import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto', // R2 uses 'auto'
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  // Get the file from S3Client
  const name = (await params).name;
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: name,
    })
    const response = await s3Client.send(command);
    const bytes = await response.Body?.transformToByteArray?.() ?? await response.Body?.transformToWebStream?.();
    if (bytes instanceof Uint8Array) {
      return new NextResponse(Buffer.from(bytes), {
        status: 200,
        headers: { 'Content-Type': response.ContentType || 'application/octet-stream' },
      })
    }
    // fallback: return stream/web-stream directly
    return new NextResponse(response.Body as any, {
      status: 200,
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
      },
    })

  } catch (error) {
    console.error('Error fetching file from R2:', error)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}