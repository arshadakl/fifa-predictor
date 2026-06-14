import { NextResponse } from 'next/server';
import { readSubmissions } from '@/lib/appsScript';

export async function GET() {
  try {
    const submissions = await readSubmissions();
    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Error reading submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load submissions from Google Sheets.' },
      { status: 500 }
    );
  }
}
