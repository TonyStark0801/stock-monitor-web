// API route for batch NSE equity details
import { NextRequest, NextResponse } from 'next/server';
import { getBatchNSEEquityDetails, convertNSEDetailsToStockPrice } from '@/lib/nse-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { success: false, error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    if (symbols.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 symbols allowed per request' },
        { status: 400 }
      );
    }

    const detailsMap = await getBatchNSEEquityDetails(symbols);
    const stockPrices = Array.from(detailsMap.values()).map(convertNSEDetailsToStockPrice);

    return NextResponse.json({
      success: true,
      data: stockPrices,
    });
  } catch (error) {
    console.error('Error fetching batch NSE equity details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch batch NSE equity details',
      },
      { status: 500 }
    );
  }
}

