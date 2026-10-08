import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account } from '../domain/model/account.entity';
import { AccountAssembler } from './account-assembler';
import { AccountResource, TokenResource } from './account-resources';

/**
 * Fachada HTTP del AccountController (endpoints del diagrama, tal cual).
 * signUp, signInWithGoogle -> TokenResource, getAccount.
 */
@Injectable({ providedIn: 'root' })
export class AccountApiEndpoint {
  private readonly http = inject(HttpClient);
  private readonly assembler = new AccountAssembler();
  private readonly base = `${environment.apiBaseUrl}${environment.accountsEndpoint}`;

  signUp(email: string, fullName: string): Observable<Account> {
    return this.http
      .post<AccountResource>(`${this.base}/sign-up`, { email, fullName })
      .pipe(map((resource) => this.assembler.toAccount(resource)));
  }

  signInWithGoogle(googleSubject: string): Observable<TokenResource> {
    return this.http.post<TokenResource>(`${this.base}/sign-in-google`, { googleSubject });
  }

  getAccount(accountId: number): Observable<Account> {
    return this.http
      .get<AccountResource>(`${this.base}/${accountId}`)
      .pipe(map((resource) => this.assembler.toAccount(resource)));
  }

  /** Compatibles con la API falsa: la colección acepta POST y filtros ?email=. */
  findByEmail(email: string): Observable<Account | null> {
    return this.http
      .get<AccountResource[]>(`${this.base}?email=${encodeURIComponent(email.trim())}`)
      .pipe(map((resources) => (resources[0] ? this.assembler.toAccount(resources[0]) : null)));
  }

  findByGoogle(googleSubject: string): Observable<Account | null> {
    return this.http
      .get<AccountResource[]>(`${this.base}?googleSubject=${encodeURIComponent(googleSubject)}`)
      .pipe(map((resources) => (resources[0] ? this.assembler.toAccount(resources[0]) : null)));
  }

  /** Registro familiar: solo correo y nombre, sin hashes en el frontend. */
  register(email: string, fullName: string): Observable<Account> {
    const now = new Date().toISOString();
    return this.http
      .post<AccountResource>(this.base, {
        email: email.trim(),
        fullName: fullName.trim(),
        authProvider: 'LOCAL',
        googleSubject: null,
        role: 'CAREGIVER',
        active: true,
        institutionId: null,
        createdAt: now,
        updatedAt: now,
      })
      .pipe(map((resource) => this.assembler.toAccount(resource)));
  }

  listAccounts(): Observable<Account[]> {
    return this.http
      .get<AccountResource[]>(this.base)
      .pipe(map((resources) => resources.map((resource) => this.assembler.toAccount(resource))));
  }
}
