import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SosModeStore } from '../../../application/sos-mode.store';
import { SosSession } from '../../../domain/model/sos-session.entity';

/**
 * Activar Modo SOS (US-07 y US-12): el cuidador elige a quién acompañar y toca el círculo
 * para empezar la guía paso a paso. Si dejó una guía a medias para ese perfil, puede
 * retomarla o darla por terminada.
 */
@Component({
  selector: 'app-sos-activation',
  imports: [MatIconModule, RouterLink, TranslatePipe],
  templateUrl: './sos-activation.html',
  styleUrl: './sos-activation.css',
})
export class SosActivation {
  private readonly router = inject(Router);
  protected readonly store = inject(SosModeStore);

  protected activate(): void {
    this.store.activate().subscribe((session) => this.openGuide(session));
  }

  protected resume(session: SosSession): void {
    this.openGuide(session);
  }

  /** Cierra el episodio que quedó abierto: el resumen lo guarda como finalizado anticipadamente. */
  protected finishNow(session: SosSession): void {
    this.router.navigate(['/modo-sos/sesion', session.id, 'resumen']);
  }

  private openGuide(session: SosSession): void {
    this.router.navigate(['/modo-sos/sesion', session.id]);
  }
}
