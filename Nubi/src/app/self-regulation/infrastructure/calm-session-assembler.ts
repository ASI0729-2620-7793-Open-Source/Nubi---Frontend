import { Injectable } from '@angular/core';
import { CalmSession } from '../domain/model/calm-session.entity';
import { CalmSessionStatus } from '../domain/model/calm-session.enums';
import { CalmTimer } from '../domain/model/calm-timer';
import { CalmSessionResource } from './calm-session-response';

/** Traduce entre los recursos de la API y el agregado CalmSession, en ambos sentidos. */
@Injectable({ providedIn: 'root' })
export class CalmSessionAssembler {
  toEntity(resource: CalmSessionResource): CalmSession {
    return new CalmSession(
      resource.id,
      resource.profileId,
      resource.resourceId,
      resource.status as CalmSessionStatus,
      resource.intensity,
      resource.lowStimulationActive,
      resource.startedBySos,
      new Date(resource.startedAt),
      resource.endedAt ? new Date(resource.endedAt) : null,
      resource.timer
        ? new CalmTimer(
            resource.timer.durationMinutes,
            resource.timer.remainingSeconds,
            resource.timer.running,
          )
        : null,
    );
  }

  toResource(session: CalmSession): CalmSessionResource {
    return {
      id: session.id,
      profileId: session.profileId,
      resourceId: session.resourceId,
      status: session.status,
      intensity: session.intensity,
      lowStimulationActive: session.lowStimulationActive,
      startedBySos: session.startedBySos,
      startedAt: session.startedAt.toISOString(),
      endedAt: session.endedAt ? session.endedAt.toISOString() : null,
      timer: session.timer
        ? {
            durationMinutes: session.timer.durationMinutes,
            remainingSeconds: session.timer.remainingSeconds,
            running: session.timer.running,
          }
        : null,
    };
  }
}
