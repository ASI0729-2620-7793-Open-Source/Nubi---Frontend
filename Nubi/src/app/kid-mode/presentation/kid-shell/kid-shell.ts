import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { avatarOf } from '../../../profile/domain/model/child-profile';

/**
 * Modo niño: pantalla completa, sin menús de configuración y con muy pocas opciones a la vez.
 * La navegación es una barra redondeada a la izquierda con botones grandes (abajo en el
 * celular). Para salir, un adulto mantiene presionado el candado durante 2 segundos, así el
 * niño no sale por accidente.
 */
@Component({
  selector: 'app-kid-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="kid">
      <aside class="rail">
        <a class="me" routerLink="/nino" [attr.aria-label]="'Inicio de ' + childStore.name()">
          <span class="avatar">{{ avatar().emoji ?? avatar().text }}</span>
          <strong>{{ childStore.name() }}</strong>
        </a>

        <nav aria-label="Modo niño">
          @for (link of links; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              [style.--tone]="link.tone"
            >
              <span class="emoji">{{ link.emoji }}</span>
              <span class="label">{{ link.label }}</span>
            </a>
          }
        </nav>

        <button
          class="exit"
          type="button"
          [style.--hold]="hold()"
          (pointerdown)="startHold()"
          (pointerup)="cancelHold()"
          (pointerleave)="cancelHold()"
          (keydown.enter)="exit()"
          aria-label="Salir del modo niño (un adulto mantiene presionado)"
        >
          <span class="icon">lock</span>
          <span class="label">{{ holding() ? 'Sigue…' : 'Adultos' }}</span>
        </button>
      </aside>

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
      display: grid;
      grid-template-columns: 128px 1fr;
      gap: clamp(16px, 2.5vw, 32px);
      min-height: 100vh;
      padding: 18px clamp(14px, 2.5vw, 32px) 18px 18px;
    }

    /* ---------- Barra lateral ---------- */

    .rail {
      position: sticky;
      top: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      height: calc(100vh - 36px);
      padding: 18px 12px;
      border-radius: 40px;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: 0 12px 36px rgba(15, 76, 85, 0.1);
    }

    .me {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: var(--ink);
      text-align: center;
    }
    .me strong {
      font-size: 1rem;
      font-weight: 900;
    }
    .avatar {
      display: grid;
      place-items: center;
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--mint-100), var(--lavender-100));
      font-size: 2.4rem;
      font-weight: 900;
      color: var(--teal-700);
      box-shadow: 0 0 0 4px #fff, 0 6px 16px rgba(15, 76, 85, 0.15);
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      margin: auto 0;
    }
    nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 14px 6px;
      border: 3px solid transparent;
      border-radius: 28px;
      color: var(--ink-2);
      font-weight: 800;
      transition:
        background 0.25s var(--ease),
        transform 0.25s var(--ease);
    }
    nav a:hover {
      background: var(--surface-2);
      transform: scale(1.03);
    }
    nav a.active {
      background: var(--tone);
      border-color: #fff;
      color: var(--ink);
      box-shadow: 0 6px 16px rgba(15, 76, 85, 0.12);
    }
    nav .emoji {
      font-size: 2.6rem;
      line-height: 1.1;
    }
    nav .label {
      font-size: 0.95rem;
    }

    .exit {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      width: 100%;
      padding: 10px 6px;
      border: 0;
      border-radius: 22px;
      overflow: hidden;
      background: var(--surface-2);
      color: var(--ink-3);
      font-weight: 800;
      font-size: 0.8rem;
      cursor: pointer;
      user-select: none;
      touch-action: none;
    }
    .exit::before {
      content: '';
      position: absolute;
      inset: 0;
      width: calc(var(--hold) * 100%);
      background: var(--mint-100);
    }
    .exit > * {
      position: relative;
    }

    main {
      min-width: 0;
      padding: 10px 0 24px;
    }

    /* ---------- Celular: barra flotante abajo ---------- */

    @media (max-width: 720px) {
      .kid {
        grid-template-columns: 1fr;
        padding: 14px 14px 112px;
      }
      .rail {
        position: fixed;
        top: auto;
        left: 12px;
        right: 12px;
        bottom: 12px;
        z-index: 30;
        flex-direction: row;
        justify-content: space-between;
        gap: 6px;
        height: auto;
        padding: 8px;
        border-radius: 32px;
      }
      .me strong,
      .exit .label {
        display: none;
      }
      .avatar {
        width: 48px;
        height: 48px;
        font-size: 1.6rem;
        box-shadow: none;
      }
      nav {
        flex: 1;
        flex-direction: row;
        justify-content: center;
        gap: 4px;
        margin: 0;
        width: auto;
      }
      nav a {
        flex: 1;
        max-width: 84px;
        padding: 6px 4px;
        border-radius: 24px;
      }
      nav .emoji {
        font-size: 1.9rem;
      }
      nav .label {
        font-size: 0.75rem;
      }
      .exit {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        justify-content: center;
        border-radius: 50%;
      }
    }
  `,
})
export class KidShell implements OnDestroy {
  protected readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);

  protected readonly links = [
    { path: '/nino', label: 'Inicio', emoji: '🏠', tone: 'var(--mint-100)', exact: true },
    { path: '/nino/hablar', label: 'Hablar', emoji: '💬', tone: 'var(--sky-100)', exact: false },
    { path: '/nino/mi-dia', label: 'Mi día', emoji: '🗓️', tone: 'var(--sun-100)', exact: false },
  ];

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
