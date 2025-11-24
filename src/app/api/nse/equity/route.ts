// API route for NSE equity details
import { NextRequest, NextResponse } from 'next/server';
import { getNSEEquityDetails, convertNSEDetailsToStockPrice } from '@/lib/nse-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const details = await getNSEEquityDetails(symbol);
    const stockPrice = convertNSEDetailsToStockPrice(details);

    return NextResponse.json({
      success: true,
      data: stockPrice,
    });
  } catch (error) {
    console.error('Error fetching NSE equity details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NSE equity details',
      },
      { status: 500 }
    );
  }
}

