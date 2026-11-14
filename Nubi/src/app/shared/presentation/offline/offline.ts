import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';

/** Se muestra cuando el backend no responde, en lugar de mandar al cuidador a registrar otro niño. */
@Component({
  selector: 'app-offline',
  template: `
    <div class="wrap">
      <div class="card box">
        <span class="cloud">☁️</span>
        <h1>No pudimos conectar con Nubi</h1>
        <p class="lead">
          Revisa tu conexión. Si Nubi no se usó en un rato, el servidor tarda alrededor de un minuto en despertar: espera un momento y reintenta.
        </p>
        <button class="btn btn-primary" type="button" [disabled]="trying()" (click)="retry()">
          <span class="icon">refresh</span> {{ trying() ? 'Intentando…' : 'Reintentar' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 16px;
    }
    .box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      max-width: 460px;
      text-align: center;
    }
    .cloud {
      font-size: 4rem;
    }
  `,
})
export class Offline {
  private readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);
  protected readonly trying = signal(false);

  retry(): void {
    this.trying.set(true);
    this.childStore.load().subscribe((child) => {
      this.trying.set(false);
      if (child !== undefined) void this.router.navigate([child ? '/inicio' : '/bienvenida']);
    });
  }
}
