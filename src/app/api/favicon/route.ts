// app/api/favicon/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {


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