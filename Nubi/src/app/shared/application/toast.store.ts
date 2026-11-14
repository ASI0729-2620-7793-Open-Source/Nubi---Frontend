import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  tone: 'ok' | 'error' | 'info';
}

/** Mensajes breves y amables que confirman lo que pasó (o por qué no se pudo). */
@Injectable({ providedIn: 'root' })
export class ToastStore {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  ok(message: string): void {
    this.push(message, 'ok');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  info(message: string): void {
    this.push(message, 'info');
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  private push(message: string, tone: Toast['tone']): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => this.dismiss(id), tone === 'error' ? 6000 : 3500);
  }
}
