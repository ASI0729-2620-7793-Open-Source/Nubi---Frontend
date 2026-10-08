import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileSummary } from '../domain/model/profile-summary.entity';

export interface ProfileSummaryResource {
  id: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  age: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.profilesEndpoint}`;

  getAll(): Observable<ProfileSummary[]> {
    return this.http
      .get<ProfileSummaryResource[]>(this.endpoint)
      .pipe(map((resources) => resources.map((resource) => this.toEntity(resource))));
  }

  private toEntity(resource: ProfileSummaryResource): ProfileSummary {
    const fullName =
      resource.fullName ??
      `${resource.firstName ?? ''} ${resource.lastName ?? ''}`.trim();
    return new ProfileSummary(resource.id, fullName, resource.age);
  }
}
