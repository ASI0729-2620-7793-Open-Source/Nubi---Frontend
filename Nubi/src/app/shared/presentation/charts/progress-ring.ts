import { Component, computed, input } from '@angular/core';

/** Anillo de progreso (por ejemplo, pasos de la rutina hechos hoy). */
@Component({
  selector: 'app-progress-ring',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 100 100" role="img" [attr.aria-label]="label()">
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" stroke-width="10" />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="10"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="offset()"
        transform="rotate(-90 50 50)"
        style="transition: stroke-dashoffset 0.8s ease"
      />
      <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="var(--ink)">
        {{ text() }}
      </text>
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
  `,
})
export class ProgressRing {
  readonly value = input(0);
  readonly size = input(96);
  readonly color = input('var(--mint-400)');
  readonly text = input('');
  readonly label = input('Progreso');
  protected readonly circumference = 2 * Math.PI * 42;
  protected readonly offset = computed(() => this.circumference * (1 - Math.min(1, Math.max(0, this.value()))));
}
