import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from '../../../iam/application/session.store';
import { ChildStore } from '../../../profile/application/child.store';
import { MOODS, MoodLevel } from '../../../shared/domain/mood';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { SensoryTrigger, TRIGGERS } from '../../domain/model/sos';
import { SosApi } from '../../infrastructure/sos-api';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Activación del Modo SOS. Pocas decisiones y botones grandes: en una crisis el cuidador
 * necesita empezar ya. Si no sabe el detonante, el backend usa el sentido más sensible del niño.
 */
@Component({
  selector: 'app-sos-start',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './sos-start.html',
  styleUrl: './sos.css',
})
export class SosStart implements OnInit {
  private readonly api = inject(SosApi);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly moods = MOODS.filter((mood) => mood.level !== 'CALM');
  protected readonly triggers = TRIGGERS;
  protected readonly intensity = signal<MoodLevel>('ALTERED');
  protected readonly trigger = signal<SensoryTrigger | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Si ya hay una sesión en curso, se retoma en lugar de abrir otra
    this.api.inProgress(this.childStore.childId()!).subscribe({
      next: (open) => void this.router.navigate(['/sos', open.id], { replaceUrl: true }),
      error: () => {},
    });
  }

  start(): void {
    this.busy.set(true);
    this.error.set(null);
    const trigger = this.trigger();
    this.api
      .start(this.childStore.childId()!, this.session.user()!.id, trigger === 'NONE' ? null : trigger, this.intensity())
      .subscribe({
        next: (session) => void this.router.navigate(['/sos', session.id]),
        error: (error) => {
          this.busy.set(false);
          this.error.set(apiErrorMessage(error));
        },
      });
  }
}
