import { NextRequest, NextResponse } from 'next/server'
import { downloadFile } from '@/lib/file-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  // Get the file from S3Client
  const name = (await params).name;
  try {
    const response = await downloadFile(name, { bucket: process.env.R2_BUCKET_NAME! });
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