import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../shared/infrastructure/api-base';
import {
  Caregiver,
  CaregiverRole,
  ChildForm,
  ChildProfile,
  Diagnosis,
  Invitation,
  SensoryProfile,
  Subscription,
  TrustedContact,
} from '../domain/model/child-profile';

/** /api/v1/profiles y /api/v1/subscriptions (Perfil y Personalización). */
@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/profiles`;

  listOwned(): Observable<ChildProfile[]> {
    return this.http.get<ChildProfile[]>(this.url);
  }

  listAccessible(): Observable<ChildProfile[]> {
    return this.http.get<ChildProfile[]>(`${this.url}/accessible`);
  }

  create(form: ChildForm & { primaryCaregiverEmail: string }): Observable<ChildProfile> {
    return this.http.post<ChildProfile>(this.url, form);
  }

  update(id: number, form: ChildForm): Observable<ChildProfile> {
    return this.http.put<ChildProfile>(`${this.url}/${id}`, form);
  }

  updateSensory(id: number, sensory: SensoryProfile): Observable<SensoryProfile> {
    return this.http.put<SensoryProfile>(`${this.url}/${id}/sensory-profile`, sensory);
  }

  updateDiagnosis(id: number, diagnosis: Omit<Diagnosis, 'condition'>): Observable<Diagnosis> {
    return this.http.put<Diagnosis>(`${this.url}/${id}/diagnosis`, { ...diagnosis, condition: 'ASD' });
  }

  updatePhoto(id: number, photoUrl: string): Observable<ChildProfile> {
    return this.http.put<ChildProfile>(`${this.url}/${id}/photo`, { photoUrl });
  }

  inviteCaregiver(id: number, email: string, role: CaregiverRole): Observable<Caregiver> {
    return this.http.post<Caregiver>(`${this.url}/${id}/caregivers`, { email, role });
  }

  listInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.url}/invitations`);
  }

  acceptInvitation(id: number, caregiverId: number): Observable<Caregiver> {
    return this.http.patch<Caregiver>(`${this.url}/${id}/caregivers/${caregiverId}`, { status: 'ACCEPTED' });
  }

  revokeCaregiver(id: number, caregiverId: number): Observable<Caregiver> {
    return this.http.delete<Caregiver>(`${this.url}/${id}/caregivers/${caregiverId}`);
  }

  linkContact(id: number, contact: Omit<TrustedContact, 'id'>): Observable<TrustedContact> {
    return this.http.post<TrustedContact>(`${this.url}/${id}/trusted-contacts`, contact);
  }

  reorderContacts(id: number, order: number[]): Observable<TrustedContact[]> {
    return this.http.put<TrustedContact[]>(`${this.url}/${id}/trusted-contacts/order`, { order });
  }

  removeContact(id: number, contactId: number): Observable<TrustedContact[]> {
    return this.http.delete<TrustedContact[]>(`${this.url}/${id}/trusted-contacts/${contactId}`);
  }

  archive(id: number): Observable<ChildProfile> {
    return this.http.delete<ChildProfile>(`${this.url}/${id}`);
  }

  currentSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${API_BASE}/subscriptions/current`);
  }

  changePlan(plan: Subscription['plan']): Observable<Subscription> {
    return this.http.put<Subscription>(`${API_BASE}/subscriptions/current/plan`, { plan });
  }
}
