import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  // Fetch all tags from the database accepting an optional search parameter to filter tags by name
  // filtering is case-insensitive and matches any part of the tag name
  // Results are ordered alphabetically by name
  // Returns only the name of each tag
  // filters unique tag names
  const searchParams = request.nextUrl.searchParams
  const rawSearch = searchParams.get('search')?.trim()
  const search = rawSearch && rawSearch.length > 0 ? rawSearch : null
  const isSqlite = process.env.DATABASE_URL?.startsWith('file:') || false;
  console.log('Search parameter:', search)
  try {
    const tags = await prisma.tag.findMany({
      ...(search ? { where: { name: isSqlite
        ? { contains: search }
        : { contains: search, mode: 'insensitive' } 
      } as unknown as Prisma.TagWhereInput } : {}),
      select: {
        id: true,
        name: true
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}