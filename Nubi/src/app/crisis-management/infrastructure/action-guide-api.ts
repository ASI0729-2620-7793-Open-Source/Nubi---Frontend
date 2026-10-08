import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActionGuide } from '../domain/model/action-guide.entity';
import { ActionGuideAssembler } from './action-guide-assembler';
import { ActionGuideResource } from './action-guide-response';

/** Consulta la guía de actuación vigente, que se asigna al iniciar una sesión SOS. */
@Injectable({ providedIn: 'root' })
export class ActionGuideApi {
  private readonly http = inject(HttpClient);
  private readonly assembler = inject(ActionGuideAssembler);
  private readonly endpoint = `${environment.apiBaseUrl}${environment.actionGuidesEndpoint}`;

  getActive(): Observable<ActionGuide | null> {
    return this.http
      .get<ActionGuideResource[]>(this.endpoint, { params: { active: true, _limit: 1 } })
      .pipe(map((resources) => (resources[0] ? this.assembler.toEntity(resources[0]) : null)));
  }
}
