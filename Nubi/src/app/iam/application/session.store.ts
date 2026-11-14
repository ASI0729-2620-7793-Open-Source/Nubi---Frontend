import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SESSION_KEY } from '../../shared/infrastructure/api-base';
import { SignInRequest, SignUpRequest, UserAccount } from '../domain/model/user-account';
import { AuthenticationApi } from '../infrastructure/authentication-api';

/** Sesión del cuidador: se guarda en el navegador para no pedir la contraseña al recargar. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly api = inject(AuthenticationApi);
  private readonly userState = signal<UserAccount | null>(readSession());

  readonly user = this.userState.asReadonly();
  readonly signedIn = computed(() => this.userState() !== null);
  readonly firstName = computed(() => this.userState()?.fullName.split(' ')[0] ?? '');

  signIn(request: SignInRequest): Observable<UserAccount> {
    return this.api.signIn(request).pipe(tap((user) => this.store(user)));
  }

  signUp(request: SignUpRequest): Observable<UserAccount> {
    return this.api.signUp(request).pipe(tap((user) => this.store(user)));
  }

  signOut(): void {
    localStorage.removeItem(SESSION_KEY);
    this.userState.set(null);
  }

  private store(user: UserAccount): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.userState.set(user);
  }
}

function readSession(): UserAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  } catch {
    return null;
  }
}
