import { HttpErrorResponse } from '@angular/common/http';

/**
 * El backend responde los errores como Problem Details (application/problem+json) con
 * `detail`, `code` y, cuando falla un campo, `field` o `errors`. Esta función los traduce a un
 * mensaje que se puede mostrar tal cual al cuidador.
 */
export function apiErrorMessage(error: unknown, fallback = 'Algo salió mal. Inténtalo otra vez.'): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 0) {
    return 'No pudimos conectar con Nubi. Revisa que el backend esté encendido en http://localhost:8080.';
  }
  // Red de Apoyo y Seguimiento responde algunos errores como texto plano
  if (typeof error.error === 'string' && error.error.trim().length > 0 && !error.error.startsWith('<')) {
    return error.error;
  }
  const body = error.error as { detail?: string; errors?: Record<string, string>; message?: string } | null;
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
