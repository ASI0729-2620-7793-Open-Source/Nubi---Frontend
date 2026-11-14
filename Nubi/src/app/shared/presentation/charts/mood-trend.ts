import { Component, computed, input } from '@angular/core';
import { DayPoint } from '../../../insights/domain/insights';
import { MOODS } from '../../domain/mood';

/**
 * Línea del ánimo diario: arriba la calma y abajo la crisis. Los días sin registro quedan
 * como huecos para no inventar datos.
 */
@Component({
  selector: 'app-mood-trend',
  template: `
    <svg viewBox="0 0 320 150" preserveAspectRatio="none" class="chart" role="img" aria-label="Tendencia del ánimo">
      @for (row of rows; track row.level) {
        <line x1="34" x2="316" [attr.y1]="y(row.score)" [attr.y2]="y(row.score)" stroke="var(--line)" stroke-dasharray="3 4" />
        <text x="2" [attr.y]="y(row.score) + 5" font-size="14">{{ row.emoji }}</text>
      }
      @for (segment of segments(); track $index) {
        <polyline [attr.points]="segment" fill="none" stroke="var(--teal-500)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
      }
      @for (dot of dots(); track $index) {
        <circle [attr.cx]="dot.x" [attr.cy]="dot.y" r="5" [attr.fill]="dot.color" stroke="#fff" stroke-width="2" />
      }
    </svg>
    <div class="labels">
      @for (point of points(); track $index) {
        <span>{{ $index % 2 === 0 ? point.label : '' }}</span>
      }
    </div>
  `,
  styles: `
    .chart {
      width: 100%;
      height: 170px;
      overflow: visible;
    }
    .labels {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      padding-left: 34px;
      font-size: 0.72rem;
      color: var(--ink-3);
      font-weight: 700;
      text-transform: capitalize;
    }
  `,
})
export class MoodTrend {
  readonly points = input.required<DayPoint[]>();
  protected readonly rows = MOODS;

  y(score: number): number {
    return 14 + (score / 3) * 122;
  }

  private x(index: number): number {
    const count = Math.max(1, this.points().length - 1);
    return 40 + (index / count) * 272;
  }

  protected readonly dots = computed(() =>
    this.points().flatMap((point, index) =>
      point.value === null
        ? []
        : [{ x: this.x(index), y: this.y(point.value), color: MOODS[Math.round(point.value)].color }],
    ),
  );

  /** Tramos continuos: se cortan donde no hubo registro. */
  protected readonly segments = computed(() => {
    const segments: string[] = [];
    let current: string[] = [];
    this.points().forEach((point, index) => {
      if (point.value === null) {
        if (current.length > 1) segments.push(current.join(' '));
        current = [];
      } else {
        current.push(`${this.x(index)},${this.y(point.value)}`);
      }
    });
    if (current.length > 1) segments.push(current.join(' '));
    return segments;
  });
}
