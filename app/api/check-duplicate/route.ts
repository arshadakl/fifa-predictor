import { NextResponse } from 'next/server';
import { readSubmissions } from '@/lib/appsScript';
import { findDuplicateField } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const Mobile_Number = body?.Mobile_Number;
  const Email_Address = body?.Email_Address;

  if (!Mobile_Number || !Email_Address) {
    return NextResponse.json(
      { success: false, message: 'Mobile number and email are required.' },
      { status: 400 }
    );
  }

  try {
    const submissions = await readSubmissions();
    const duplicateField = findDuplicateField(submissions, Mobile_Number, Email_Address);
    if (duplicateField === 'mobile') {
      return NextResponse.json(
        { success: false, message: 'This mobile number has already been used for a submission.' },
        { status: 409 }
      );
    }
    if (duplicateField === 'email') {
      return NextResponse.json(
        { success: false, message: 'This email address has already been used for a submission.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to verify your details right now. Please try again.' },
      { status: 500 }
    );
  }
}
