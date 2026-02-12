import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlightChange]',
  standalone: true
})
export class HighlightChangeDirective implements OnChanges {
  @Input({ required: true }) appHighlightChange = 0;

  private previousValue: number | null = null;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['appHighlightChange']) {
      return;
    }

    if (this.previousValue === null) {
      this.previousValue = this.appHighlightChange;
      return;
    }

    if (this.appHighlightChange > this.previousValue) {
      this.flash('flash-green');
    } else if (this.appHighlightChange < this.previousValue) {
      this.flash('flash-red');
    }

    this.previousValue = this.appHighlightChange;
  }

  private flash(className: 'flash-green' | 'flash-red'): void {
    const native = this.elementRef.nativeElement;
    this.renderer.removeClass(native, 'flash-green');
    this.renderer.removeClass(native, 'flash-red');
    this.renderer.addClass(native, className);

    const off = this.renderer.listen(native, 'animationend', () => {
      this.renderer.removeClass(native, className);
      off();
    });
  }
}
