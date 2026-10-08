import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensitivityLevel, SensoryProfileSnapshot } from '../domain/model/sensory-profile-snapshot';

interface SensoryProfileResource {
  auditorySensitivity: string;
  visualSensitivity: string;
  tactileSensitivity: string;
  prioritizeVisuals: boolean;
}

interface ProfileResource {
  id: number;
  sensoryProfile: SensoryProfileResource;
}

/**
 * Anti-Corruption Layer hacia Perfil y Personalización. Autorregulación solo lee el
 * perfil sensorial, tal como define ProfileContextFacade.getSensoryProfile() en el
 * diagrama de clases.
 */
@Injectable({ providedIn: 'root' })
export class ProfileContextFacade {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.profilesEndpoint}`;

  getSensoryProfile(profileId: number): Observable<SensoryProfileSnapshot> {
    return this.http
      .get<ProfileResource>(`${this.endpoint}/${profileId}`)
      .pipe(
        map(
          (profile) =>
            new SensoryProfileSnapshot(
              profile.id,
              profile.sensoryProfile.auditorySensitivity as SensitivityLevel,
              profile.sensoryProfile.visualSensitivity as SensitivityLevel,
              profile.sensoryProfile.tactileSensitivity as SensitivityLevel,
              profile.sensoryProfile.prioritizeVisuals,
            ),
        ),
      );
  }
}
