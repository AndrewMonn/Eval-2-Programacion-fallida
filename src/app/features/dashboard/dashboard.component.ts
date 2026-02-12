import { ChangeDetectionStrategy, Component, InjectionToken, OnDestroy, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CryptoService } from '../../core/services/crypto.service';
import { CryptoPrice, CryptoSymbol, WorkerOutputData } from '../../core/models/crypto.models';
import { CryptoCardComponent } from '../components/crypto-card/crypto-card.component';

export const WORKER_FACTORY = new InjectionToken<() => Worker>('WORKER_FACTORY', {
  providedIn: 'root',
  factory: () => () => new Worker(new URL('../../workers/stats.worker', import.meta.url), { type: 'module' })
});

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CryptoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnDestroy {
  private readonly cryptoService = inject(CryptoService);
  private readonly createWorker = inject(WORKER_FACTORY);
  private readonly worker = this.createWorker();

  readonly prices = this.cryptoService.prices;
  readonly stats: WritableSignal<Record<CryptoSymbol, { sma: number; volatility: number }>> = signal({
    BTCUSDT: { sma: 0, volatility: 0 },
    ETHUSDT: { sma: 0, volatility: 0 },
    BNBUSDT: { sma: 0, volatility: 0 },
    SOLUSDT: { sma: 0, volatility: 0 },
    ADAUSDT: { sma: 0, volatility: 0 }
  });

  readonly updatedAt = computed(() => {
    const rows = this.prices();
    return rows.length ? Math.max(...rows.map((item: CryptoPrice) => item.timestamp)) : Date.now();
  });

  constructor() {
    this.worker.onmessage = ({ data }: MessageEvent<WorkerOutputData>) => {
      if (!data.error) {
        this.stats.set(data.stats);
      }
    };

    effect(() => {
      const current = this.prices();
      const history = current.reduce((acc, price: CryptoPrice) => {
        acc[price.symbol] = this.cryptoService.getHistory(price.symbol, 30);
        return acc;
      }, {} as Record<CryptoSymbol, number[]>);
      this.worker.postMessage({ history, period: 20 });
    });
  }

  trackBySymbol(_: number, item: CryptoPrice): CryptoSymbol {
    return item.symbol;
  }

  getSma(symbol: CryptoSymbol): number {
    return this.stats()[symbol]?.sma ?? 0;
  }

  getVolatility(symbol: CryptoSymbol): number {
    return this.stats()[symbol]?.volatility ?? 0;
  }

  onAlertUpdated(payload: { symbol: CryptoSymbol; targetPrice: number }): void {
    this.cryptoService.updateAlert(payload.symbol, payload.targetPrice);
  }

  ngOnDestroy(): void {
    this.worker.terminate();
  }
}
