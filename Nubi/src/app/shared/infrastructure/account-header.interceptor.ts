import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ACCOUNT_HEADER, API_BASE, SESSION_KEY } from './api-base';

/**
 * Agrega el token de acceso (y la cabecera X-Account-Id) a cada llamada al backend. Se lee del
 * almacenamiento local para no depender del store (y evitar dependencias circulares). Si el
 * backend rechaza el token (venció o el servicio se reinició), se vuelve a la pantalla de ingreso.
 */
export const accountHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE)) {
    return next(request);
  }
  const session = readSession();
  if (session === null) {
    return next(request);
  }
  const headers: Record<string, string> = { [ACCOUNT_HEADER]: String(session.id) };
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`;
  return next(request.clone({ setHeaders: headers })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.includes('/authentication/sign-')) {
        localStorage.removeItem(SESSION_KEY);
        location.assign('/ingresar');
      }
      return throwError(() => error);
    }),
  );
};

function readSession(): { id: number; token?: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const session = raw ? (JSON.parse(raw) as { id?: number; token?: string }) : null;
    return session?.id == null ? null : { id: session.id, token: session.token };
  } catch {
    return null;
  }
}
