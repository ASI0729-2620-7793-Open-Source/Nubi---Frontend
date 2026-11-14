import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MoodLevel } from '../../shared/domain/mood';
import { API_BASE } from '../../shared/infrastructure/api-base';
import {
  ActionGuide,
  AlternativeTechnique,
  CrisisRecommendation,
  ObservedState,
  SensoryTrigger,
  SosSession,
} from '../domain/model/sos';

/** /api/v1/sos-sessions, /api/v1/action-guides y recomendaciones de Gestión de Crisis. */
@Injectable({ providedIn: 'root' })
export class SosApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/sos-sessions`;

  start(profileId: number, caregiverAccountId: number, trigger: SensoryTrigger | null, initialIntensity: MoodLevel): Observable<SosSession> {
    return this.http.post<SosSession>(this.url, { profileId, caregiverAccountId, trigger, initialIntensity });
  }

  session(id: number): Observable<SosSession> {
    return this.http.get<SosSession>(`${this.url}/${id}`);
  }

  inProgress(profileId: number): Observable<SosSession> {
    return this.http.get<SosSession>(`${API_BASE}/profiles/${profileId}/sos-sessions/in-progress`);
  }

  history(profileId: number): Observable<SosSession[]> {
    return this.http.get<SosSession[]>(`${API_BASE}/profiles/${profileId}/sos-sessions`);
  }

  guide(id: number): Observable<ActionGuide> {
    return this.http.get<ActionGuide>(`${this.url}/${id}/guide`);
  }

  complete(id: number, stepId: number): Observable<SosSession> {
    return this.http.post<SosSession>(`${this.url}/${id}/steps/${stepId}/complete`, {});
  }

  skip(id: number, stepId: number): Observable<SosSession> {
    return this.http.post<SosSession>(`${this.url}/${id}/steps/${stepId}/skip`, { confirmed: true });
  }

  alternative(id: number, stepId: number): Observable<AlternativeTechnique> {
    return this.http.post<AlternativeTechnique>(`${this.url}/${id}/steps/${stepId}/alternative`, {});
  }

  finish(id: number, observedState: ObservedState | null, finalIntensity: MoodLevel | null): Observable<SosSession> {
    return this.http.post<SosSession>(`${this.url}/${id}/finish`, { observedState, finalIntensity });
  }

  recommendations(profileId: number): Observable<CrisisRecommendation[]> {
    return this.http.get<CrisisRecommendation[]>(`${API_BASE}/profiles/${profileId}/recommendations`);
  }

  generateRecommendations(profileId: number): Observable<CrisisRecommendation[]> {
    return this.http.post<CrisisRecommendation[]>(`${API_BASE}/profiles/${profileId}/recommendations/generate`, {});
  }

  rate(recommendationId: number, accountId: number, usefulnessRating: number, favorite: boolean): Observable<CrisisRecommendation> {
    return this.http.put<CrisisRecommendation>(`${API_BASE}/recommendations/${recommendationId}/preferences`, {
      accountId,
      usefulnessRating,
      favorite,
    });
  }
}
