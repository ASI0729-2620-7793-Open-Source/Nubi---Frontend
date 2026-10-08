import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthStore } from '../../../application/auth.store';

/**
 * US-47: inicio de sesión con correo o Google (sin contraseña con Google).
 * El error es genérico y nunca dice qué dato falló.
 */
@Component({
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  selector: 'app-sign-in',
  styleUrl: './sign-in.css',
  templateUrl: './sign-in.html',
})
export class SignIn {
  protected readonly auth = inject(AuthStore);
  protected readonly email = signal('');
  protected readonly password = signal('');

  protected submit(): void {
    this.auth.signIn(this.email());
  }

  protected google(): void {
    this.auth.signInWithGoogle(this.email());
  }
}
