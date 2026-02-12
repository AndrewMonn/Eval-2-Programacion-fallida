import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HighlightChangeDirective } from './highlight-change.directive';

@Component({
  standalone: true,
  imports: [HighlightChangeDirective],
  template: `<div [appHighlightChange]="value"></div>`
})
class HostComponent {
  value = 100;
}

describe('HighlightChangeDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should detect upward change and apply green class', () => {
    fixture.componentInstance.value = 120;
    fixture.detectChanges();
    const element = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(element.classList.contains('flash-green')).toBeTrue();
  });

  it('should detect downward change and apply red class', () => {
    fixture.componentInstance.value = 80;
    fixture.detectChanges();
    const element = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    expect(element.classList.contains('flash-red')).toBeTrue();
  });

  it('should remove class after animation end', () => {
    fixture.componentInstance.value = 120;
    fixture.detectChanges();
    const element = fixture.debugElement.query(By.css('div')).nativeElement as HTMLDivElement;
    element.dispatchEvent(new AnimationEvent('animationend'));
    fixture.detectChanges();
    expect(element.classList.contains('flash-green')).toBeFalse();
  });
});
