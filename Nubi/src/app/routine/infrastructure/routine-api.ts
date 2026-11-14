import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../shared/infrastructure/api-base';
import { RoutineStep, RoutineStepForm } from '../domain/model/routine-step';

/** /api/v1/profiles/{id}/routine-steps */
@Injectable({ providedIn: 'root' })
export class RoutineApi {
  private readonly http = inject(HttpClient);

  private base(profileId: number): string {
    return `${API_BASE}/profiles/${profileId}/routine-steps`;
  }

  steps(profileId: number): Observable<RoutineStep[]> {
    return this.http.get<RoutineStep[]>(this.base(profileId));
  }

  add(profileId: number, form: RoutineStepForm): Observable<RoutineStep> {
    return this.http.post<RoutineStep>(this.base(profileId), form);
  }

  update(profileId: number, stepId: number, form: RoutineStepForm): Observable<RoutineStep> {
    return this.http.put<RoutineStep>(`${this.base(profileId)}/${stepId}`, form);
  }

  remove(profileId: number, stepId: number): Observable<unknown> {
    return this.http.delete(`${this.base(profileId)}/${stepId}`);
  }

  reorder(profileId: number, order: number[]): Observable<RoutineStep[]> {
    return this.http.put<RoutineStep[]>(`${this.base(profileId)}/order`, { order });
  }

  complete(profileId: number, stepId: number, done: boolean): Observable<RoutineStep> {
    const url = `${this.base(profileId)}/${stepId}/completion`;
    return done ? this.http.post<RoutineStep>(url, {}) : this.http.delete<RoutineStep>(url);
  }
}
