import { Component, computed, input } from '@angular/core';
import { DayPoint } from '../../../insights/domain/insights';

/** Barras por día, con el valor encima. */
@Component({
  selector: 'app-day-bars',
  template: `
    <div class="bars" [style.height.px]="height()">
      @for (point of points(); track point.label + $index) {
        <div class="col" [title]="point.count + ' ' + unit()">
          <span class="value">{{ point.value || '' }}</span>
          <span class="bar" [style.height.%]="heightOf(point)" [style.background]="color()"></span>
          <span class="label">{{ point.label }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .bars {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: 8px;
      align-items: end;
    }
    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
      height: 100%;
    }
    .bar {
      width: 100%;
      max-width: 36px;
      min-height: 4px;
      border-radius: 10px 10px 4px 4px;
      transition: height 0.6s var(--ease);
    }
    .value {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--ink-2);
    }
    .label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--ink-3);
      text-transform: capitalize;
    }
  `,
})
export class DayBars {
  readonly points = input.required<DayPoint[]>();
  readonly height = input(160);
  readonly color = input('linear-gradient(180deg, var(--mint-400), var(--teal-500))');
  readonly unit = input('');
  private readonly max = computed(() => Math.max(1, ...this.points().map((point) => point.value ?? 0)));

  heightOf(point: DayPoint): number {
    return ((point.value ?? 0) / this.max()) * 78;
  }
}
