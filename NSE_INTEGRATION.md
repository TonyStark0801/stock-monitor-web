# NSE India Integration Guide

This document describes the integration of `stock-nse-india` library for fetching NSE (National Stock Exchange of India) data in the Next.js frontend.

## Overview

The `stock-nse-india` library provides access to:
- ✅ Real-time NSE stock quotes
- ✅ Company information
- ✅ Market status
- ✅ Stock search
- ✅ Historical data (via library)

## Installation

The package is already installed:
```bash
npm install stock-nse-india
```

## API Routes

All NSE data is accessed through Next.js API routes (server-side):

### 1. Get Equity Details
```typescript
GET /api/nse/equity?symbol=RELIANCE

// Response
{
  "success": true,
  "data": {
    "symbol": "RELIANCE",
    "name": "RELIANCE INDUSTRIES LTD",
    "exchange": "NSE",
    "currentPrice": 2450.50,
    "change": 25.30,
    "changePercent": 1.04,
    ...
  }
}
```

### 2. Search Stocks
```typescript
GET /api/nse/search?q=RELIANCE

// Response
{
  "success": true,
  "data": [
    { "symbol": "RELIANCE", "name": "RELIANCE" },
    ...
  ]
}
```

### 3. Market Status
```typescript
GET /api/nse/market-status

// Response
{
  "success": true,
  "data": {
    "marketState": "open",
    "marketStatus": "Market is Open"
  }
}
```

### 4. Batch Equity Details
```typescript
POST /api/nse/batch
Body: { "symbols": ["RELIANCE", "TCS", "INFY"] }

// Response
{
  "success": true,
  "data": [
    { "symbol": "RELIANCE", ... },
    { "symbol": "TCS", ... },
    ...
  ]
}
```

## Frontend Usage

### Using the API Functions

```typescript
import { nseAPI } from '@/lib/api';

// Get single stock details
const stock = await nseAPI.getEquityDetails('RELIANCE');
console.log(stock.currentPrice);

// Search stocks
const results = await nseAPI.searchStocks('RELIANCE');
console.log(results);

// Get market status
const status = await nseAPI.getMarketStatus();
console.log(status.marketStatus);

// Get batch details
const stocks = await nseAPI.getBatchEquityDetails(['RELIANCE', 'TCS', 'INFY']);
console.log(stocks);
```

### Example: Display NSE Stock in Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { nseAPI } from '@/lib/api';

export default function NSEStockCard({ symbol }: { symbol: string }) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStock() {
      try {
        const data = await nseAPI.getEquityDetails(symbol);
        setStock(data);
      } catch (error) {
        console.error('Error fetching stock:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, [symbol]);

  if (loading) return <div>Loading...</div>;
  if (!stock) return <div>Stock not found</div>;

  return (
    <div>
      <h2>{stock.name}</h2>
      <p>Price: ₹{stock.currentPrice}</p>
      <p>Change: {stock.changePercent}%</p>
    </div>
  );
}
```

## Data Structure

### StockPrice (NSE)
```typescript
{
  symbol: string;           // "RELIANCE"
  name: string;             // "RELIANCE INDUSTRIES LTD"
  exchange: string;         // "NSE"
  sector: string;           // "Oil & Gas"
  currentPrice: number;     // 2450.50
  previousClose: number;    // 2425.20
  change: number;           // 25.30
  changePercent: number;    // 1.04
  dayHigh: number;          // 2460.00
  dayLow: number;           // 2430.00
  weekHigh: number;         // 2500.00
  weekLow: number;          // 2400.00
  yearHigh: number;         // 2600.00
  yearLow: number;          // 2200.00
  open: number;             // 2435.00
  volume: number;           // 0 (if not available)
  currency: string;         // "INR"
  lastUpdated: string;      // ISO timestamp
  isActive: boolean;        // true
}
```

## Combining US and NSE Data

You can now fetch data from both sources:

```typescript
import { marketAPI, nseAPI } from '@/lib/api';

// US stocks (from backend via Finnhub)
const usStocks = await marketAPI.getStocksWithPrices(0, 20);

// NSE stocks (from Next.js API routes)
const nseStock = await nseAPI.getEquityDetails('RELIANCE');
const nseStocks = await nseAPI.getBatchEquityDetails(['RELIANCE', 'TCS', 'INFY']);
```

## Rate Limits

The `stock-nse-india` library makes requests to NSE's public APIs. Be mindful of:
- **Rate limiting**: Don't make too many requests too quickly
- **Batch requests**: Use batch endpoint for multiple stocks
- **Caching**: Consider caching responses on the client side

## Error Handling

```typescript
try {
  const stock = await nseAPI.getEquityDetails('RELIANCE');
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Popular NSE Stocks

Common symbols to test:
- `RELIANCE` - Reliance Industries
- `TCS` - Tata Consultancy Services
- `INFY` - Infosys
- `HDFCBANK` - HDFC Bank
- `ICICIBANK` - ICICI Bank
- `HINDUNILVR` - Hindustan Unilever
- `SBIN` - State Bank of India
- `BHARTIARTL` - Bharti Airtel
- `ITC` - ITC Limited
- `KOTAKBANK` - Kotak Mahindra Bank

## Troubleshooting

### "Failed to fetch NSE equity details"
- Check if symbol is correct (use uppercase)
- Verify NSE website is accessible
- Check network connectivity

### "Symbol not found"
- Verify symbol exists on NSE
- Use search endpoint to find correct symbol

### Rate Limit Issues
- Add delays between requests
- Use batch endpoint instead of multiple individual requests
- Implement client-side caching

## Next Steps

1. **Add NSE stocks to watchlist**: Create a watchlist feature that combines US and NSE stocks
2. **Real-time updates**: Implement polling or WebSocket for live updates
3. **Charts**: Integrate charting library to display price history
4. **Alerts**: Add price alert functionality

