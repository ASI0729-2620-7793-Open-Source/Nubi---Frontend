import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { SessionStore } from '../../application/session.store';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: '../auth.css',
})
export class SignUp {
  private readonly session = inject(SessionStore);
  private readonly childStore = inject(ChildStore);
  private readonly router = inject(Router);

  protected fullName = '';
  protected email = '';
  protected password = '';
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  submit(): void {
    if (!this.fullName.trim() || !this.email.trim()) {
      this.error.set('Completa tu nombre y tu correo.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.session.signUp({ fullName: this.fullName, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.childStore.clear();
        void this.router.navigate(['/bienvenida']);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.busy.set(false);
      },
    });
  }
}
