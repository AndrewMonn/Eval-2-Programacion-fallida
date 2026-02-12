/// <reference lib="webworker" />
import { CryptoSymbol, WorkerInputData, WorkerOutputData } from '../core/models/crypto.models';

export function calculateSma(history: number[], period: number): number {
  if (!history.length || period <= 0) {
    return 0;
  }
  const slice = history.slice(Math.max(0, history.length - period));
  const sum = slice.reduce((acc: number, value: number) => acc + value, 0);
  return Number((sum / slice.length).toFixed(6));
}

export function calculateVolatility(history: number[], period: number): number {
  if (!history.length || period <= 1) {
    return 0;
  }
  const slice = history.slice(Math.max(0, history.length - period));
  const mean = calculateSma(slice, slice.length);
  const variance = slice.reduce((acc: number, value: number) => acc + (value - mean) ** 2, 0) / slice.length;
  return Number(Math.sqrt(variance).toFixed(6));
}

export function processWorkerInput(payload: WorkerInputData): WorkerOutputData {
  const symbols = Object.keys(payload.history) as CryptoSymbol[];
  const stats = symbols.reduce((acc, symbol: CryptoSymbol) => {
    const history = payload.history[symbol] ?? [];
    acc[symbol] = {
      sma: calculateSma(history, payload.period),
      volatility: calculateVolatility(history, payload.period)
    };
    return acc;
  }, {} as WorkerOutputData['stats']);

  return {
    stats,
    processedAt: Date.now()
  };
}

addEventListener('message', ({ data }: MessageEvent<WorkerInputData>) => {
  try {
    if (!data || !data.history || data.period <= 0) {
      throw new Error('Invalid worker payload');
    }
    postMessage(processWorkerInput(data));
  } catch (error: unknown) {
    postMessage({
      stats: {
        BTCUSDT: { sma: 0, volatility: 0 },
        ETHUSDT: { sma: 0, volatility: 0 },
        BNBUSDT: { sma: 0, volatility: 0 },
        SOLUSDT: { sma: 0, volatility: 0 },
        ADAUSDT: { sma: 0, volatility: 0 }
      },
      processedAt: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown worker error'
    } as WorkerOutputData);
  }
});
