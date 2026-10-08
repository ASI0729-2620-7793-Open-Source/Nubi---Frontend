import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensitivityLevel, SensoryProfileSnapshot } from '../domain/model/sensory-profile-snapshot';
import { SosProfile } from '../domain/model/sos-profile.entity';

interface ProfileResource {
  id: number;
  fullName: string;
  age: number;
  diagnosis: string;
  sensoryProfile: {
    auditorySensitivity: string;
    visualSensitivity: string;
    tactileSensitivity: string;
  };
}

/**
 * Anti-Corruption Layer hacia Perfil y Personalización. Este contexto solo lee los
 * perfiles a cargo del cuidador y su perfil sensorial, y nunca los modifica.
 */
@Injectable({ providedIn: 'root' })
export class ProfileContextFacade {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.profilesEndpoint}`;

  /** Perfiles que el cuidador tiene a cargo, para elegir a quién acompañar. */
  getProfiles(profileIds: number[]): Observable<SosProfile[]> {
    return this.http
      .get<ProfileResource[]>(this.endpoint)
      .pipe(
        map((resources) =>
          resources
            .filter((resource) => profileIds.includes(resource.id))
            .map(
              (resource) =>
                new SosProfile(
                  resource.id,
                  resource.fullName,
                  resource.age,
                  resource.diagnosis,
                  new SensoryProfileSnapshot(
                    resource.id,
                    resource.sensoryProfile.auditorySensitivity as SensitivityLevel,
                    resource.sensoryProfile.visualSensitivity as SensitivityLevel,
                    resource.sensoryProfile.tactileSensitivity as SensitivityLevel,
                  ),
                ),
            ),
        ),
      );
  }
}
