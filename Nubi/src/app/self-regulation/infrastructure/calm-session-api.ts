import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalmSession } from '../domain/model/calm-session.entity';
import { CalmSessionStatus } from '../domain/model/calm-session.enums';
import { CalmingResource } from '../domain/model/calming-resource.entity';
import { CalmSessionAssembler } from './calm-session-assembler';
import { CalmSessionResource } from './calm-session-response';

/** Intensidad con la que empieza una sesión nueva, sobre el máximo del recurso. */
const DEFAULT_INTENSITY_RATIO = 0.6;

/** Mismas operaciones que CalmSessionController en el diagrama de clases. */
@Injectable({ providedIn: 'root' })
export class CalmSessionApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = inject(CalmSessionAssembler);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.calmSessionsEndpoint}`;

  /** Última sesión del perfil, abierta o no. */
  getLatestByProfileId(profileId: number): Observable<CalmSession | null> {
    return this.http
      .get<CalmSessionResource[]>(this.endpoint, {
        params: { profileId, _sort: 'startedAt', _order: 'desc', _limit: 1 },
      })
      .pipe(map((resources) => (resources[0] ? this.assembler.toEntity(resources[0]) : null)));
  }

  getById(sessionId: number): Observable<CalmSession> {
    return this.http
      .get<CalmSessionResource>(`${this.endpoint}/${sessionId}`)
      .pipe(map((resource) => this.assembler.toEntity(resource)));
  }

  /** Comando "Iniciar sesión de calma" con el recurso elegido en la galería. */
  start(profileId: number, resource: CalmingResource): Observable<CalmSession> {
    return this.http
      .post<CalmSessionResource>(this.endpoint, {
        profileId,
        resourceId: resource.id,
        status: CalmSessionStatus.ACTIVE,
        intensity: Math.round(resource.maxIntensity * DEFAULT_INTENSITY_RATIO),
        lowStimulationActive: false,
        startedBySos: false,
        startedAt: new Date().toISOString(),
        endedAt: null,
        timer: null,
      })
      .pipe(map((created) => this.assembler.toEntity(created)));
  }

  update(session: CalmSession): Observable<CalmSession> {
    return this.http
      .put<CalmSessionResource>(
        `${this.endpoint}/${session.id}`,
        this.assembler.toResource(session),
      )
      .pipe(map((resource) => this.assembler.toEntity(resource)));
  }
}
