import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ChildStore } from '../../profile/application/child.store';
import { SessionStore } from './session.store';
import { kidLock } from '../../shared/application/kid-lock';

/** Solo con sesión iniciada. */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.signedIn() ? true : inject(Router).createUrlTree(['/ingresar']);
};

/** Sin sesión (pantallas de ingreso y registro). */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  return session.signedIn() ? inject(Router).createUrlTree(['/inicio']) : true;
};

/** La app necesita al niño registrado; si no lo hay, se va a la bienvenida. */
export const childGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const child = await inject(ChildStore).ensureLoaded();
  if (child === undefined) return router.createUrlTree(['/sin-conexion']);
  return child ? true : router.createUrlTree(['/bienvenida']);
};

/** La bienvenida solo tiene sentido si todavía no hay niño. */
export const noChildGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const child = await inject(ChildStore).ensureLoaded();
  if (child === undefined) return router.createUrlTree(['/sin-conexion']);
  return child ? router.createUrlTree(['/inicio']) : true;
};

/** Con el Modo niño activo, el área de adultos redirige a él hasta que se ingrese el PIN. */
export const adultGuard: CanActivateFn = () =>
  kidLock.locked() && kidLock.hasPin() ? inject(Router).createUrlTree(['/nino']) : true;
