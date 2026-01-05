import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    console.log('testLOg', {...(!session?.user ? {published: true} : {})})

    const slug = (await params).slug;
    console.log('Fetching article with slug:', slug)
    const article = await prisma.article.findUnique({
      where: { 
        slug: slug ,
        ...(!session?.user ? {published: true} : {})
      },
      select: { id: true }
    })
    console.log('Fetched article by slug:', article)

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}