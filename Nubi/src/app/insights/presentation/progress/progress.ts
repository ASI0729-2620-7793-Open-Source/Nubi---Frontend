import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { formatDate } from '../../../shared/domain/dates';
import { MOODS, moodInfo } from '../../../shared/domain/mood';
import { DayBars } from '../../../shared/presentation/charts/day-bars';
import { MoodTrend } from '../../../shared/presentation/charts/mood-trend';
import { WellbeingStore } from '../../application/wellbeing.store';
import {
  averageSosMinutes,
  calmMinutes,
  calmPerDay,
  calmSessionsSince,
  insightMessages,
  moodDistribution,
  moodTrend,
  moodsSince,
  sosImprovement,
  sosSince,
  topResources,
  topTriggers,
} from '../../domain/insights';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nStore } from '../../../shared/application/i18n.store';

/**
 * Progreso del niño (funcionalidad nueva): tendencia del ánimo, momentos de calma, qué recursos
 * le funcionan y qué suele desencadenar sus crisis. Todo calculado con los datos del backend.
 */
@Component({
  selector: 'app-progress',
  imports: [RouterLink, DayBars, MoodTrend, TranslatePipe],
  templateUrl: './progress.html',
  styleUrl: './progress.css',
})
export class Progress implements OnInit {
  protected readonly wellbeing = inject(WellbeingStore);
  private readonly lang = inject(I18nStore).lang;
  protected readonly childStore = inject(ChildStore);
  protected readonly range = signal<7 | 14 | 30>(14);
  protected readonly moods = MOODS;
  protected readonly moodInfo = moodInfo;
  protected readonly formatDate = formatDate;

  protected readonly rangeMoods = computed(() => moodsSince(this.wellbeing.moods(), this.range()));
  protected readonly rangeCalm = computed(() => calmSessionsSince(this.wellbeing.calmSessions(), this.range()));
  protected readonly rangeSos = computed(() => sosSince(this.wellbeing.sosSessions(), this.range()));

  protected readonly trend = computed(() => (this.lang(), moodTrend(this.wellbeing.moods(), this.range())));
  protected readonly distribution = computed(() => (this.lang(), moodDistribution(this.rangeMoods())));
  protected readonly calmDays = computed(() => (this.lang(), calmPerDay(this.wellbeing.calmSessions(), Math.min(this.range(), 14))));
  protected readonly minutes = computed(() => calmMinutes(this.rangeCalm()));
  protected readonly resources = computed(() => (this.lang(), topResources(this.rangeCalm(), this.wellbeing.resources()).slice(0, 5)));
  protected readonly triggers = computed(() => (this.lang(), topTriggers(this.rangeSos()).slice(0, 5)));
  protected readonly improvement = computed(() => sosImprovement(this.rangeSos()));
  protected readonly improvementText = computed(() => {
    const value = this.improvement();
    return value === null ? '—' : (value > 0 ? '−' : '') + Math.abs(value).toFixed(1);
  });
  protected readonly avgSos = computed(() => averageSosMinutes(this.rangeSos()));
  protected readonly fromSos = computed(() => this.rangeCalm().filter((s) => s.startedBySos).length);
  protected readonly calmShare = computed(() => {
    const total = this.rangeMoods().length;
    return total ? Math.round((this.rangeMoods().filter((m) => m.level === 'CALM').length / total) * 100) : null;
  });
  protected readonly insights = computed(() => (this.lang(), insightMessages({
      childName: this.childStore.name(),
      moods: this.rangeMoods(),
      calm: this.rangeCalm(),
      sos: this.rangeSos(),
      resources: this.wellbeing.resources(),
    })));
  protected readonly recentSos = computed(() =>
    [...this.rangeSos()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 6),
  );

  ngOnInit(): void {
    this.wellbeing.load();
  }

  /** Arco del donut del ánimo. */
  donut(): { color: string; dash: string; offset: number }[] {
    const circumference = 2 * Math.PI * 40;
    let accumulated = 0;
    return this.distribution()
      .filter((slice) => slice.count > 0)
      .map((slice) => {
        const length = slice.share * circumference;
        const arc = { color: moodInfo(slice.level).color, dash: `${length} ${circumference - length}`, offset: -accumulated };
        accumulated += length;
        return arc;
      });
  }
}
