import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client';

const isSqlite = process.env.DATABASE_URL?.startsWith('file:') || false;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ keyword: string }> }
) {  try {
    const { searchParams } = new URL(request.url)
    const keyword = (await params).keyword || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = parseInt(searchParams.get('size') || '10', 10)
    const skip = (page - 1) * size

    const session = await getServerSession(authOptions)
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          AND: [
            {
              OR: [
                isSqlite ? { title: { contains: keyword } } : { title: { contains: keyword, mode: 'insensitive' } },
                isSqlite ? { body: { contains: keyword, } } : { body: { contains: keyword, mode: 'insensitive' } }
              ]
            },
            {
              OR: [
                session?.user?.id ? { authorId: session.user.id } : {},
                { published: true },
              ],
            },
          ],
        } as unknown as Prisma.ArticleWhereInput,
        // skip,
        // take: size,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
          tags: true,
        },
      }),
      prisma.article.count({
        where: {
          AND: [
            {
              OR: [
                isSqlite ? { title: { contains: keyword } } : { title: { contains: keyword, mode: 'insensitive' } },
                isSqlite ? { body: { contains: keyword } } : { body: { contains: keyword, mode: 'insensitive'   } }
              ]
            },
            {
              OR: [
                session?.user?.id ? { authorId: session.user.id } : {},
                { published: true },
              ],
            },
          ],
        } as unknown as Prisma.ArticleWhereInput,
      }),
    ])
    return NextResponse.json({ articles, total })
  } catch (error) {
    console.error('Error searching articles:', error)
    return NextResponse.error()
  }
}