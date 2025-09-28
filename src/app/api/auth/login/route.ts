import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Replace this with actual authentication logic
    // For now, return a mock response
    if (email && password) {
      return NextResponse.json({
        success: true,
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: email,
          name: email.split('@')[0],
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}