import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // use params id to select field by id from database using prisma
  try {
    const id = (await params).id;
    const code = await prisma.field.findUnique({
      where: { 
        id: id,
        type: 'code'
      },
    })
    const htmlContent = code?.value || '';
    return new Response(htmlContent, {
      headers: { 
        'Content-Type': 'text/html',
        'X-Frame-Options': 'SAMEORIGIN',   
        'Content-Security-Policy': "frame-ancestors 'self'",
       },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}