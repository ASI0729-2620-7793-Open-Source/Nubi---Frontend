import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../shared/infrastructure/api-base';
import { SignInRequest, SignUpRequest, UserAccount } from '../domain/model/user-account';

/** /api/v1/authentication */
@Injectable({ providedIn: 'root' })
export class AuthenticationApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/authentication`;

  signIn(request: SignInRequest): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.url}/sign-in`, request);
  }

  signUp(request: SignUpRequest): Observable<UserAccount> {
    return this.http.post<UserAccount>(`${this.url}/sign-up`, request);
  }

  me(): Observable<UserAccount> {
    return this.http.get<UserAccount>(`${this.url}/me`);
  }
}
