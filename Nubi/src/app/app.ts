import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastOutlet } from './shared/presentation/toast-outlet/toast-outlet';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutlet, TranslatePipe],
  template: `
    @if (waking()) {
      <div class="waking" role="status">
        <span class="bubble keep-motion">🫧</span>
        <strong>{{ 'waking.title' | translate }}</strong>
        <p>{{ 'waking.detail' | translate }}</p>
      </div>
    }
    <router-outlet />
    <app-toast-outlet />
  `,
  styles: `
    .waking {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 24px;
      text-align: center;
      background: rgba(247, 250, 249, 0.96);
    }
    .bubble {
      font-size: 3rem;
      animation: float 2.4s ease-in-out infinite alternate;
    }
    @keyframes float {
      to {
        transform: translateY(-12px);
      }
    }
  `,
})
export class App {
  /** El backend en Render se duerme sin uso: la primera carga puede tardar hasta dos minutos. */
  protected readonly waking = signal(false);
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.stop();
          this.timer = setTimeout(() => this.waking.set(true), 1500);
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          this.stop();
        }
      });
  }

  private stop(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.waking.set(false);
  }
}
