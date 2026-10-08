import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountRole } from '../domain/model/account.enums';
import { AuthStore } from '../application/auth.store';

/**
 * Guard por rol (regla 1): sin acceso muestra "No tienes acceso"
 * con enlace de regreso en vez de dejar la pantalla vacía.
 */
export function roleGuard(allowed: AccountRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    if (auth.canAccess(allowed)) return true;
    return router.createUrlTree(['/my-plan/access-denied']);
  };
}

/** Vista cuidador: solo CAREGIVER. */
export const caregiverGuard: CanActivateFn = roleGuard([AccountRole.CAREGIVER]);

/** Vista administrador: solo INSTITUTION_ADMIN. */
export const adminGuard: CanActivateFn = roleGuard([AccountRole.INSTITUTION_ADMIN]);

/** Vista docente: TEACHER y administradores (versión limitada). */
export const teacherGuard: CanActivateFn = roleGuard([
  AccountRole.TEACHER,
  AccountRole.INSTITUTION_ADMIN,
]);
