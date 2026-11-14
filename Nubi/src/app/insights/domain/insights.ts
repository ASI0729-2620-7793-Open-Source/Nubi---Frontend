import { MoodCheckIn } from '../../communication/domain/model/board';
import { SosSession, triggerLabel } from '../../crisis/domain/model/sos';
import { RoutineStep } from '../../routine/domain/model/routine-step';
import { CalmSession, CalmingResource } from '../../self-regulation/domain/model/calm';
import { dayKey, daysAgo, lastDays, minutesBetween, toDate, weekday } from '../../shared/domain/dates';
import { MOODS, MoodLevel, moodInfo } from '../../shared/domain/mood';
import { st, t } from '../../shared/infrastructure/i18n-bridge';

/**
 * Indicadores de bienestar calculados en el frontend con los datos que ya guarda el backend
 * (registros de ánimo, sesiones de calma, sesiones SOS y rutina). No se inventa nada:
 * todo sale de lo que el niño y sus cuidadores registraron.
 */

export interface DayPoint {
  date: Date;
  label: string;
  value: number | null;
  count: number;
}

export interface Ranked {
  key: string;
  label: string;
  count: number;
  share: number;
}

function inLastDays(value: string | null | undefined, days: number): boolean {
  const date = toDate(value);
  return !!date && date >= daysAgo(days - 1);
}

export function moodsSince(moods: MoodCheckIn[], days: number): MoodCheckIn[] {
  return moods.filter((mood) => inLastDays(mood.checkedAt, days));
}

export function latestMood(moods: MoodCheckIn[]): MoodCheckIn | null {
  return [...moods].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))[0] ?? null;
}

export function todayMood(moods: MoodCheckIn[]): MoodCheckIn | null {
  const today = dayKey(new Date());
  const latest = latestMood(moods);
  return latest && dayKey(toDate(latest.checkedAt)!) === today ? latest : null;
}

/** Promedio diario del ánimo (0 = calma, 3 = crisis); null si ese día no hubo registro. */
export function moodTrend(moods: MoodCheckIn[], days = 14): DayPoint[] {
  return lastDays(days).map((date) => {
    const key = dayKey(date);
    const ofDay = moods.filter((mood) => dayKey(toDate(mood.checkedAt)!) === key);
    const value = ofDay.length
      ? ofDay.reduce((sum, mood) => sum + moodInfo(mood.level).score, 0) / ofDay.length
      : null;
    return { date, label: weekday(date), value, count: ofDay.length };
  });
}

export function moodDistribution(moods: MoodCheckIn[]): { level: MoodLevel; count: number; share: number }[] {
  const total = moods.length || 1;
  return MOODS.map((mood) => {
    const count = moods.filter((item) => item.level === mood.level).length;
    return { level: mood.level, count, share: count / total };
  });
}

/** En qué momento del día suelen aparecer los registros difíciles (alterado o crisis). */
export function hardMomentOfDay(moods: MoodCheckIn[]): string | null {
  const hard = moods.filter((mood) => mood.level === 'ALTERED' || mood.level === 'CRISIS');
  if (hard.length < 2) return null;
  const buckets = { morning: 0, afternoon: 0, night: 0 };
  for (const mood of hard) {
    const hour = toDate(mood.checkedAt)!.getHours();
    if (hour < 12) buckets.morning++;
    else if (hour < 19) buckets.afternoon++;
    else buckets.night++;
  }
  return Object.entries(buckets).sort((a, b) => b[1] - a[1])[0][0];
}

export function calmSessionsSince(sessions: CalmSession[], days: number): CalmSession[] {
  return sessions.filter((session) => inLastDays(session.startedAt, days));
}

export function calmMinutes(sessions: CalmSession[]): number {
  return sessions.reduce((sum, session) => sum + Math.max(1, minutesBetween(session.startedAt, session.endedAt)), 0);
}

/** Sesiones de calma por día (para el gráfico de barras). */
export function calmPerDay(sessions: CalmSession[], days = 7): DayPoint[] {
  return lastDays(days).map((date) => {
    const key = dayKey(date);
    const count = sessions.filter((session) => dayKey(toDate(session.startedAt)!) === key).length;
    return { date, label: weekday(date), value: count, count };
  });
}

