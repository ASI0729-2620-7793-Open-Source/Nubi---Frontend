import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { CommunicationRequest } from '../domain/model/communication-request.entity';
import { CommunicationRequestAssembler } from './communication-request-assembler';
import {
  CommunicationRequestResource,
  CommunicationRequestsResponse,
} from './communication-request-response';

/** Endpoint de las solicitudes de comunicación (/communicationRequests). */
export class CommunicationRequestApiEndpoint extends BaseApiEndpoint<
  CommunicationRequest,
  CommunicationRequestResource,
  CommunicationRequestsResponse,
  CommunicationRequestAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.apiBaseUrl}${environment.communicationRequestsEndpoint}`,
      new CommunicationRequestAssembler(),
    );
  }

  getByProfile(profileId: number): Observable<CommunicationRequest[]> {
    return this.http
      .get<CommunicationRequestResource[]>(this.endpointUrl, { params: { profileId } })
      .pipe(
        map((resources) =>
          resources.map((resource) => this.assembler.toEntityFromResource(resource)),
        ),
        catchError(this.handleError('Failed to fetch communication requests')),
      );
  }
}
