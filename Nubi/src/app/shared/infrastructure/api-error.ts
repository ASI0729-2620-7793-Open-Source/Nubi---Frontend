import { HttpErrorResponse } from '@angular/common/http';
import { hasTranslation, t } from './i18n-bridge';

/**
 * El backend responde los errores como Problem Details (application/problem+json) con
 * `detail`, `code` y, cuando falla un campo, `field` o `errors`. Esta función los traduce a un
 * mensaje que se puede mostrar tal cual al cuidador: si el `code` tiene traducción se usa esa
 * (en el idioma activo) y si no, el `detail` que envía el backend.
 */
export function apiErrorMessage(error: unknown, fallback = t('errors.generic')): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 0) {
    return t('errors.offline');
  }
  // Red de Apoyo y Seguimiento responde algunos errores como texto plano
  if (typeof error.error === 'string' && error.error.trim().length > 0 && !error.error.startsWith('<')) {
    return error.error;
  }
  const body = error.error as { detail?: string; code?: string; errors?: Record<string, string>; message?: string } | null;
  if (body?.code && hasTranslation(`errors.codes.${body.code.replace(/\./g, '_')}`)) {
    return t(`errors.codes.${body.code.replace(/\./g, '_')}`);
  }
  if (body?.errors && Object.keys(body.errors).length > 0) {
    return Object.values(body.errors).join(' ');
  }
  return body?.detail ?? body?.message ?? fallback;
}

/** Código estable del error (por ejemplo `profile.single.child`). */
export function apiErrorCode(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) return null;
  return (error.error as { code?: string } | null)?.code ?? null;
}
