import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: email and password are required'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Get Authorization header from request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Authorization header'
        },
        { status: 401 }
      );
    }

    // Forward request to your actual backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1/api';

    try {
      const backendResponse = await fetch(`${backendUrl}/auth/generateOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CLIENT-EMAIL': email,
          'Authorization': authHeader,
        },
        body: JSON.stringify({ email, password }),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        // Extract error message from backend response
        const errorMessage = backendData.message || backendData.error || 'Failed to generate OTP';

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            errorCode: backendData.errorCode
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
    console.error('Generate OTP API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
