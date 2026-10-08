import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '../../../application/auth.store';

/**
 * US-46: registro familiar con correo y nombre. Si el correo ya está
 * en uso se dice claro; al registrarse se activa FREEMIUM y se puede
 * crear el primer perfil en /perfil.
 */
@Component({
  imports: [FormsModule, RouterLink, ButtonModule, CardModule, InputTextModule, MessageModule],
  selector: 'app-sign-up',
  styleUrl: '../sign-in/sign-in.css',
  templateUrl: './sign-up.html',
})
export class SignUp {
  protected readonly auth = inject(AuthStore);
  protected readonly email = signal('');
  protected readonly fullName = signal('');

  protected submit(): void {
    this.auth.signUp(this.email(), this.fullName());
  }
}
