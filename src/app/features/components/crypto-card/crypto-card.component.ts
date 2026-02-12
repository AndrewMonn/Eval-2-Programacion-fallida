import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { CryptoPrice, CryptoSymbol } from '../../../core/models/crypto.models';
import { HighlightChangeDirective } from '../../../shared/directives/highlight-change.directive';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [DecimalPipe, PercentPipe, HighlightChangeDirective],
  templateUrl: './crypto-card.component.html',
  styleUrl: './crypto-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoCardComponent {
  readonly crypto = input.required<CryptoPrice>();
  readonly sma = input<number>(0);
  readonly volatility = input<number>(0);
  readonly alertUpdated = output<{ symbol: CryptoSymbol; targetPrice: number }>();

  onTargetPriceChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    const value = Number(element.value);
    if (Number.isFinite(value) && value > 0) {
      this.alertUpdated.emit({ symbol: this.crypto().symbol, targetPrice: value });
    }
  }
}
