import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CryptoPrice, CryptoSymbol, WorkerOutputData } from '../../core/models/crypto.models';
import { CryptoService } from '../../core/services/crypto.service';
import { DashboardComponent, WORKER_FACTORY } from './dashboard.component';

class MockWorker {
  onmessage: ((event: MessageEvent<WorkerOutputData>) => void) | null = null;
  postedMessages: unknown[] = [];

  postMessage(message: unknown): void {
    this.postedMessages.push(message);
  }

  emitMessage(data: WorkerOutputData): void {
    this.onmessage?.(new MessageEvent<WorkerOutputData>('message', { data }));
  }

  terminate(): void {}
}

class MockCryptoService {
  readonly prices = signal<CryptoPrice[]>([
    {
      symbol: 'BTCUSDT',
      displayName: 'Bitcoin',
      price: 65000,
      previousPrice: 64000,
      changePercent: 1,
      timestamp: Date.now(),
      alert: { symbol: 'BTCUSDT', targetPrice: 66000, isTriggered: false }
    }
  ]);

  getHistory(symbol: CryptoSymbol): number[] {
    return symbol === 'BTCUSDT' ? [64000, 64500, 65000] : [];
  }

  updateAlert(): void {}
}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  const mockWorker = new MockWorker();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: CryptoService, useClass: MockCryptoService },
        { provide: WORKER_FACTORY, useValue: () => mockWorker as unknown as Worker }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  it('should integrate with service and render cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-crypto-card'));
    expect(cards.length).toBe(1);
  });

  it('should post histories to worker and update stats signal', () => {
    expect(mockWorker.postedMessages.length).toBeGreaterThan(0);
    mockWorker.emitMessage({
      processedAt: Date.now(),
      stats: {
        BTCUSDT: { sma: 64500, volatility: 408.2 },
        ETHUSDT: { sma: 0, volatility: 0 },
        BNBUSDT: { sma: 0, volatility: 0 },
        SOLUSDT: { sma: 0, volatility: 0 },
        ADAUSDT: { sma: 0, volatility: 0 }
      }
    });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.getSma('BTCUSDT')).toBe(64500);
  });

  it('should provide trackBy symbol', () => {
    const item = fixture.componentInstance.prices()[0];
    expect(fixture.componentInstance.trackBySymbol(0, item)).toBe('BTCUSDT');
  });
});
