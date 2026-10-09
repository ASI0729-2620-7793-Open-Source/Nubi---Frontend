import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Caregiver } from '../domain/model/caregiver.entity';

export interface CaregiverResource {
  id: number;
  fullName: string;
  role: string;
  avatarUrl: string;
  profileIds: number[];
}

@Injectable({ providedIn: 'root' })
export class CaregiverApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.caregiversEndpoint}`;

  getById(caregiverId: number): Observable<Caregiver> {
    return this.http
      .get<CaregiverResource>(`${this.endpoint}/${caregiverId}`)
      .pipe(map((resource) => this.toEntity(resource)));
  }

  /** Guarda los perfiles que el cuidador tiene a cargo. */
  assignProfiles(caregiverId: number, profileIds: number[]): Observable<Caregiver> {
    return this.http
      .patch<CaregiverResource>(`${this.endpoint}/${caregiverId}`, { profileIds })
      .pipe(map((resource) => this.toEntity(resource)));
  }

  private toEntity(resource: CaregiverResource): Caregiver {
    return new Caregiver(
      resource.id,
      resource.fullName,
      resource.role,
      resource.avatarUrl,
      resource.profileIds,
    );
  }
}
