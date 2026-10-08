import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { Account } from '../domain/model/account.entity';
import { AccountRole, PlanType } from '../domain/model/account.enums';
import { AccountApiEndpoint } from '../infrastructure/account-api-endpoint';
import { SubscriptionApiEndpoint } from '../infrastructure/subscription-api-endpoint';

/**
 * Sesión y rol de la cuenta (store de auth).
 * El rol controla menú, rutas (guards) y botones (regla 1).
 * El frontend nunca envía ni guarda hashes: solo correo y nombre.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AccountApiEndpoint);
  private readonly subscriptions = inject(SubscriptionApiEndpoint);
  private readonly router = inject(Router);

  private readonly accountState = signal<Account | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  /** Rol simulado para la vista previa /dev/preview/account. */
  private readonly previewRoleState = signal<AccountRole | null>(null);

  readonly account = computed(() => this.accountState());
  readonly role = computed<AccountRole>(
    () => this.previewRoleState() ?? this.accountState()?.role ?? AccountRole.CAREGIVER,
  );
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly isCaregiver = computed(() => this.role() === AccountRole.CAREGIVER);
  readonly isTeacher = computed(() => this.role() === AccountRole.TEACHER);
  readonly isAdmin = computed(() => this.role() === AccountRole.INSTITUTION_ADMIN);

  load(accountId = 1): void {
    this.loadingState.set(true);
    this.api
      .getAccount(accountId)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (account) => this.accountState.set(account),
        error: () => this.errorState.set('account.errors.load'),
      });
  }

  /** Solo para la vista previa: simula el rol sin backend. */
  previewAs(role: AccountRole | null): void {
    this.previewRoleState.set(role);
  }

  canAccess(allowed: AccountRole[]): boolean {
    return allowed.includes(this.role());
  }

  /** US-47: mensaje genérico sin decir qué dato falló. */
  signIn(email: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api
      .findByEmail(email)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (account) => {
          if (!account || !account.active) {
            this.errorState.set('auth.signIn.invalid');
            return;
          }
          this.accountState.set(account);
          this.router.navigate(['/perfil']);
        },
        error: () => this.errorState.set('auth.signIn.invalid'),
      });
  }

  /** US-47 con Google: sin campo de contraseña, solo la cuenta vinculada. */
  signInWithGoogle(googleSubject: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api
      .findByGoogle(googleSubject)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (account) => {
          if (!account || !account.active) {
            this.errorState.set('auth.signIn.invalid');
            return;
          }
          this.accountState.set(account);
          this.router.navigate(['/perfil']);
        },
        error: () => this.errorState.set('auth.signIn.invalid'),
      });
  }

  /**
   * US-46: correo ya usado se informa claro; al registrarse se activa
   * FREEMIUM (AccountCreatedEvent del backend, aquí con POST directo)
   * y se navega a crear el primer perfil.
   */
  signUp(email: string, fullName: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api.findByEmail(email).subscribe({
      next: (existing) => {
        if (existing) {
          this.loadingState.set(false);
          this.errorState.set('auth.signUp.emailInUse');
          return;
        }
        this.api.register(email, fullName).subscribe({
          next: (account) => {
            this.subscriptions
              .createFreemium(account.id)
              .pipe(finalize(() => this.loadingState.set(false)))
              .subscribe({
                next: () => this.finishSignUp(account),
                error: () => this.finishSignUp(account),
              });
          },
          error: () => {
            this.loadingState.set(false);
            this.errorState.set('account.errors.load');
          },
        });
      },
      error: () => {
        this.loadingState.set(false);
        this.errorState.set('account.errors.load');
      },
    });
  }

  private finishSignUp(account: Account): void {
    this.accountState.set(account);
    this.router.navigate(['/perfil']);
  }

  signOut(): void {
    this.accountState.set(null);
    this.router.navigate(['/auth/sign-in']);
  }
}
