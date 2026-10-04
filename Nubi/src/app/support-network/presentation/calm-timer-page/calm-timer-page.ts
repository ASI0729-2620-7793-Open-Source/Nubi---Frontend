import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStore } from '../../../shared/application/profile.store';
import { CalmSessionStore } from '../../application/calm-session.store';
import { CalmingResourceStore } from '../../application/calming-resource.store';
import { DeviceAudioPlayer } from '../../infrastructure/device-audio-player';

const DEFAULT_TIMER_MINUTES = 5;
const RING_RADIUS = 160;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * Temporizador de calma (sección 4.4.3): pantalla de foco único con la cuenta regresiva,
 * duraciones rápidas de 3, 5 y 10 minutos y la pregunta final sobre cómo se siente el
 * usuario. Si al terminar todavía no se calma, se sugiere pedir ayuda (política del
 * Design-Level Event Storming, sección 4.6.1).
 */
@Component({
  selector: 'app-calm-timer-page',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './calm-timer-page.html',
  styleUrl: './calm-timer-page.css',
})
export class CalmTimerPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly audioPlayer = inject(DeviceAudioPlayer);
  private readonly resourceStore = inject(CalmingResourceStore);
  protected readonly sessionStore = inject(CalmSessionStore);
  protected readonly profileStore = inject(ProfileStore);

  private readonly sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

  protected readonly durations = [3, 5, 10];
  protected readonly ringRadius = RING_RADIUS;
  protected readonly ringLength = RING_LENGTH;
  /** El cuidador respondió que todavía no se calma: se muestra la sugerencia de ayuda. */
  protected readonly helpSuggested = signal(false);

  protected readonly session = computed(() => {
    const session = this.sessionStore.session();
    return session?.id === this.sessionId ? session : null;
  });
  protected readonly timer = computed(() => this.session()?.timer ?? null);
  protected readonly resource = computed(() => {
    const resourceId = this.session()?.resourceId;
    return resourceId ? this.resourceStore.findById(resourceId) : null;
  });
  protected readonly ringOffset = computed(
    () => RING_LENGTH * (1 - (this.timer()?.remainingRatio ?? 1)),
  );

  constructor() {
    this.sessionStore.loadById(this.sessionId);

    // Si se entra directo a esta vista y la sesión no tiene temporizador, empieza con 5 min
    effect(() => {
      const session = this.session();
      untracked(() => {
        if (session?.isOpen() && !session.timer) {
          this.sessionStore.startTimer(DEFAULT_TIMER_MINUTES);
        }
      });
    });

    const interval = setInterval(() => this.sessionStore.tick(), 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(interval);
      // Al volver al estímulo el sonido sigue; en cualquier otro caso se detiene
      const target = this.router.currentNavigation()?.finalUrl?.toString() ?? '';
      if (!target.startsWith('/autocuidado/estimulos')) {
        this.audioPlayer.stop();
      }
    });
  }

  /** 227 → "03:47" */
  protected clock(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  /** 5 → "5:00" */
  protected total(minutes: number): string {
    return `${minutes}:00`;
  }

  protected selectDuration(minutes: number): void {
    this.helpSuggested.set(false);
    this.sessionStore.startTimer(minutes);
  }

  protected togglePause(running: boolean): void {
    if (running) {
      this.sessionStore.pauseTimer();
    } else {
      this.sessionStore.resumeTimer();
    }
  }

  protected exit(): void {
    if (this.timer()?.running) {
      this.sessionStore.pauseTimer();
    }
    this.backToStimulus();
  }

  protected backToStimulus(): void {
    const resourceId = this.session()?.resourceId;
    this.router.navigate(resourceId ? ['/autocuidado/estimulos', resourceId] : ['/autocuidado']);
  }

  /** Se siente mejor: la sesión de calma termina y se vuelve a la galería. */
  protected feelsBetter(): void {
    this.sessionStore.finish();
    this.router.navigate(['/autocuidado']);
  }
}
