import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto' 
import slugify from 'slugify'

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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  console.log('testLOg', {...(!session?.user ? {published: true} : {})})
  try {
    const id = (await params).id;
    console.log('Fetching article with ID:', id)
    const article = await prisma.article.findUnique({
      where: { 
        id: id,
         ...(!session?.user ? {published: true} : {})
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
    console.log('Fetched article:', article)

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Serialize dates
    const serializedArticle = {
      ...article,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString()
    }

    return NextResponse.json(serializedArticle)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('Processing PUT request for article ID:', (await params).id);
    const form = await request.formData()
    console.log('Received form data:', form);
    const title = form.get('title')?.toString() ?? ''
    const body = form.get('body')?.toString() ?? ''
    const fields = JSON.parse(form.get('fields')?.toString() ?? '[]')
    const tags = JSON.parse(form.get('tags')?.toString() ?? '[]')
    const published = form.get('published') === 'true'
    const sticky = form.get('sticky') === 'true'
    const featured = form.get('featured') === 'true'
    const tab = form.get('tab') ? JSON.parse(form.get('tab')?.toString() ?? '{}') : undefined;
    console.log('Received tab data for update:', tab);


    const uploadsDir = path.join(process.cwd(), 'public', 'files')

    try {
      for (const [index, field] of fields.entries()) {
        console.log('Processing field:', field);
        if (field.type === 'image' && form.get(`files[${index}]`)) {
          const file = form.get(`files[${index}]`) as File
          const arrayBuffer = await file.arrayBuffer()
          if (process.env.R2_USE_R2 !== 'true') {
            const buffer = Buffer.from(arrayBuffer)
            const fileName = `${Date.now()}-${randomUUID()}${file.name}`
            const filePath = path.join(uploadsDir, fileName)
            await fs.writeFile(filePath, buffer)
            field.value = `/files/${fileName}`
          }
          if (process.env.R2_USE_R2 === 'true') {
            const buffer = Buffer.from(arrayBuffer)
            const bucketName = process.env.R2_BUCKET_NAME!;
            const key = `${Date.now()}-${randomUUID()}${file.name}`;
            const putObjectParams = {
              Bucket: bucketName,
              Key: key,
              Body: buffer,
              ContentType: file.type,
            };

            try {
              await s3Client.send(new PutObjectCommand(putObjectParams));
              console.log(`Successfully uploaded ${key} to R2 bucket ${bucketName}`);
              field.value = `/files/${key}`;
            } catch (err) {
              console.error('Error uploading to R2:', err);
              return NextResponse.json(
                { error: 'Failed to upload file to R2' },
                { status: 500 }
              )
            }
          }
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

    // Check if article exists and user is the author
    const existingArticle = await prisma.article.findUnique({
      where: { id: (await params).id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own articles' },
        { status: 403 }
      )
    }
    const tabExists = await prisma.menuTab.findFirst({
      where: {
        articleId: (await params).id
      }
    });
    console.log('Tab exists:', tabExists);
    const article = await prisma.article.update({
      where: { id: (await params).id },
      data: {
        title,
        slug: slugify(title, { lower: true }),
        body,
        fields: {
          deleteMany: {},
          create: (fields ?? []).map((f: any) => ({
            type: f.type,
            value: f.value
          }))
        },
        tags: {
          deleteMany: {},
          create: (tags ?? []).map((t: any) => ({
            name: t.name
          }))
        },
        published,
        sticky,
        featured,
        tab: tab ? {
          upsert: {
            update: {
              name: tab.name,
              link: '/' + slugify(title, { lower: true }),
              order: +tab.order
            },
            create: {
              name: tab.name,
              link: '/' + slugify(title, { lower: true }),
              order: +tab.order
            }
          }
        } : !tabExists ? undefined : { delete: true } 
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

    return NextResponse.json(serializedArticle)
  } catch (error: any) {
    console.error('Error updating article:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if article exists and user is the author
    const existingArticle = await prisma.article.findUnique({
      where: { id: (await params).id }
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    if (existingArticle.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own articles' },
        { status: 403 }
      )
    }

    await prisma.article.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
} 