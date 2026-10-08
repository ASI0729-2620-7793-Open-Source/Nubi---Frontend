import { Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { CalmSessionStore } from '../../application/calm-session.store';
import { CalmingResourceStore } from '../../application/calming-resource.store';
import { CalmSession } from '../../domain/model/calm-session.entity';
import { CalmingResource } from '../../domain/model/calming-resource.entity';
import { DeviceAudioPlayer } from '../../infrastructure/device-audio-player';
import { StimulusStage } from '../component/stimulus-stage/stimulus-stage';

/** Duración con la que se inicia el temporizador de calma desde esta vista. */
const DEFAULT_TIMER_MINUTES = 5;

/**
 * Estímulo en uso (sección 4.4.3): el estímulo ocupa la mayor parte de la pantalla y
 * debajo están la intensidad, el modo de baja estimulación y el temporizador de calma.
 * La misma vista sirve para los seis recursos de la galería.
 */
@Component({
  selector: 'app-stimulus-session',
  imports: [RouterLink, MatIconModule, TranslatePipe, StimulusStage],
  templateUrl: './stimulus-session.html',
  styleUrl: './stimulus-session.css',
})
export class StimulusSession {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly audioPlayer = inject(DeviceAudioPlayer);
  protected readonly resourceStore = inject(CalmingResourceStore);
  protected readonly sessionStore = inject(CalmSessionStore);

  private readonly resourceId = Number(this.route.snapshot.paramMap.get('resourceId'));
  private readonly soundEnabled = signal(true);

  protected readonly soundPlaying = this.audioPlayer.playing;
  protected readonly resource = computed(() => this.resourceStore.findById(this.resourceId));
  /** Sesión abierta con el recurso de esta vista. */
  protected readonly session = computed(() => {
    const session = this.sessionStore.session();
    return session?.isOpen() && session.resourceId === this.resourceId ? session : null;
  });
  protected readonly intensityRatio = computed(() => {
    const session = this.session();
    const resource = this.resource();
    return session && resource ? session.intensity / resource.maxIntensity : 0.6;
  });
  /** Tramo recorrido del control deslizante, que va de 1 al máximo del recurso. */
  protected readonly fillPercent = computed(() => {
    const session = this.session();
    const resource = this.resource();
    if (!session || !resource || resource.maxIntensity <= 1) return 0;
    return ((session.intensity - 1) / (resource.maxIntensity - 1)) * 100;
  });

  constructor() {
    // Abre (o continúa) la sesión de calma en cuanto el recurso está disponible
    let opened = false;
    effect(() => {
      const resource = this.resource();
      untracked(() => {
        if (resource && !opened) {
          opened = true;
          this.sessionStore.openWithResource(resource);
        }
      });
    });

    // Los estímulos auditivos suenan mientras la sesión esté abierta y siguen la intensidad
    effect(() => {
      const resource = this.resource();
      const session = this.session();
      const enabled = this.soundEnabled();
      if (!resource?.isAuditory() || !session) return;

      untracked(() => {
        if (enabled) {
          this.audioPlayer.play(resource.code, this.volume(session, resource));
        } else {
          this.audioPlayer.stop();
        }
      });
    });

    // Si se pasa al temporizador, el sonido continúa; en cualquier otro caso se detiene
    inject(DestroyRef).onDestroy(() => {
      const target = this.router.currentNavigation()?.finalUrl?.toString() ?? '';
      if (!target.startsWith('/autocuidado/temporizador')) {
        this.audioPlayer.stop();
      }
    });
  }

  protected onIntensityInput(value: number, resource: CalmingResource): void {
    this.sessionStore.adjustIntensity(value, resource);
  }

  protected toggleLowStimulation(session: CalmSession): void {
    this.sessionStore.setLowStimulation(!session.lowStimulationActive);
  }

  protected toggleSound(resource: CalmingResource, session: CalmSession): void {
    if (this.soundPlaying()) {
      this.soundEnabled.set(false);
      return;
    }
    this.soundEnabled.set(true);
    this.audioPlayer.play(resource.code, this.volume(session, resource));
  }

  protected useTimer(session: CalmSession): void {
    if (session.timer && !session.timer.isExpired()) {
      this.sessionStore.resumeTimer();
    } else {
      this.sessionStore.startTimer(DEFAULT_TIMER_MINUTES);
    }
    this.router.navigate(['/autocuidado/temporizador', session.id]);
  }

  protected finish(): void {
    this.sessionStore.finish();
    this.router.navigate(['/autocuidado']);
  }

  private volume(session: CalmSession, resource: CalmingResource): number {
    const volume = 0.12 + 0.5 * (session.intensity / resource.maxIntensity);
    return session.lowStimulationActive ? volume * 0.5 : volume;
  }
}
