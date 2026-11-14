import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { TranslatePipe } from '@ngx-translate/core';

/** Se muestra cuando el backend no responde, en lugar de mandar al cuidador a registrar otro niño. */
@Component({
  selector: 'app-offline',
  imports: [TranslatePipe],
  template: `
    <div class="wrap">
      <div class="card box">
        <span class="cloud">☁️</span>
        <h1>{{ 'offline.noPudimosConectarCon' | translate }}</h1>
        <p class="lead">
          {{ 'offline.revisaTuConexionSi' | translate }}
        </p>
        <button class="btn btn-primary" type="button" [disabled]="trying()" (click)="retry()">
          <span class="icon">refresh</span> {{ trying() ? ('offline.intentando' | translate) : ('offline.reintentar' | translate) }}
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
