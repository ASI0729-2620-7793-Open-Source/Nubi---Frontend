/**
 * Candado del Modo niño. Mientras está activo, las pantallas del cuidador no se abren; para
 * salir se pide un PIN de 4 dígitos que vive solo en este dispositivo.
 */
const LOCK = 'nubi.kidLock';
const PIN = 'nubi.adultPin';

export const kidLock = {
  locked: (): boolean => localStorage.getItem(LOCK) === '1',
  hasPin: (): boolean => localStorage.getItem(PIN) !== null,
  isPin: (value: string): boolean => localStorage.getItem(PIN) === value,
  savePin: (value: string): void => localStorage.setItem(PIN, value),
  lock: (): void => localStorage.setItem(LOCK, '1'),
  unlock: (): void => localStorage.removeItem(LOCK),
  reset: (): void => {
    localStorage.removeItem(LOCK);
    localStorage.removeItem(PIN);
  },
};
