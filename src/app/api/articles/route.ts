import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = parseInt(searchParams.get('size') || '10', 10)
    const skip = (page - 1) * size
    // get optional query parameters for published, featured, and sticky
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const sticky = searchParams.get('sticky')
    // query on those parameters if they are provided.
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          ...(published !== null && { published: published === 'true' }),
          ...(featured !== null && { featured: featured === 'true' }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          fields: {
            select: {
              id: true,
              type: true,
              value: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true
            }
          },
        },
        orderBy: [
          { sticky: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: size
      }),
      prisma.article.count()
    ])
    
    // Serialize dates to prevent hydration issues
    const serializedArticles = articles.map(article => ({
      ...article,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }))
    
    return NextResponse.json({
      data: serializedArticles,
      pagination: {
        page,
        size,
        total,
        totalPages: Math.ceil(total / size)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // const requestBody = await request.json()
    // const { title, body, fields } = requestBody
    // console.log('Received article data:', fields);

    console.log('Processing PUT request for article ID:');
    const form = await request.formData()
    console.log('Received form data:', form);
    const title = form.get('title')?.toString() ?? ''
    const body = form.get('body')?.toString() ?? ''
    const fields = JSON.parse(form.get('fields')?.toString() ?? '[]')
    const tags = JSON.parse(form.get('tags')?.toString() ?? '[]')

    console.log('Received field data for update:', fields);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    try {
      for (const [index, field] of fields.entries()) {
        console.log('Processing field:', field);
        if (field.type === 'image' && form.get(`files[${index}]`)) {
          const file = form.get(`files[${index}]`) as File
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const filePath = path.join(uploadsDir, file.name)
          await fs.writeFile(filePath, buffer)
          field.value = `/uploads/${file.name}`
        }
      }
    } catch (fileError) {
      console.error('Error processing file uploads:', fileError)
      return NextResponse.json(
        { error: 'Failed to process file uploads' },
        { status: 500 }
      )
    }

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      )
    }

    const article = await prisma.article.create({
      data: {
        title,
        body,
        authorId: session.user.id,
        fields: {
          create: (fields ?? []).map((f: { type: string; value: string }) => ({
            type: f.type,
            value: f.value
          }))
        },
        tags: {
          create: (tags ?? []).map((t: { name: string }) => ({
            name: t.name
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        fields: {
          select: {
            id: true,
            type: true,
            value: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        } 
      }
    })

    // Serialize dates
    const serializedArticle = {
      ...article,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }

    return NextResponse.json(serializedArticle, { status: 201 })
  } catch (error: any) {
    console.error('Article creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
} 