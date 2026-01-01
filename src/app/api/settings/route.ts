import { prisma } from '@/lib/prisma';
import { Setting } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server'

// Get all Settings
export async function GET() { 
  try {
    // fetch all settings from database
    const settings = await prisma.setting.findMany();

    const formattedSettings = settings.map((setting: Setting) => ({
      key: setting.key,
      value: setting.value
    }));

    return NextResponse.json(formattedSettings, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create new Setting
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const body = Object.fromEntries(form.entries());
    const key = body.key;
    const value = body.value;
    console.log('Creating setting with key:', key, 'and value:', value, 'from ', body);

    // create new setting in database
    const newSetting = await prisma.setting.create({
      data: { key, value },
    });

    return NextResponse.json({ key: newSetting.key, value: newSetting.value }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}