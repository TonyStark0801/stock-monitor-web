// NSE India API using stock-nse-india library
import { NseIndia } from 'stock-nse-india';

const nseIndia = new NseIndia();

export interface NSEEquityDetails {
  info: {
    symbol: string;
    companyName: string;
    industry: string;
    isin: string;
    series: string;
    dateOfListing: string;
    paidUpValue: number;
    marketLot: number;
    faceValue: number;
  };
  priceInfo: {
    lastPrice: number;
    change: number;
    pChange: number;
    previousClose: number;
    open: number;
    intraDayHighLow: {
      min: number;
      max: number;
    };
    weekHighLow: {
      min: number;
      max: number;
    };
    yearHighLow: {
      min: number;
      max: number;
    };
  };
  preOpenMarket?: {
    preopen: Array<{
      price: number;
      buyQty: number;
      sellQty: number;
    }>;
  };
}

export interface NSEMarketStatus {
  marketState: string;
  marketStatus: string;
}

export interface NSESearchResult {
  symbol: string;
  name: string;
}

/**
 * Get all NSE stock symbols
 */
export async function getAllNSEStocks(): Promise<string[]> {
  try {
    const symbols = await nseIndia.getAllStockSymbols();
    return symbols;
  } catch (error) {
    console.error('Error fetching NSE stock symbols:', error);
    throw error;
  }
}

/**
 * Get equity details for a specific NSE symbol
 */
export async function getNSEEquityDetails(symbol: string): Promise<NSEEquityDetails> {
  try {
    const details = await nseIndia.getEquityDetails(symbol);
    return details as NSEEquityDetails;
  } catch (error) {
    console.error(`Error fetching NSE equity details for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get market status
 */
export async function getNSEMarketStatus(): Promise<NSEMarketStatus> {
  try {
    const status = await nseIndia.getDataByEndpoint('/marketStatus');
    return status as NSEMarketStatus;
  } catch (error) {
    console.error('Error fetching NSE market status:', error);
    throw error;
  }
}

/**
 * Search NSE stocks by query
 */
export async function searchNSEStocks(query: string): Promise<NSESearchResult[]> {
  try {
    const symbols = await getAllNSEStocks();
    const queryLower = query.toLowerCase();
    
    // Filter symbols that match the query
    const matches = symbols
      .filter(symbol => symbol.toLowerCase().includes(queryLower))
      .slice(0, 20) // Limit to 20 results
      .map(symbol => ({
        symbol,
        name: symbol, // You can enhance this by fetching details
      }));
    
    return matches;
  } catch (error) {
    console.error('Error searching NSE stocks:', error);
    throw error;
  }
}

/**
 * Get multiple equity details in batch
 */
export async function getBatchNSEEquityDetails(symbols: string[]): Promise<Map<string, NSEEquityDetails>> {
  const results = new Map<string, NSEEquityDetails>();
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (symbol) => {
        try {
          const details = await getNSEEquityDetails(symbol);
          results.set(symbol, details);
        } catch (error) {
          console.error(`Failed to fetch details for ${symbol}:`, error);
        }
      })
    );
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Convert NSE equity details to our StockPrice format
 */
export function convertNSEDetailsToStockPrice(details: NSEEquityDetails) {
  const { info, priceInfo } = details;
  
  return {
    symbol: info.symbol,
    name: info.companyName,
    exchange: 'NSE',
    sector: info.industry || 'Unknown',
    currentPrice: priceInfo.lastPrice,
    previousClose: priceInfo.previousClose,
    change: priceInfo.change,
    changePercent: priceInfo.pChange,
    dayHigh: priceInfo.intraDayHighLow.max,
    dayLow: priceInfo.intraDayHighLow.min,
    weekHigh: priceInfo.weekHighLow.max,
    weekLow: priceInfo.weekHighLow.min,
    yearHigh: priceInfo.yearHighLow.max,
    yearLow: priceInfo.yearHighLow.min,
    open: priceInfo.open,
    volume: 0, // NSE API might not provide volume in this format
    marketCap: null,
    currency: 'INR',
    lastUpdated: new Date().toISOString(),
    isActive: true,
  };
}

