import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../shared/infrastructure/api-base';
import { CalmSession, CalmingResource, FavoriteResource } from '../domain/model/calm';

/** /api/v1/calming-resources, /api/v1/calm-sessions y sus vistas por perfil. */
@Injectable({ providedIn: 'root' })
export class CalmApi {
  private readonly http = inject(HttpClient);

  /** Con profileId, el backend oculta los estímulos que no van con el perfil sensorial. */
  resources(profileId?: number): Observable<CalmingResource[]> {
    const params: Record<string, string> = profileId ? { profileId: String(profileId) } : {};
    return this.http.get<CalmingResource[]>(`${API_BASE}/calming-resources`, { params });
  }

  resource(id: number): Observable<CalmingResource> {
    return this.http.get<CalmingResource>(`${API_BASE}/calming-resources/${id}`);
  }

  favorites(profileId: number): Observable<FavoriteResource[]> {
    return this.http.get<FavoriteResource[]>(`${API_BASE}/profiles/${profileId}/favorite-resources`);
  }

  markFavorite(profileId: number, resourceId: number): Observable<FavoriteResource> {
    return this.http.post<FavoriteResource>(`${API_BASE}/profiles/${profileId}/favorite-resources`, { resourceId });
  }

  removeFavorite(profileId: number, resourceId: number): Observable<unknown> {
    return this.http.delete(`${API_BASE}/profiles/${profileId}/favorite-resources/${resourceId}`);
  }

  sessions(profileId: number): Observable<CalmSession[]> {
    return this.http.get<CalmSession[]>(`${API_BASE}/profiles/${profileId}/calm-sessions`);
  }

  start(profileId: number, resourceId: number, startedBySos = false): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions`, { profileId, resourceId, startedBySos });
  }

  intensity(sessionId: number, intensity: number): Observable<CalmSession> {
    return this.http.put<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/intensity`, { intensity });
  }

  lowStimulation(sessionId: number, active: boolean): Observable<CalmSession> {
    return this.http.put<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/low-stimulation`, { active });
  }

  pause(sessionId: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/pause`, {});
  }

  resume(sessionId: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/resume`, {});
  }

  startTimer(sessionId: number, durationMinutes: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/timer`, { durationMinutes });
  }

  pauseTimer(sessionId: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/timer/pause`, {});
  }

  resumeTimer(sessionId: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/timer/resume`, {});
  }

  tick(sessionId: number, elapsedSeconds: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/timer/ticks`, { elapsedSeconds });
  }

  finish(sessionId: number): Observable<CalmSession> {
    return this.http.post<CalmSession>(`${API_BASE}/calm-sessions/${sessionId}/finish`, {});
  }
}
