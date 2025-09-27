import { NextRequest, NextResponse } from 'next/server';

// This is your Next.js API route - it acts as a proxy to your backend
// In production, you might not need this if you call your backend directly

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: name, email, and password are required' 
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Forward request to your actual backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    
    try {
      const backendResponse = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json(
          { 
            success: false,
            error: backendData.error || backendData.message || 'Registration failed' 
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
      
      // For development: Return mock response if backend is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock response for development');
        return NextResponse.json({
          success: true,
          data: {
            token: `mock-jwt-token-${Date.now()}`,
            user: {
              id: `mock-${Date.now()}`,
              email: email,
              name: name,
            }
          }
        });
      }

      return NextResponse.json(
        { 
          success: false,
          error: 'Backend service unavailable' 
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}