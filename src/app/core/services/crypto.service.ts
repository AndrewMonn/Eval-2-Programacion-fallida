import { Injectable, InjectionToken, WritableSignal, inject, signal } from '@angular/core';
import { AlertConfig, CryptoPrice, CryptoSymbol, CryptoToken } from '../models/crypto.models';

export const WS_FACTORY = new InjectionToken<(url: string) => WebSocket>('WS_FACTORY', {
  providedIn: 'root',
  factory: () => (url: string) => new WebSocket(url)
});

const WS_ENDPOINT = 'wss://stream.binance.com:9443/ws';
const TOKENS: CryptoToken[] = [
  { symbol: 'BTCUSDT', displayName: 'Bitcoin', basePrice: 64000 },
  { symbol: 'ETHUSDT', displayName: 'Ethereum', basePrice: 3400 },
  { symbol: 'BNBUSDT', displayName: 'BNB', basePrice: 580 },
  { symbol: 'SOLUSDT', displayName: 'Solana', basePrice: 150 },
  { symbol: 'ADAUSDT', displayName: 'Cardano', basePrice: 0.52 }
];

interface BinanceTickerMessage {
  s: string;
  c: string;
  P: string;
}

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly pricesState: WritableSignal<CryptoPrice[]> = signal(this.bootstrapPrices());
  private readonly websocketFactory = inject(WS_FACTORY);
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly historyBySymbol = new Map<CryptoSymbol, number[]>();

  readonly prices = this.pricesState.asReadonly();

  constructor() {
    this.connectWebSocket();
  }

  getHistory(symbol: CryptoSymbol, size = 30): number[] {
    const history = this.historyBySymbol.get(symbol) ?? [];
    return history.slice(Math.max(0, history.length - size));
  }

  updateAlert(symbol: CryptoSymbol, targetPrice: number): void {
    this.pricesState.update((current: CryptoPrice[]) =>
      current.map((item: CryptoPrice) => {
        if (item.symbol !== symbol) {
          return item;
        }
        const alert: AlertConfig = {
          symbol,
          targetPrice,
          isTriggered: item.price >= targetPrice
        };
        return { ...item, alert };
      })
    );
  }

  private bootstrapPrices(): CryptoPrice[] {
    return TOKENS.map((token: CryptoToken) => {
      this.historyBySymbol.set(token.symbol, [token.basePrice]);
      return {
        symbol: token.symbol,
        displayName: token.displayName,
        price: token.basePrice,
        previousPrice: token.basePrice,
        changePercent: 0,
        timestamp: Date.now(),
        alert: { symbol: token.symbol, targetPrice: token.basePrice * 1.05, isTriggered: false }
      };
    });
  }

  private connectWebSocket(): void {
    this.stopFallback();
    this.socket = this.websocketFactory(WS_ENDPOINT);
    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.subscribeSymbols();
    };
    this.socket.onmessage = (event: MessageEvent<string>) => this.handleWebSocketMessage(event.data);
    this.socket.onerror = () => this.handleSocketFailure();
    this.socket.onclose = () => this.handleSocketFailure();
  }

  private subscribeSymbols(): void {
    const payload = {
      method: 'SUBSCRIBE',
      params: TOKENS.map((token: CryptoToken) => `${token.symbol.toLowerCase()}@ticker`),
      id: 1
    };
    this.socket?.send(JSON.stringify(payload));
  }

  private handleWebSocketMessage(raw: string): void {
    let parsed: BinanceTickerMessage | null = null;
    try {
      parsed = JSON.parse(raw) as BinanceTickerMessage;
    } catch {
      return;
    }

    if (!parsed || typeof parsed.s !== 'string' || typeof parsed.c !== 'string' || typeof parsed.P !== 'string') {
      return;
    }

    if (!TOKENS.some((token: CryptoToken) => token.symbol === parsed?.s)) {
      return;
    }

    const price = Number(parsed.c);
    const changePercent = Number(parsed.P);
    if (Number.isNaN(price) || Number.isNaN(changePercent)) {
      return;
    }

    this.updatePrice(parsed.s as CryptoSymbol, price, changePercent);
  }

  private updatePrice(symbol: CryptoSymbol, price: number, changePercent: number): void {
    this.pricesState.update((current: CryptoPrice[]) =>
      current.map((item: CryptoPrice) => {
        if (item.symbol !== symbol) {
          return item;
        }
        this.pushHistory(symbol, price);
        return {
          ...item,
          previousPrice: item.price,
          price,
          changePercent,
          timestamp: Date.now(),
          alert: {
            ...item.alert,
            isTriggered: price >= item.alert.targetPrice
          }
        };
      })
    );
  }

  private pushHistory(symbol: CryptoSymbol, price: number): void {
    const current = this.historyBySymbol.get(symbol) ?? [];
    current.push(price);
    if (current.length > 240) {
      current.shift();
    }
    this.historyBySymbol.set(symbol, current);
  }

  private handleSocketFailure(): void {
    if (this.fallbackIntervalId) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
      }
      this.reconnectTimeoutId = setTimeout(() => this.connectWebSocket(), 1000 * this.reconnectAttempts);
      return;
    }

    this.startFallbackSimulation();
  }

  private startFallbackSimulation(): void {
    this.stopFallback();
    this.fallbackIntervalId = setInterval(() => {
      this.pricesState().forEach((item: CryptoPrice) => {
        const drift = (Math.random() - 0.5) * item.price * 0.006;
        const nextPrice = Math.max(0.0001, item.price + drift);
        const nextPercent = ((nextPrice - item.price) / item.price) * 100;
        this.updatePrice(item.symbol, Number(nextPrice.toFixed(4)), Number(nextPercent.toFixed(4)));
      });
    }, 1000);
  }

  private stopFallback(): void {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }
  }
}
