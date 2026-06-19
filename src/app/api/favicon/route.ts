// app/api/favicon/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { downloadFile } from '@/lib/file-storage'

export async function GET(request: NextRequest) {


  try {
      const response = await downloadFile('favicon.png', { bucket: process.env.R2_BUCKET_NAME! });
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
      // Look for the tenant's specific icon
      const customPath = path.join(process.cwd(), 'public', 'files', `favicon.png`);
      const defaultPath = path.join(process.cwd(), 'public', 'favicon-default.ico');
    
      // Check if custom file exists, otherwise use fallback
      const finalPath = fs.existsSync(customPath) ? customPath : defaultPath;
      const fileBuffer = fs.readFileSync(finalPath);
    
      return new NextResponse(fileBuffer, {
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, must-revalidate', // Prevent Google from caching a wrong version forever
        },
      });
    }
}