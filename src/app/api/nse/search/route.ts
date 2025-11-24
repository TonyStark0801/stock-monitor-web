// API route for searching NSE stocks
import { NextRequest, NextResponse } from 'next/server';
import { searchNSEStocks } from '@/lib/nse-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }

    const results = await searchNSEStocks(query);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error searching NSE stocks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search NSE stocks',
      },
      { status: 500 }
    );
  }
}

