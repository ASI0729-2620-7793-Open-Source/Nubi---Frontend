import { Component, OnDestroy, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { WellbeingStore } from '../../../insights/application/wellbeing.store';
import { ChildStore } from '../../../profile/application/child.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { MoodLevel, moodInfo } from '../../../shared/domain/mood';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { MoodPicker } from '../../../shared/presentation/mood-picker/mood-picker';
import { CalmSession, CalmingResource, lookOf } from '../../domain/model/calm';
import { CalmApi } from '../../infrastructure/calm-api';
import { DeviceAudioPlayer } from '../../infrastructure/device-audio-player';
import { BreathingBalloon } from '../components/breathing-balloon/breathing-balloon';
import { CalmCanvas } from '../components/calm-canvas/calm-canvas';
import { StimulusStage } from '../components/stimulus-stage/stimulus-stage';

/**
 * Momento de calma a pantalla completa. Abre una sesión en el backend, la mantiene al día
 * (intensidad, baja estimulación, pausa, temporizador) y al terminar pregunta cómo se siente.
 */
@Component({
  selector: 'app-calm-player',
  imports: [RouterLink, StimulusStage, BreathingBalloon, CalmCanvas, MoodPicker],
  templateUrl: './calm-player.html',
  styleUrl: './calm-player.css',
})
export class CalmPlayer implements OnInit, OnDestroy {
  /** Parámetros de ruta (withComponentInputBinding). */
  readonly resourceId = input.required<string>();
  readonly modo = input<string>();
  readonly sos = input<string>();

  private readonly api = inject(CalmApi);
  private readonly audio = inject(DeviceAudioPlayer);
  private readonly childStore = inject(ChildStore);
  private readonly wellbeing = inject(WellbeingStore);
  private readonly toast = inject(ToastStore);
  private readonly router = inject(Router);

  protected readonly resource = signal<CalmingResource | null>(null);
  protected readonly session = signal<CalmSession | null>(null);
  protected readonly remaining = signal(0);
  protected readonly phase = signal<'playing' | 'ask' | 'done'>('playing');
  protected readonly needsAudioTap = signal(false);
  protected readonly showControls = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly lookOf = lookOf;
  protected readonly durations = [2, 5, 10];

  protected readonly kidMode = computed(() => this.modo() === 'nino');
  protected readonly paused = computed(() => this.session()?.status === 'PAUSED');
  protected readonly isStimulus = computed(() => ['VISUAL', 'AUDITORY'].includes(this.resource()?.type ?? ''));
  protected readonly intensityShare = computed(() => {
    const resource = this.resource();
    return resource ? (this.session()?.intensity ?? 5) / resource.maxIntensity : 0.5;
  });
  protected readonly clock = computed(() => {
    const seconds = Math.max(0, this.remaining());
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  private ticker: ReturnType<typeof setInterval> | null = null;
  private pendingSeconds = 0;
  private intensityDebounce: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const childId = this.childStore.childId()!;
    const resourceId = Number(this.resourceId());
    this.api
      .resource(resourceId)
      .pipe(
        switchMap((resource) => {
          this.resource.set(resource);
          return this.api.start(childId, resource.id, this.sos() === '1');
        }),
      )
      .subscribe({
        next: (session) => {
          this.session.set(session);
          this.startAudio(true);
        },
        error: (error) => this.error.set(apiErrorMessage(error)),
      });
    this.ticker = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.ticker) clearInterval(this.ticker);
    this.audio.stop();
    const session = this.session();
    // Si salen sin terminar, la sesión se cierra igual para no dejarla abierta
    if (session && session.status !== 'FINISHED') {
      this.api.finish(session.id).subscribe({ error: () => {} });
    }
  }

  /** Respeta "confirmar antes de reproducir audio" del perfil sensorial. */
  startAudio(automatic = false): void {
    const resource = this.resource();
    if (resource?.type !== 'AUDITORY') return;
    const confirmAudio = this.childStore.child()?.sensoryProfile?.confirmAudio ?? false;
    if (automatic && confirmAudio) {
      this.needsAudioTap.set(true);
      return;
    }
    this.needsAudioTap.set(false);
    this.audio.play(resource.code, this.volume());
  }

  setIntensity(value: number): void {
    const session = this.session();
    if (!session) return;
    this.session.set({ ...session, intensity: value });
    if (this.resource()?.type === 'AUDITORY') this.audio.setVolume(this.volume());
    if (this.intensityDebounce) clearTimeout(this.intensityDebounce);
    this.intensityDebounce = setTimeout(() => {
      this.api.intensity(session.id, value).subscribe({
        next: (updated) => this.session.set(updated),
        error: (error) => this.toast.error(apiErrorMessage(error)),
      });
    }, 400);
  }

  toggleLowStimulation(): void {
    const session = this.session();
    if (!session) return;
    this.api.lowStimulation(session.id, !session.lowStimulationActive).subscribe({
      next: (updated) => {
        this.session.set(updated);
        if (this.resource()?.type === 'AUDITORY') this.audio.setVolume(this.volume());
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  togglePause(): void {
    const session = this.session();
    if (!session) return;
    const request = this.paused() ? this.api.resume(session.id) : this.api.pause(session.id);
    request.subscribe({
      next: (updated) => {
        this.session.set(updated);
        if (updated.status === 'PAUSED') this.audio.setVolume(0);
        else this.audio.setVolume(this.volume());
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  startTimer(minutes: number): void {
    const session = this.session();
    if (!session) return;
    this.flushTicks();
    this.api.startTimer(session.id, minutes).subscribe({
      next: (updated) => {
        this.session.set(updated);
        this.remaining.set(updated.timer?.remainingSeconds ?? minutes * 60);
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  finish(): void {
    const session = this.session();
    this.audio.stop();
    if (!session) {
      this.leave();
      return;
    }
    this.flushTicks();
    this.api.finish(session.id).subscribe({
      next: (finished) => {
        this.session.set(finished);
        this.phase.set('ask');
      },
      error: () => this.phase.set('ask'),
    });
  }

  answer(level: MoodLevel): void {
    this.wellbeing.registerMood(level).subscribe({
      next: (mood) => {
        this.wellbeing.addMood(mood);
        this.phase.set('done');
        if (!this.kidMode()) this.toast.ok(`Anotamos que terminó ${moodInfo(level).label.toLowerCase()}.`);
        setTimeout(() => this.leave(), 1600);
      },
      error: () => this.leave(),
    });
  }

  leave(): void {
    // Si se abrió desde el Modo SOS, se vuelve a la guía para seguir con los pasos
    if (this.sos() === '1' && history.length > 1) {
      history.back();
      return;
    }
    void this.router.navigate([this.kidMode() ? '/nino' : '/calma']);
  }

  private volume(): number {
    const session = this.session();
    if (!session || session.status === 'PAUSED') return 0;
    const base = this.intensityShare() * 0.8;
    return session.lowStimulationActive ? base * 0.5 : base;
  }

  /** Cuenta regresiva local; cada 10 s se informa al backend lo transcurrido. */
  private tick(): void {
    const session = this.session();
    if (!session?.timer?.running || this.paused() || this.phase() !== 'playing') return;
    if (this.remaining() <= 0) return;
    this.remaining.update((value) => value - 1);
    this.pendingSeconds++;
    if (this.pendingSeconds >= 10 || this.remaining() === 0) this.flushTicks();
  }

  private flushTicks(): void {
    const session = this.session();
    const seconds = this.pendingSeconds;
    if (!session?.timer?.running || seconds === 0) return;
    this.pendingSeconds = 0;
    this.api.tick(session.id, seconds).subscribe({
      next: (updated) => {
        this.session.set(updated);
        this.remaining.set(updated.timer?.remainingSeconds ?? 0);
      },
      error: () => {},
    });
  }
}
