import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { CommunicationRequest } from '../domain/model/communication-request.entity';
import { CommunicationRequestApiEndpoint } from './communication-request-api-endpoint';

/**
 * Fachada de infraestructura de Comunicación Asistida. El tablero solo envía lo que el
 * perfil comunica; los pictogramas no se piden a la API (ver pictogram-catalog.ts).
 */
@Injectable({ providedIn: 'root' })
export class CommunicationApi extends BaseApi {
  private readonly requestsEndpoint = new CommunicationRequestApiEndpoint(inject(HttpClient));

  getRequests(profileId: number): Observable<CommunicationRequest[]> {
    return this.requestsEndpoint.getByProfile(profileId);
  }

  createRequest(request: CommunicationRequest): Observable<CommunicationRequest> {
    return this.requestsEndpoint.create(request);
  }

  updateRequest(request: CommunicationRequest): Observable<CommunicationRequest> {
    return this.requestsEndpoint.update(request, request.id);
  }
}
