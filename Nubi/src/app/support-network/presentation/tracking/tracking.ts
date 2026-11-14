import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { triggerLabel } from '../../../crisis/domain/model/sos';
import { WellbeingStore } from '../../../insights/application/wellbeing.store';
import { calmMinutes, calmSessionsSince, moodsSince, topResources, topTriggers } from '../../../insights/domain/insights';
import { ChildStore } from '../../../profile/application/child.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { daysAgo, formatDate, formatDateTime, minutesBetween, relative, toDate } from '../../../shared/domain/dates';
import { moodInfo } from '../../../shared/domain/mood';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { EpisodeRecord, EpisodeReport, HelpRequest, SupportRecommendation } from '../../domain/model/support';
import { SupportApi } from '../../infrastructure/support-api';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';

type Tab = 'episodes' | 'help' | 'reports' | 'tips';

/** Seguimiento con la red de apoyo: episodios, pedidos de ayuda, reportes y recomendaciones. */
@Component({
  selector: 'app-tracking',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class Tracking implements OnInit {
  private readonly api = inject(SupportApi);
  private readonly toast = inject(ToastStore);
  private readonly wellbeing = inject(WellbeingStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly tab = signal<Tab>('episodes');
  protected readonly episodes = signal<EpisodeRecord[]>([]);
  protected readonly help = signal<HelpRequest[]>([]);
  protected readonly reports = signal<EpisodeReport[]>([]);
  protected readonly tips = signal<SupportRecommendation[]>([]);
  protected readonly loading = signal(true);

  protected readonly moodInfo = moodInfo;
  protected readonly triggerLabel = triggerLabel;
  protected readonly formatDate = formatDate;
  protected readonly formatDateTime = formatDateTime;
  protected readonly relative = relative;
  protected readonly minutesBetween = minutesBetween;

  protected editingNote: number | null = null;
  protected noteText = '';
  protected helpMessage = '';
  protected get quickMessages(): string[] {
    return [t('tracking.quick1'), t('tracking.quick2'), t('tracking.quick3')];
  }
  protected reportDays = 7;
  protected reportObservations = '';
  protected shareWith: Record<number, string> = {};
  protected tipFor: EpisodeRecord | null = null;
  protected tipForm = { title: '', description: '', strategy: '', actionGuide: '' };

  protected readonly contacts = computed(() =>
    [...(this.childStore.child()?.trustedContacts ?? [])].sort((a, b) => a.priorityOrder - b.priorityOrder),
  );
  protected readonly sortedEpisodes = computed(() =>
    [...this.episodes()].sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? '')),
  );
  protected readonly pendingHelp = computed(() => this.help().filter((h) => h.status === 'PENDING').length);

  private get childId(): number {
    return this.childStore.childId()!;
  }

  ngOnInit(): void {
    this.wellbeing.load();
    forkJoin({
      episodes: this.api.episodes(this.childId),
      help: this.api.helpRequests(this.childId),
      reports: this.api.reports(this.childId),
      tips: this.api.recommendations(this.childId),
    }).subscribe({
      next: ({ episodes, help, reports, tips }) => {
        this.episodes.set(episodes);
        this.help.set(help);
        this.reports.set(reports);
        this.tips.set(tips);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  // ---------- Episodios ----------

  editNote(episode: EpisodeRecord): void {
    this.editingNote = episode.id;
    this.noteText = episode.notes ?? '';
  }

  saveNote(episode: EpisodeRecord): void {
    this.api.addNote(episode.id, this.noteText).subscribe({
      next: (updated) => {
        this.episodes.update((list) => list.map((e) => (e.id === updated.id ? updated : e)));
        this.editingNote = null;
        this.toast.ok(t('tracking.notaGuardada'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  openTip(episode: EpisodeRecord): void {
    this.tipFor = episode;
    this.tipForm = {
      title: t('tracking.tipTitle', { p0: triggerLabel(episode.trigger).toLowerCase() }),
      description: '',
      strategy: '',
      actionGuide: '',
    };
  }

  saveTip(): void {
    const episode = this.tipFor;
    if (!episode) return;
    const { title, description, strategy, actionGuide } = this.tipForm;
    if (!title.trim() || !description.trim() || !strategy.trim() || !actionGuide.trim()) {
      this.toast.error(t('tracking.completaTodosLosCampos'));
      return;
    }
    this.api
      .createRecommendation({ profileId: this.childId, episodeRecordId: episode.id, title, description, strategy, actionGuide })
      .subscribe({
        next: (tip) => {
          this.tips.update((list) => [tip, ...list]);
          this.tipFor = null;
          this.tab.set('tips');
          this.toast.ok(t('tracking.recomendacionGuardadaParaT'));
        },
        error: (error) => this.toast.error(apiErrorMessage(error)),
      });
  }

  // ---------- Pedir ayuda ----------

  sendHelp(message = this.helpMessage): void {
    if (!message.trim()) {
      this.toast.error(t('tracking.escribeQueNecesitas'));
      return;
    }
    this.api.requestHelp(this.childId, message.trim()).subscribe({
      next: (request) => {
        this.help.update((list) => [request, ...list]);
        this.helpMessage = '';
        this.toast.ok(t('tracking.pedidoEnviadoASu'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  resolveHelp(request: HelpRequest, confirm: boolean): void {
    const call = confirm ? this.api.confirmHelp(request.id) : this.api.cancelHelp(request.id);
    call.subscribe({
      next: (updated) => this.help.update((list) => list.map((h) => (h.id === updated.id ? updated : h))),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  // ---------- Reportes ----------

  /** Arma el reporte con los datos reales del periodo y lo guarda en el backend. */
  createReport(): void {
    const days = Number(this.reportDays);
    const start = daysAgo(days - 1);
    const end = new Date();
    const inRange = this.episodes().filter((e) => (toDate(e.startedAt) ?? new Date(0)) >= start);
    const moods = moodsSince(this.wellbeing.moods(), days);
    const calm = calmSessionsSince(this.wellbeing.calmSessions(), days);
    const favorite = topResources(calm, this.wellbeing.resources())[0];
    const trigger = topTriggers(this.wellbeing.sosSessions().filter((s) => (toDate(s.startedAt) ?? new Date(0)) >= start))[0];
    const calmMoods = moods.filter((m) => m.level === 'CALM').length;

    const episodeNoun = t(inRange.length === 1 ? 'tracking.rep.episode' : 'tracking.rep.episodes');
    const parts = [
      t('tracking.rep.summary', { name: this.childStore.name(), count: inRange.length, noun: episodeNoun, days }),
      moods.length ? t('tracking.rep.calmMoods', { calm: calmMoods, total: moods.length }) : t('tracking.rep.noMoods'),
      calm.length ? t('tracking.rep.calmUse', { count: calm.length, min: calmMinutes(calm) }) : '',
      favorite ? t('tracking.rep.favorite', { label: favorite.label }) : '',
      trigger && trigger.key !== 'NONE' ? t('tracking.rep.trigger', { label: trigger.label.toLowerCase() }) : '',
    ];

    this.api
      .createReport({
        profileId: this.childId,
        periodStart: toLocal(start),
        periodEnd: toLocal(end),
        episodeCount: inRange.length,
        summary: parts.filter(Boolean).join(' '),
        observations: this.reportObservations.trim() || null,
      })
      .subscribe({
        next: (report) => {
          this.reports.update((list) => [report, ...list]);
          this.reportObservations = '';
          this.toast.ok(t('tracking.reporteCreado'));
        },
        error: (error) => this.toast.error(apiErrorMessage(error)),
      });
  }

  share(report: EpisodeReport): void {
    const target = (this.shareWith[report.id] ?? '').trim();
    if (!target) {
      this.toast.error(t('tracking.indicaConQuienLo'));
      return;
    }
    this.api.shareReport(report.id, target).subscribe({
      next: (updated) => {
        this.reports.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.ok(t('tracking.reporteCompartidoCon', { p0: target }));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  copy(report: EpisodeReport): void {
    const text = `${t('tracking.copyHeader', { from: formatDate(report.periodStart), to: formatDate(report.periodEnd) })}\n${report.summary}${report.observations ? `\n${t('tracking.copyNotes')} ${report.observations}` : ''}`;
    void navigator.clipboard?.writeText(text).then(() => this.toast.ok(t('tracking.copiadoPegaloEnWhatsapp')));
  }

  // ---------- Recomendaciones ----------

  markEffective(tip: SupportRecommendation): void {
    this.api.markEffective(tip.id).subscribe({
      next: (updated) => {
        this.tips.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.toast.ok(t('tracking.queBienLaMarcamos'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }
}

/** LocalDateTime sin zona, como lo espera Red de Apoyo y Seguimiento. */
function toLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
