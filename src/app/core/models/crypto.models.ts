export type CryptoSymbol = 'BTCUSDT' | 'ETHUSDT' | 'BNBUSDT' | 'SOLUSDT' | 'ADAUSDT';

export interface CryptoToken {
  symbol: CryptoSymbol;
  displayName: string;
  basePrice: number;
}

export interface AlertConfig {
  symbol: CryptoSymbol;
  targetPrice: number;
  isTriggered: boolean;
}

export interface CryptoPrice {
  symbol: CryptoSymbol;
  displayName: string;
  price: number;
  changePercent: number;
  previousPrice: number;
  timestamp: number;
  alert: AlertConfig;
}

export interface WorkerInputData {
  history: Record<CryptoSymbol, number[]>;
  period: number;
}

export interface WorkerOutputData {
  stats: Record<CryptoSymbol, { sma: number; volatility: number }>;
  processedAt: number;
  error?: string;
}
