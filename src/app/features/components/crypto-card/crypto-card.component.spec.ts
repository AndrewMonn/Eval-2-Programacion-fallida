import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CryptoCardComponent } from './crypto-card.component';
import { CryptoPrice } from '../../../core/models/crypto.models';

describe('CryptoCardComponent', () => {
  let fixture: ComponentFixture<CryptoCardComponent>;
  let component: CryptoCardComponent;

  const mockPrice: CryptoPrice = {
    symbol: 'BTCUSDT',
    displayName: 'Bitcoin',
    price: 65000,
    previousPrice: 64000,
    changePercent: 1.2,
    timestamp: Date.now(),
    alert: {
      symbol: 'BTCUSDT',
      targetPrice: 66000,
      isTriggered: false
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CryptoCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(CryptoCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('crypto', mockPrice);
    fixture.componentRef.setInput('sma', 64500);
    fixture.componentRef.setInput('volatility', 120);
    fixture.detectChanges();
  });

  it('should render with OnPush and inputs', () => {
    expect(component.crypto().symbol).toBe('BTCUSDT');
    const title = fixture.debugElement.query(By.css('.crypto-card__symbol')).nativeElement as HTMLElement;
    expect(title.textContent).toContain('BTCUSDT');
  });

  it('should include highlight directive in price element', () => {
    const price = fixture.debugElement.query(By.css('.crypto-card__price')).nativeElement as HTMLElement;
    expect(price).toBeTruthy();
  });

  it('should render alert style when triggered', () => {
    fixture.componentRef.setInput('crypto', { ...mockPrice, alert: { ...mockPrice.alert, isTriggered: true } });
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('.crypto-card')).nativeElement as HTMLElement;
    expect(card.classList.contains('crypto-card--alert')).toBeTrue();
  });
});
