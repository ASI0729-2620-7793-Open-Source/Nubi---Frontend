import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeclaredDiagnosis } from '../domain/model/declared-diagnosis.vo';
import { NeurodivergentProfile } from '../domain/model/neurodivergent-profile.entity';
import { CaregiverRole } from '../domain/model/profile.enums';
import { SensoryProfile } from '../domain/model/sensory-profile.vo';
import { TrustedContact } from '../domain/model/trusted-contact.entity';
import { ProfileAssembler } from './profile-assembler';
import { NeurodivergentProfileResource } from './profile-resources';

/**
 * Fachada HTTP del ProfileController. Solo frontend: consume la API REST
 * (json-server en desarrollo) y delega el mapeo al ProfileAssembler.
 */
@Injectable({ providedIn: 'root' })
export class ProfileApiEndpoint {
  private readonly http = inject(HttpClient);
  private readonly assembler = new ProfileAssembler();
  private readonly base = `${environment.apiBaseUrl}${environment.profilesEndpoint}`;

  /** GET /profiles — lista del cuidador (US-01, US-06). */
  getProfiles(): Observable<NeurodivergentProfile[]> {
    return this.http
      .get<NeurodivergentProfileResource[]>(this.base)
      .pipe(map((resources) => this.assembler.toEntitiesFromResponse(resources)));
  }

  getById(profileId: number): Observable<NeurodivergentProfile> {
    return this.http
      .get<NeurodivergentProfileResource>(`${this.base}/${profileId}`)
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));
  }

  /** POST /profiles — crear perfil (US-01). */
  createProfile(profile: NeurodivergentProfile): Observable<NeurodivergentProfile> {
    const resource = this.assembler.toResourceFromEntity(profile);
    return this.http
      .post<NeurodivergentProfileResource>(this.base, resource)
      .pipe(map((created) => this.assembler.toEntityFromResource(created)));
  }

  /** PUT /profiles/:id — editar datos generales (US-02, objeto completo). */
  updateProfile(profile: NeurodivergentProfile): Observable<NeurodivergentProfile> {
    const resource = this.assembler.toResourceFromEntity(profile);
    return this.http
      .put<NeurodivergentProfileResource>(`${this.base}/${profile.id}`, resource)
      .pipe(map((updated) => this.assembler.toEntityFromResource(updated)));
  }

  /** PUT /profiles/:id/sensitivities — Value Object completo (US-03). */
  registerSensitivities(
    profile: NeurodivergentProfile,
    sensory: SensoryProfile,
  ): Observable<NeurodivergentProfile> {
    return this.updateProfile(profile.registerSensitivities(sensory));
  }

  /** PUT /profiles/:id/diagnosis — Value Object completo (US-04). */
  declareDiagnosis(
    profile: NeurodivergentProfile,
    diagnosis: DeclaredDiagnosis,
  ): Observable<NeurodivergentProfile> {
    return this.updateProfile(profile.declareDiagnosis(diagnosis));
  }

  /** POST /profiles/:id/caregivers — invita por correo, nace PENDING (US-06). */
  inviteCaregiver(
    profile: NeurodivergentProfile,
    email: string,
    role: CaregiverRole,
  ): Observable<NeurodivergentProfile> {
    return this.updateProfile(profile.inviteCaregiver(email, role));
  }

  /** POST /profiles/:id/trusted-contacts — opcional, sin user story. */
  linkTrustedContact(
    profile: NeurodivergentProfile,
    contact: TrustedContact,
  ): Observable<NeurodivergentProfile> {
    return this.updateProfile(profile.linkTrustedContact(contact));
  }
}
