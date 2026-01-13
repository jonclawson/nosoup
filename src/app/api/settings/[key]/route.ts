import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'

// Get Setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) { 
  // get key, value pair from request body
  const key = (await params).key;

  try {
    // fetch setting from database using the key
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ key: setting.key, value: setting.value }, { status: 200 });
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Update Setting by key
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const key = (await params).key;
  try {
    const form = await request.formData()
    const body = Object.fromEntries(form.entries());
    const value = body.value;

    // update setting in database
    const updatedSetting = await prisma.setting.update({
      where: { key },
      data: { value: value as string },
    });

    return NextResponse.json({ key: updatedSetting.key, value: updatedSetting.value }, { status: 200 });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Delete Setting by key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const key = (await params).key;
  try {
    // delete setting from database
    await prisma.setting.delete({
      where: { key },
    });

    return NextResponse.json({ message: 'Setting deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}