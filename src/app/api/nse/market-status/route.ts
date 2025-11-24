// API route for NSE market status
import { NextRequest, NextResponse } from 'next/server';
import { getNSEMarketStatus } from '@/lib/nse-api';

export async function GET() {
  try {
    const status = await getNSEMarketStatus();

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching NSE market status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NSE market status',
      },
      { status: 500 }
    );
  }
}

