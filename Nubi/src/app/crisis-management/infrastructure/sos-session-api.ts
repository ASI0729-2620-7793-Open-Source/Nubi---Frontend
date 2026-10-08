import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActionGuide } from '../domain/model/action-guide.entity';
import { SosSession } from '../domain/model/sos-session.entity';
import {
  CrisisIntensity,
  SensoryTrigger,
  SosSessionStatus,
} from '../domain/model/sos-session.enums';
import { SosSessionAssembler } from './sos-session-assembler';
import { SosSessionResource } from './sos-session-response';

/**
 * La pantalla de activación no pregunta la intensidad: toda sesión SOS empieza como
 * "Alterado" y se compara con la que el cuidador observa al terminar.
 */
const DEFAULT_INITIAL_INTENSITY = CrisisIntensity.ALTERED;

/** Datos con los que el cuidador activa el Modo SOS. */
export interface StartSosSession {
  profileId: number;
  caregiverId: number;
  guide: ActionGuide;
  firstStepOrder: number;
  trigger: SensoryTrigger;
}

/** Mismas operaciones que SosSessionController en el diagrama de clases. */
@Injectable({ providedIn: 'root' })
export class SosSessionApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = inject(SosSessionAssembler);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.sosSessionsEndpoint}`;

  getById(sessionId: number): Observable<SosSession> {
    return this.http
      .get<SosSessionResource>(`${this.endpoint}/${sessionId}`)
      .pipe(map((resource) => this.assembler.toEntity(resource)));
  }

  /** Sesión abierta del perfil: solo puede haber una a la vez. */
  getInProgressByProfileId(profileId: number): Observable<SosSession | null> {
    return this.http
      .get<SosSessionResource[]>(this.endpoint, {
        params: { profileId, status: SosSessionStatus.IN_PROGRESS, _limit: 1 },
      })
      .pipe(map((resources) => (resources[0] ? this.assembler.toEntity(resources[0]) : null)));
  }

  /** Comando "Activar Modo SOS" con la guía vigente. */
  start(command: StartSosSession): Observable<SosSession> {
    return this.http
      .post<SosSessionResource>(this.endpoint, {
        profileId: command.profileId,
        caregiverId: command.caregiverId,
        guideId: command.guide.id,
        status: SosSessionStatus.IN_PROGRESS,
        currentStepOrder: command.firstStepOrder,
        initialIntensity: DEFAULT_INITIAL_INTENSITY,
        finalIntensity: null,
        trigger: command.trigger,
        observedState: null,
        startedAt: new Date().toISOString(),
        finishedAt: null,
        completedSteps: [],
      })
      .pipe(map((created) => this.assembler.toEntity(created)));
  }

  update(session: SosSession): Observable<SosSession> {
    return this.http
      .put<SosSessionResource>(`${this.endpoint}/${session.id}`, this.assembler.toResource(session))
      .pipe(map((resource) => this.assembler.toEntity(resource)));
  }
}
