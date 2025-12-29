import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // fetch all menu tabs from the database
  try {
    const menuTabs = await prisma.menuTab.findMany({})

    return NextResponse.json(menuTabs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch menu tabs' },
      { status: 500 }
    )
  }
}