import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { SessionStore } from '../../application/session.store';

@Component({
  selector: 'app-sign-in',
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: '../auth.css',
})
export class SignIn {
  private readonly session = inject(SessionStore);
  private readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly showPassword = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  useDemo(): void {
    this.email = 'demo@nubi.app';
    this.password = 'nubi123';
    this.submit();
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Escribe tu correo y tu contraseña.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.session.signIn({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.childStore.clear();
        void this.router.navigate(['/inicio']);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
