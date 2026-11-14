import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { avatarOf } from '../../../profile/domain/model/child-profile';

/**
 * Modo niño: pantalla completa, sin menús de configuración y con muy pocas opciones a la vez.
 * Para salir, un adulto mantiene presionado el botón durante 2 segundos (así el niño no sale
 * por accidente).
 */
@Component({
  selector: 'app-kid-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="kid">
      <header class="bar">
        <a class="me" routerLink="/nino">
          <span class="avatar">{{ avatar().emoji ?? avatar().text }}</span>
          <strong>{{ childStore.name() }}</strong>
        </a>
        <nav>
          <a routerLink="/nino" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active" aria-label="Inicio">🏠</a>
          <a routerLink="/nino/hablar" routerLinkActive="active" aria-label="Hablar">💬</a>
          <a routerLink="/nino/mi-dia" routerLinkActive="active" aria-label="Mi día">🗓️</a>
        </nav>
        <button
          class="exit"
          type="button"
          [style.--hold]="hold()"
          (pointerdown)="startHold()"
          (pointerup)="cancelHold()"
          (pointerleave)="cancelHold()"
          (keydown.enter)="exit()"
          aria-label="Salir del modo niño (mantener presionado)"
        >
          <span class="icon">lock</span>
          <span class="label">{{ holding() ? 'Sigue…' : 'Adultos' }}</span>
        </button>
      </header>
      <main>
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background:
        radial-gradient(circle at 0% 0%, #e5f6f1, transparent 45%),
        radial-gradient(circle at 100% 100%, #efecfc, transparent 50%),
        #f7faf9;
    }
    .kid {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      max-width: 1100px;
      margin: 0 auto;
      padding: 14px clamp(12px, 3vw, 28px) 28px;
    }
    .bar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .me {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--ink);
      font-size: 1.2rem;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #fff;
      font-size: 1.8rem;
      font-weight: 900;
      color: var(--teal-700);
      box-shadow: var(--shadow-s);
    }
    nav {
      display: flex;
      gap: 8px;
      margin: 0 auto;
      padding: 6px;
      border-radius: 999px;
      background: #fff;
      box-shadow: var(--shadow-s);
    }
    nav a {
      display: grid;
      place-items: center;
      width: 56px;
      height: 48px;
      border-radius: 999px;
      font-size: 1.6rem;
    }
    nav a.active {
      background: var(--mint-100);
    }
    .exit {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      border: 0;
      border-radius: 999px;
      overflow: hidden;
      background: #fff;
      color: var(--ink-3);
      font-weight: 800;
      cursor: pointer;
      box-shadow: var(--shadow-s);
      user-select: none;
      touch-action: none;
    }
    .exit::before {
      content: '';
      position: absolute;
      inset: 0;
      width: calc(var(--hold) * 100%);
      background: var(--mint-100);
      z-index: 0;
    }
    .exit > * {
      position: relative;
    }
    main {
      flex: 1;
      padding-top: 22px;
    }
    @media (max-width: 560px) {
      .me strong,
      .exit .label {
        display: none;
      }
    }
  `,
})
export class KidShell implements OnDestroy {
  protected readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);
  protected readonly avatar = computed(() => {
    const child = this.childStore.child();
    return child ? avatarOf(child) : { text: '' };
  });
  protected readonly hold = signal(0);
  protected readonly holding = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  startHold(): void {
    this.cancelHold();
    this.holding.set(true);
    const started = Date.now();
    this.timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / 2000);
      this.hold.set(progress);
      if (progress >= 1) this.exit();
    }, 50);
  }

  cancelHold(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.holding.set(false);
    this.hold.set(0);
  }

  exit(): void {
    this.cancelHold();
    void this.router.navigate(['/inicio']);
  }

  ngOnDestroy(): void {
    this.cancelHold();
  }
}
