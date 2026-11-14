import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../shared/infrastructure/api-base';
import { EpisodeRecord, EpisodeReport, HelpRequest, SupportRecommendation } from '../domain/model/support';

/** /api/v1/episode-records, /help-requests, /episode-reports y /support-network/recommendations. */
@Injectable({ providedIn: 'root' })
export class SupportApi {
  private readonly http = inject(HttpClient);

  private params(profileId: number) {
    return { params: { profileId: String(profileId) } };
  }

  episodes(profileId: number): Observable<EpisodeRecord[]> {
    return this.http.get<EpisodeRecord[]>(`${API_BASE}/episode-records`, this.params(profileId));
  }

  createEpisode(episode: Omit<EpisodeRecord, 'id' | 'createdAt'>): Observable<EpisodeRecord> {
    return this.http.post<EpisodeRecord>(`${API_BASE}/episode-records`, episode);
  }

  addNote(episodeId: number, notes: string): Observable<EpisodeRecord> {
    return this.http.put<EpisodeRecord>(`${API_BASE}/episode-records/${episodeId}/notes`, { notes });
  }

  helpRequests(profileId: number): Observable<HelpRequest[]> {
    return this.http.get<HelpRequest[]>(`${API_BASE}/help-requests`, this.params(profileId));
  }

  requestHelp(profileId: number, message: string): Observable<HelpRequest> {
    return this.http.post<HelpRequest>(`${API_BASE}/help-requests`, { profileId, message });
  }

  confirmHelp(id: number): Observable<HelpRequest> {
    return this.http.put<HelpRequest>(`${API_BASE}/help-requests/${id}/confirmation`, {});
  }

  cancelHelp(id: number): Observable<HelpRequest> {
    return this.http.put<HelpRequest>(`${API_BASE}/help-requests/${id}/cancellation`, {});
  }

  reports(profileId: number): Observable<EpisodeReport[]> {
    return this.http.get<EpisodeReport[]>(`${API_BASE}/episode-reports`, this.params(profileId));
  }

  createReport(report: Pick<EpisodeReport, 'profileId' | 'periodStart' | 'periodEnd' | 'episodeCount' | 'summary' | 'observations'>): Observable<EpisodeReport> {
    return this.http.post<EpisodeReport>(`${API_BASE}/episode-reports`, report);
  }

  shareReport(id: number, sharedWith: string): Observable<EpisodeReport> {
    return this.http.put<EpisodeReport>(`${API_BASE}/episode-reports/${id}/share`, { sharedWith });
  }

  recommendations(profileId: number): Observable<SupportRecommendation[]> {
    return this.http.get<SupportRecommendation[]>(`${API_BASE}/support-network/recommendations`, this.params(profileId));
  }

  createRecommendation(rec: Pick<SupportRecommendation, 'profileId' | 'episodeRecordId' | 'title' | 'description' | 'strategy' | 'actionGuide'>): Observable<SupportRecommendation> {
    return this.http.post<SupportRecommendation>(`${API_BASE}/support-network/recommendations`, rec);
  }

  markEffective(id: number): Observable<SupportRecommendation> {
    return this.http.put<SupportRecommendation>(`${API_BASE}/support-network/recommendations/${id}/effective`, {});
  }
}
