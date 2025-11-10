import { NextRequest, NextResponse } from 'next/server';

interface OAuthUserData {
  email: string;
  name: string;
  avatar?: string;
  googleId: string;
  accessToken: string;
}

/**
 * Backend API endpoint for Google OAuth user registration/login
 * This endpoint receives OAuth user data from NextAuth and syncs it with the backend
 */
export async function POST(request: NextRequest) {
  try {
    const userData: OAuthUserData = await request.json();

    // Validate required fields
    if (!userData.email || !userData.name || !userData.googleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Forward the OAuth user data to your backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/auth/oauth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar,
            googleId: userData.googleId,
            provider: 'google',
          }),
        });

        if (response.ok) {
          const backendData = await response.json();
          return NextResponse.json(backendData);
        } else {
          console.error('Backend OAuth sync failed:', await response.text());
          // Fall through to mock response
        }
      } catch (error) {
        console.error('Backend OAuth sync error:', error);
        // Fall through to mock response
      }
    }

    // Mock response for development (when backend is not available)
    console.log('Using mock OAuth response for development');

    return NextResponse.json({
      success: true,
      data: {
        token: `oauth-jwt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        user: {
          id: `oauth-${userData.googleId}`,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          provider: 'google',
        },
      },
    });

  } catch (error) {
    console.error('OAuth endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
