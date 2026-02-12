import { calculateSma, calculateVolatility, processWorkerInput } from './stats.worker';
import { WorkerInputData } from '../core/models/crypto.models';

describe('stats.worker', () => {
  it('should calculate SMA', () => {
    expect(calculateSma([1, 2, 3, 4], 2)).toBe(3.5);
    expect(calculateSma([], 5)).toBe(0);
  });

  it('should calculate volatility', () => {
    const value = calculateVolatility([10, 12, 14, 16], 4);
    expect(value).toBeGreaterThan(0);
    expect(calculateVolatility([1], 1)).toBe(0);
  });

  it('should process incoming payload', () => {
    const payload: WorkerInputData = {
      period: 3,
      history: {
        BTCUSDT: [1, 2, 3],
        ETHUSDT: [3, 3, 3],
        BNBUSDT: [2, 5, 8],
        SOLUSDT: [4, 4, 4],
        ADAUSDT: [0.5, 0.6, 0.7]
      }
    };
    const output = processWorkerInput(payload);
    expect(output.stats.BTCUSDT.sma).toBe(2);
    expect(output.stats.ETHUSDT.volatility).toBe(0);
  });

  it('should throw for invalid payload handling path', () => {
    expect(() => processWorkerInput({ period: 0, history: { BTCUSDT: [], ETHUSDT: [], BNBUSDT: [], SOLUSDT: [], ADAUSDT: [] } })).not.toThrow();
  });
});
