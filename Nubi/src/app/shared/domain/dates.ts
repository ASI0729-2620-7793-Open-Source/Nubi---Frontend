/** Utilidades de fecha. El backend envía Instant (con Z) o LocalDateTime (sin zona, hora local). */

export function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysAgo(days: number, from = new Date()): Date {
  const date = startOfDay(from);
  date.setDate(date.getDate() - days);
  return date;
}

/** Los últimos `count` días, del más antiguo a hoy. */
export function lastDays(count: number): Date[] {
  return Array.from({ length: count }, (_, index) => daysAgo(count - 1 - index));
}

export function isToday(value: string | null | undefined): boolean {
  const date = toDate(value);
  return !!date && dayKey(date) === dayKey(new Date());
}

const DATE = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' });
const DATE_TIME = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const TIME = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' });
const WEEKDAY = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });

export function formatDate(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : toDate(value);
  return date ? DATE.format(date) : '—';
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_TIME.format(date) : '—';
}

export function formatTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? TIME.format(date) : '—';
}

export function weekday(date: Date): string {
  return WEEKDAY.format(date).replace('.', '');
}

/** "Hace 5 min", "Hace 2 h", "Ayer"... */
export function relative(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Ayer' : `Hace ${days} días`;
}

/** Minutos entre dos marcas de tiempo (o hasta ahora si no terminó). */
export function minutesBetween(start: string | null | undefined, end: string | null | undefined): number {
  const from = toDate(start);
  if (!from) return 0;
  const to = toDate(end) ?? new Date();
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
