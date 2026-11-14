/** Bounded Context Red de Apoyo y Seguimiento. */
export interface EpisodeRecord {
  id: number;
  profileId: number;
  sosSessionId: number | null;
  emotionalState: string | null;
  trigger: string | null;
  strategyUsed: string | null;
  notes: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface HelpRequest {
  id: number;
  profileId: number;
  message: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

export interface EpisodeReport {
  id: number;
  profileId: number;
  periodStart: string;
  periodEnd: string;
  episodeCount: number;
  summary: string;
  observations: string | null;
  shared: boolean;
  sharedWith: string | null;
  createdAt: string;
  sharedAt: string | null;
}

export interface SupportRecommendation {
  id: number;
  profileId: number;
  episodeRecordId: number | null;
  title: string;
  description: string;
  strategy: string | null;
  actionGuide: string | null;
  status: string;
  effective: boolean | null;
  createdAt: string;
  markedEffectiveAt: string | null;
}
