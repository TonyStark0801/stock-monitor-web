import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, transactionId, otp } = body;

    // Validate required fields
    if (!email || !transactionId || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email, transactionId, and otp are required'
        },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'OTP must be a 6-digit number'
        },
        { status: 400 }
      );
    }

    // Forward request to your actual backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1/api';

    try {
      const backendResponse = await fetch(`${backendUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, transactionId, otp }),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error: backendData.error || backendData.message || 'Email verification failed'
          },
          { status: backendResponse.status }
        );
      }

      // Return success response from backend
      return NextResponse.json({
        success: true,
        data: backendData.data || backendData
      });

    } catch (backendError) {
      console.error('Backend connection failed:', backendError);
      return NextResponse.json(
        {
          success: false,
          error: 'Backend service unavailable'
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Verify email API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
