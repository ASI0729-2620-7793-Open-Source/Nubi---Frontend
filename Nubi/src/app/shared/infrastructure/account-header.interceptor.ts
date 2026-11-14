import { HttpInterceptorFn } from '@angular/common/http';
import { ACCOUNT_HEADER, API_BASE, SESSION_KEY } from './api-base';

/**
 * Agrega la cabecera X-Account-Id a cada llamada al backend. Se lee del almacenamiento
 * local para no depender del store (y evitar dependencias circulares).
 */
export const accountHeaderInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE) || request.headers.has(ACCOUNT_HEADER)) {
    return next(request);
  }
  const accountId = readAccountId();
  if (accountId === null) {
    return next(request);
  }
  return next(request.clone({ setHeaders: { [ACCOUNT_HEADER]: String(accountId) } }));
};

function readAccountId(): number | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? ((JSON.parse(raw) as { id?: number }).id ?? null) : null;
  } catch {
    return null;
  }
}