/** Días seguidos (hasta hoy o ayer) con al menos un momento de calma. */
export function calmStreak(sessions: CalmSession[]): number {
  const days = new Set(sessions.map((session) => dayKey(toDate(session.startedAt)!)));
  let streak = 0;
  let cursor = days.has(dayKey(new Date())) ? 0 : 1;
  while (days.has(dayKey(daysAgo(cursor)))) {
    streak++;
    cursor++;
  }
  return streak;
}

export function topResources(sessions: CalmSession[], resources: CalmingResource[]): Ranked[] {
  const counts = new Map<number, number>();
  for (const session of sessions) {
    if (session.resourceId) counts.set(session.resourceId, (counts.get(session.resourceId) ?? 0) + 1);
  }
  const total = sessions.length || 1;
  return [...counts.entries()]
    .map(([id, count]) => ({
      key: String(id),
      label: st(resources.find((resource) => resource.id === id)?.name) || t('insights.resourceFallback', { id }),
      count,
      share: count / total,
    }))
    .sort((a, b) => b.count - a.count);
}

export function sosSince(sessions: SosSession[], days: number): SosSession[] {
  return sessions.filter((session) => inLastDays(session.startedAt, days));
}

export function topTriggers(sessions: SosSession[]): Ranked[] {
  const counts = new Map<string, number>();
  for (const session of sessions) counts.set(session.trigger, (counts.get(session.trigger) ?? 0) + 1);
  const total = sessions.length || 1;
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: triggerLabel(key), count, share: count / total }))
    .sort((a, b) => b.count - a.count);
}

/** Cuántos niveles bajó la intensidad, en promedio, entre el inicio y el final del SOS. */
export function sosImprovement(sessions: SosSession[]): number | null {
  const finished = sessions.filter((session) => session.finalIntensity);
  if (!finished.length) return null;
  const total = finished.reduce(
    (sum, session) => sum + moodInfo(session.initialIntensity).score - moodInfo(session.finalIntensity).score,
    0,
  );
  return total / finished.length;
}

export function averageSosMinutes(sessions: SosSession[]): number | null {
  const finished = sessions.filter((session) => session.finishedAt);
  if (!finished.length) return null;
  return Math.round(finished.reduce((sum, s) => sum + minutesBetween(s.startedAt, s.finishedAt), 0) / finished.length);
}

export function routineProgress(steps: RoutineStep[]): { done: number; total: number; share: number } {
  const done = steps.filter((step) => step.completedToday).length;
  return { done, total: steps.length, share: steps.length ? done / steps.length : 0 };
}

/** Frases cortas y útiles para el cuidador a partir de los datos. */
export function insightMessages(input: {
  childName: string;
  moods: MoodCheckIn[];
  calm: CalmSession[];
  sos: SosSession[];
  resources: CalmingResource[];
}): { icon: string; tone: string; text: string }[] {
  const messages: { icon: string; tone: string; text: string }[] = [];
  const { childName, moods, calm, sos, resources } = input;

  const favorite = topResources(calm, resources)[0];
  if (favorite && favorite.count >= 2) {
    messages.push({ icon: 'favorite', tone: 'lavender', text: t('insights.favorite', { label: favorite.label, name: childName, count: favorite.count }) });
  }

  const trigger = topTriggers(sos)[0];
  if (trigger && trigger.key !== 'NONE' && sos.length >= 2) {
    messages.push({ icon: 'hearing', tone: 'peach', text: t('insights.trigger', { label: trigger.label.toLowerCase() }) });
  }

  const moment = hardMomentOfDay(moods);
  if (moment) {
    messages.push({ icon: 'schedule', tone: 'sun', text: t('insights.moment', { moment: t(`dayPart.${moment}`) }) });
  }

  const improvement = sosImprovement(sos);
  if (improvement !== null && improvement > 0) {
    messages.push({ icon: 'trending_down', tone: 'mint', text: t('insights.improvement', { n: improvement.toFixed(1) }) });
  }

  const recent = moodsSince(moods, 7);
  const calmShare = recent.length ? recent.filter((mood) => mood.level === 'CALM').length / recent.length : 0;
  if (recent.length >= 3 && calmShare >= 0.6) {
    messages.push({ icon: 'sentiment_satisfied', tone: 'mint', text: t('insights.calmWeek', { name: childName, pct: Math.round(calmShare * 100) }) });
  }

  if (!messages.length) {
    messages.push({ icon: 'lightbulb', tone: 'sky', text: t('insights.empty', { name: childName }) });
  }
  return messages;
}
