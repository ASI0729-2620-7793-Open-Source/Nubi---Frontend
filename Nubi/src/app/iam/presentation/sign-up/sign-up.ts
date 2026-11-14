import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { SessionStore } from '../../application/session.store';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';
import { LanguageSwitch } from '../../../shared/presentation/language-switch/language-switch';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitch],
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
      this.error.set(t('signUp.completaTuNombreY'));
      return;
    }
    if (this.password.length < 6) {
      this.error.set(t('signUp.laContrasenaDebeTener'));
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
