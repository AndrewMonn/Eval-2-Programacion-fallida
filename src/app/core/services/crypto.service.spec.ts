import { TestBed } from '@angular/core/testing';
import { CryptoService, WS_FACTORY } from './crypto.service';

class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  sentPayloads: string[] = [];

  send(payload: string): void {
    this.sentPayloads.push(payload);
  }

  emitOpen(): void {
    this.onopen?.();
  }

  emitMessage(data: string): void {
    this.onmessage?.(new MessageEvent<string>('message', { data }));
  }

  emitError(): void {
    this.onerror?.();
  }
}

describe('CryptoService', () => {
  let service: CryptoService;
  let sockets: MockWebSocket[];

  beforeEach(() => {
    sockets = [];
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        {
          provide: WS_FACTORY,
          useValue: () => {
            const socket = new MockWebSocket();
            sockets.push(socket);
            return socket as unknown as WebSocket;
          }
        }
      ]
    });
    jasmine.clock().install();
    service = TestBed.inject(CryptoService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should subscribe to tickers on open', () => {
    sockets[0].emitOpen();
    expect(sockets[0].sentPayloads.length).toBe(1);
    const payload = JSON.parse(sockets[0].sentPayloads[0]) as { params: string[] };
    expect(payload.params).toContain('btcusdt@ticker');
  });

  it('should normalize websocket data into signal', () => {
    const before = service.prices().find((item) => item.symbol === 'BTCUSDT');
    expect(before).toBeDefined();
    sockets[0].emitMessage(JSON.stringify({ s: 'BTCUSDT', c: '65000.12', P: '1.2' }));

    const updated = service.prices().find((item) => item.symbol === 'BTCUSDT');
    expect(updated?.price).toBe(65000.12);
    expect(updated?.changePercent).toBe(1.2);
    expect(updated?.previousPrice).toBe(before?.price);
  });

  it('should reconnect and fallback after retries', () => {
    sockets[0].emitError();
    jasmine.clock().tick(1000);
    expect(sockets.length).toBe(2);
    sockets[1].emitError();
    jasmine.clock().tick(2000);
    expect(sockets.length).toBe(3);
    sockets[2].emitError();
    jasmine.clock().tick(3000);
    sockets[3].emitError();

    const initial = service.prices().map((item) => item.price);
    jasmine.clock().tick(1000);
    const changed = service.prices().map((item) => item.price);
    expect(changed.some((value, index) => value !== initial[index])).toBeTrue();
  });

  it('should update alert target with signal update', () => {
    service.updateAlert('ETHUSDT', 4000);
    const item = service.prices().find((price) => price.symbol === 'ETHUSDT');
    expect(item?.alert.targetPrice).toBe(4000);
  });
});
