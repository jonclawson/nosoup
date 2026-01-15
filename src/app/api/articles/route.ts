import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path';
import { uploadFile } from '@/lib/file-storage'
import { randomUUID } from 'crypto' 
import slugify from 'slugify'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const size = parseInt(searchParams.get('size') || '10', 10)
    const skip = (page - 1) * size
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const sticky = searchParams.get('sticky')
    const tag = searchParams.get('tag')
    const tab = searchParams.get('tab')


    const session = await getServerSession(authOptions) 
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          AND: [
            featured != null ? {featured: featured === 'true'} : {},
            tag != null ? { tags: { some: { name: tag } } } : {},
            {
              OR: published != null ? [
                 {published: published === 'true'},
                { 
                  AND: [
                    session?.user?.id ? { authorId: session.user.id } : {},
                    session?.user?.id ? { published: false } : { published: true }
                  ]
                }
              ] : []
            },
            tab === 'false' ? { tab: null } : {},
            tab === 'true' ? { tab: { isNot: null } } : {},
          ]
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
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
          sticky === 'true' ? { sticky: 'desc' } : {},
          { createdAt: 'desc' },
        ],
        skip,
        take: size
      }),
      prisma.article.count({
        where: {
          AND: [
            featured != null ? {featured: featured === 'true'} : {},
            tag != null ? { tags: { some: { name: tag } } } : {},
            {
              OR: published != null ? [
                 {published: published === 'true'},
                { 
                  AND: [
                    session?.user?.id ? { authorId: session.user.id } : {},
                    session?.user?.id ? { published: false } : { published: true }
                  ]
                }
              ] : []
            },
            tab === 'false' ? { tab: null } : {},
            tab === 'true' ? { tab: { isNot: null } } : {},
          ]
        }
      })
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

    console.log('Processing POST request for new article:');
    const form = await request.formData()
    console.log('Received form data:', form);
    const title = form.get('title')?.toString() ?? ''
    const body = form.get('body')?.toString() ?? ''
    const published = form.get('published') === 'true'
    const sticky = form.get('sticky') === 'true'
    const featured = form.get('featured') === 'true'
    const fields = JSON.parse(form.get('fields')?.toString() ?? '[]')
    const tags = JSON.parse(form.get('tags')?.toString() ?? '[]')
    const tab = form.get('tab') ? JSON.parse(form.get('tab')?.toString() ?? '{}') : undefined;

    console.log('Received tab data for update:', tab);

    const uploadsDir = path.join(process.cwd(), 'public', 'files')

    try {
      for (const [index, field] of fields.entries()) {
        console.log('Processing field:', field);
        if (field.type === 'image' && form.get(`files[${index}]`)) {
          const file = form.get(`files[${index}]`) as File
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const fileName = `${Date.now()}-${randomUUID()}${file.name}`
          field.value = `/files/${fileName}`
          await uploadFile(fileName, buffer, { bucket: process.env.R2_BUCKET_NAME!, fileType: file.type });
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
        slug: slugify(title, { lower: true }),
        body,
        authorId: session.user.id,
        published,
        sticky,
        featured,
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
        },
        tab: tab ? {
          create: {
            name: tab.name,
            link: '/' + slugify(title, { lower: true }),
            order: +tab.order
          }
        } : undefined
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
        tab: {
          select: {
            id: true,
            name: true,
            link: true,
            order: true
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
    if (error.toString()?.includes('Unique constraint failed')) {
      return NextResponse.json(
        { error: 'An article with this title already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
} 