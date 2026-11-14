import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrisisRecommendation, TOPICS } from '../../../crisis/domain/model/sos';
import { SosApi } from '../../../crisis/infrastructure/sos-api';
import { WellbeingStore } from '../../../insights/application/wellbeing.store';
import { calmMinutes, calmPerDay, insightMessages } from '../../../insights/domain/insights';
import { SessionStore } from '../../../iam/application/session.store';
import { ChildStore } from '../../../profile/application/child.store';
import { avatarOf, initials } from '../../../profile/domain/model/child-profile';
import { RoutineApi } from '../../../routine/infrastructure/routine-api';
import { nextStep, RoutineStep, shortTime } from '../../../routine/domain/model/routine-step';
import { lookOf } from '../../../self-regulation/domain/model/calm';
import { ToastStore } from '../../../shared/application/toast.store';
import { greeting, relative } from '../../../shared/domain/dates';
import { MoodLevel, moodInfo } from '../../../shared/domain/mood';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { DayBars } from '../../../shared/presentation/charts/day-bars';
import { ProgressRing } from '../../../shared/presentation/charts/progress-ring';
import { MoodPicker } from '../../../shared/presentation/mood-picker/mood-picker';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';
import { ServerTextPipe } from '../../../shared/presentation/server-text.pipe';
import { I18nStore } from '../../../shared/application/i18n.store';

/** Panel del cuidador: cómo está el niño hoy y qué sigue en su día. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, MoodPicker, ProgressRing, DayBars, TranslatePipe, ServerTextPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  protected readonly session = inject(SessionStore);
  protected readonly childStore = inject(ChildStore);
  protected readonly wellbeing = inject(WellbeingStore);
  private readonly lang = inject(I18nStore).lang;
  private readonly routineApi = inject(RoutineApi);
  private readonly sosApi = inject(SosApi);
  private readonly toast = inject(ToastStore);

  protected readonly greeting = greeting;
  protected readonly initials = initials;
  protected readonly avatarOf = avatarOf;
  protected readonly moodInfo = moodInfo;
  protected readonly relative = relative;
  protected readonly shortTime = shortTime;
  protected readonly topics = TOPICS;
  protected readonly lookOf = lookOf;
  protected readonly savingMood = signal(false);
  protected readonly recommendations = signal<CrisisRecommendation[]>([]);

  protected readonly next = computed(() => nextStep(this.wellbeing.routine()));
  protected readonly upcoming = computed(() => this.wellbeing.routine().filter((step) => !step.completedToday).slice(0, 4));
  protected readonly weekMinutes = computed(() => calmMinutes(this.wellbeing.weekCalm()));
  protected readonly calmDays = computed(() => (this.lang(), calmPerDay(this.wellbeing.calmSessions(), 7)));
  protected readonly lastCalm = computed(() => {
    const last = [...this.wellbeing.calmSessions()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
    if (!last) return null;
    return { session: last, resource: this.wellbeing.resources().find((r) => r.id === last.resourceId) };
  });
  protected readonly insights = computed(() => (this.lang(), insightMessages({
      childName: this.childStore.name(),
      moods: this.wellbeing.moods(),
      calm: this.wellbeing.calmSessions(),
      sos: this.wellbeing.sosSessions(),
      resources: this.wellbeing.resources(),
    }).slice(0, 3)));

  ngOnInit(): void {
    this.wellbeing.load();
    const id = this.childStore.childId();
    if (id) {
      this.sosApi.recommendations(id).subscribe({ next: (list) => this.recommendations.set(list.slice(0, 3)), error: () => {} });
    }
  }

  registerMood(level: MoodLevel): void {
    this.savingMood.set(true);
    this.wellbeing.registerMood(level).subscribe({
      next: (mood) => {
        this.wellbeing.addMood(mood);
        this.savingMood.set(false);
        this.toast.ok(t('home.anotado', { p0: moodInfo(level).label.toLowerCase(), p1: moodInfo(level).emoji }));
      },
      error: (error) => {
        this.savingMood.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  toggleStep(step: RoutineStep): void {
    const id = this.childStore.childId()!;
    this.routineApi.complete(id, step.id, !step.completedToday).subscribe({
      next: (updated) => {
        this.wellbeing.replaceStep(updated);
        if (updated.completedToday) this.toast.ok(t('home.hecho', { p0: updated.icon, p1: updated.title }));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  generateRecommendations(): void {
    const id = this.childStore.childId()!;
    this.sosApi.generateRecommendations(id).subscribe({
      next: (list) => {
        this.recommendations.set(list.slice(0, 3));
        this.toast.ok(t('home.preparamosRecomendacionesS'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }
}
