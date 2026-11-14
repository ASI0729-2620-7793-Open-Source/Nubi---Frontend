import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MoodLevel } from '../../shared/domain/mood';
import { API_BASE } from '../../shared/infrastructure/api-base';
import { CommunicationBoard, MoodCheckIn, Pictogram, PictogramCategory, PictogramSelection } from '../domain/model/board';

/** /api/v1/profiles/{id}/communication-board */
@Injectable({ providedIn: 'root' })
export class BoardApi {
  private readonly http = inject(HttpClient);

  private base(profileId: number): string {
    return `${API_BASE}/profiles/${profileId}/communication-board`;
  }

  board(profileId: number): Observable<CommunicationBoard> {
    return this.http.get<CommunicationBoard>(this.base(profileId));
  }

  quickAccess(profileId: number): Observable<Pictogram[]> {
    return this.http.get<Pictogram[]>(`${this.base(profileId)}/quick-access`);
  }

  createCategory(profileId: number, name: string): Observable<PictogramCategory> {
    return this.http.post<PictogramCategory>(`${this.base(profileId)}/categories`, { name });
  }

  createPictogram(
    profileId: number,
    pictogram: { label: string; phrase: string; imageUrl: string; categoryId: number },
  ): Observable<Pictogram> {
    return this.http.post<Pictogram>(`${this.base(profileId)}/pictograms`, pictogram);
  }

  favorite(profileId: number, pictogramId: number, favorite: boolean): Observable<Pictogram> {
    const url = `${this.base(profileId)}/pictograms/${pictogramId}/favorite`;
    return favorite ? this.http.put<Pictogram>(url, {}) : this.http.delete<Pictogram>(url);
  }

  move(profileId: number, pictogramId: number, categoryId: number): Observable<Pictogram> {
    return this.http.put<Pictogram>(`${this.base(profileId)}/pictograms/${pictogramId}/category`, { categoryId });
  }

  select(profileId: number, pictogramId: number): Observable<PictogramSelection> {
    return this.http.post<PictogramSelection>(`${this.base(profileId)}/pictograms/${pictogramId}/selections`, {});
  }

  selections(profileId: number): Observable<PictogramSelection[]> {
    return this.http.get<PictogramSelection[]>(`${this.base(profileId)}/selections`);
  }

  markSelection(
    profileId: number,
    selectionId: number,
    step: 'delivered' | 'understood' | 'not-understood',
  ): Observable<PictogramSelection> {
    const status = { delivered: 'DELIVERED', understood: 'UNDERSTOOD', 'not-understood': 'NOT_UNDERSTOOD' }[step];
    return this.http.patch<PictogramSelection>(`${this.base(profileId)}/selections/${selectionId}`, { status });
  }

  registerMood(profileId: number, level: MoodLevel): Observable<MoodCheckIn> {
    return this.http.post<MoodCheckIn>(`${this.base(profileId)}/mood-check-ins`, { level });
  }

  moods(profileId: number): Observable<MoodCheckIn[]> {
    return this.http.get<MoodCheckIn[]>(`${this.base(profileId)}/mood-check-ins`);
  }
}
