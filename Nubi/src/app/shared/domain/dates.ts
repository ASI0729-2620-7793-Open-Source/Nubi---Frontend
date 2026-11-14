import { currentLocale, t } from '../infrastructure/i18n-bridge';

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

/** Los formatos dependen del idioma activo (es-PE o en-US); se guardan por idioma para no recrearlos. */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = currentLocale();
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formatters.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, format);
  }
  return format;
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = value instanceof Date ? value : toDate(value);
  return date ? formatter({ day: 'numeric', month: 'short' }).format(date) : '—';
}

export function formatDateTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? formatter({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date) : '—';
}

export function formatTime(value: string | null | undefined): string {
  const date = toDate(value);
  return date ? formatter({ hour: '2-digit', minute: '2-digit' }).format(date) : '—';
}

export function weekday(date: Date): string {
  return formatter({ weekday: 'short' }).format(date).replace('.', '');
}

/** "Hace 5 min", "Hace 2 h", "Ayer"... (o "5 min ago", "Yesterday"...) */
export function relative(value: string | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return t('time.now');
  if (minutes < 60) return t('time.minutesAgo', { n: minutes });
  const hours = Math.round(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { n: hours });
  const days = Math.round(hours / 24);
  return days === 1 ? t('time.yesterday') : t('time.daysAgo', { n: days });
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
  if (hour < 12) return t('greeting.morning');
  if (hour < 19) return t('greeting.afternoon');
  return t('greeting.evening');
}
