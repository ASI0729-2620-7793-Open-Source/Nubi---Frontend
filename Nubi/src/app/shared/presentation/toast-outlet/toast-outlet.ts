import { Component, inject } from '@angular/core';
import { ToastStore } from '../../application/toast.store';

@Component({
  selector: 'app-toast-outlet',
  template: `
    <div class="toasts" aria-live="polite">
      @for (toast of store.toasts(); track toast.id) {
        <button type="button" class="toast" [class]="'toast ' + toast.tone" (click)="store.dismiss(toast.id)">
          <span class="icon fill">{{ icons[toast.tone] }}</span>
          <span>{{ toast.message }}</span>
        </button>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 80;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(420px, calc(100vw - 40px));
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border: 0;
      border-radius: 18px;
      background: var(--teal-900);
      color: #fff;
      font-weight: 700;
      text-align: left;
      box-shadow: var(--shadow-l);
      cursor: pointer;
      animation: rise 0.25s var(--ease);
    }
    .toast.error {
      background: #8e2b28;
    }
    .toast.info {
      background: #22679c;
    }
  `,
})
export class ToastOutlet {
  protected readonly store = inject(ToastStore);
  protected readonly icons = { ok: 'check_circle', error: 'error', info: 'info' };
}
