import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { WellbeingStore } from '../../../insights/application/wellbeing.store';
import { ChildStore } from '../../../profile/application/child.store';
import { CalmingResource } from '../../../self-regulation/domain/model/calm';
import { CalmApi } from '../../../self-regulation/infrastructure/calm-api';
import { ToastStore } from '../../../shared/application/toast.store';
import { MOODS, MoodLevel, moodInfo } from '../../../shared/domain/mood';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import {
  ActionGuide,
  AlternativeTechnique,
  ContainmentStep,
  OBSERVED_STATES,
  ObservedState,
  SosSession,
  triggerLabel,
} from '../../domain/model/sos';
import { SosApi } from '../../infrastructure/sos-api';

/** Guía de contención paso a paso, ordenada por el backend según el detonante. */
@Component({
  selector: 'app-sos-guide',
  imports: [RouterLink],
  templateUrl: './sos-guide.html',
  styleUrl: '../sos-start/sos.css',
})
export class SosGuide implements OnInit {
  readonly sessionId = input.required<string>();

  private readonly api = inject(SosApi);
  private readonly calmApi = inject(CalmApi);
  private readonly toast = inject(ToastStore);
  private readonly wellbeing = inject(WellbeingStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly session = signal<SosSession | null>(null);
  protected readonly guide = signal<ActionGuide | null>(null);
  protected readonly alternative = signal<AlternativeTechnique | null>(null);
  protected readonly breathing = signal<CalmingResource | null>(null);
  protected readonly finishing = signal(false);
  protected readonly busy = signal(false);
  protected readonly observed = signal<ObservedState | null>('CALM');
  protected readonly finalIntensity = signal<MoodLevel | null>(null);

  protected readonly moods = MOODS;
  protected readonly states = OBSERVED_STATES;
  protected readonly moodInfo = moodInfo;
  protected readonly triggerLabel = triggerLabel;

  protected readonly handled = computed(() => new Map((this.session()?.completedSteps ?? []).map((s) => [s.stepId, s])));
  protected readonly current = computed<ContainmentStep | null>(
    () => this.guide()?.steps.find((step) => !this.handled().has(step.id)) ?? null,
  );
  protected readonly position = computed(() => {
    const current = this.current();
    const steps = this.guide()?.steps ?? [];
    return current ? steps.indexOf(current) + 1 : steps.length;
  });
  protected readonly finished = computed(() => this.session()?.status !== 'IN_PROGRESS' && !!this.session());
  protected readonly contacts = computed(() =>
    [...(this.childStore.child()?.trustedContacts ?? [])].sort((a, b) => a.priorityOrder - b.priorityOrder).slice(0, 2),
  );

  ngOnInit(): void {
    const id = Number(this.sessionId());
    forkJoin({ session: this.api.session(id), guide: this.api.guide(id) }).subscribe({
      next: ({ session, guide }) => {
        this.session.set(session);
        this.guide.set(guide);
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
    this.calmApi.resources().subscribe({
      next: (list) => this.breathing.set(list.find((r) => r.code === 'BALLOON_BREATHING') ?? null),
      error: () => {},
    });
  }

  stepState(step: ContainmentStep): 'done' | 'skipped' | 'current' | '' {
    const handled = this.handled().get(step.id);
    if (handled) return handled.skipped ? 'skipped' : 'done';
    return !this.finished() && this.current()?.id === step.id ? 'current' : '';
  }

  complete(step: ContainmentStep): void {
    this.run(this.api.complete(this.session()!.id, step.id));
  }

  skip(step: ContainmentStep): void {
    if (step.mandatory && !confirm('Este paso es importante para su seguridad. ¿Seguro que quieres omitirlo?')) return;
    this.run(this.api.skip(this.session()!.id, step.id));
  }

  askAlternative(step: ContainmentStep): void {
    this.api.alternative(this.session()!.id, step.id).subscribe({
      next: (technique) => this.alternative.set(technique),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  finish(): void {
    this.busy.set(true);
    this.api.finish(this.session()!.id, this.observed(), this.finalIntensity()).subscribe({
      next: (session) => {
        this.session.set(session);
        this.finishing.set(false);
        this.busy.set(false);
        this.wellbeing.load();
      },
      error: (error) => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  private run(request: ReturnType<SosApi['complete']>): void {
    this.busy.set(true);
    request.subscribe({
      next: (session) => {
        this.session.set(session);
        this.alternative.set(null);
        this.busy.set(false);
        if (!this.current()) this.finishing.set(true);
      },
      error: (error) => {
        this.busy.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }
}
