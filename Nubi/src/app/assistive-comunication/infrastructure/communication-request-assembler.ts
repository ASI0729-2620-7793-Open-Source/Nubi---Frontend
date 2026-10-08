import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { CommunicationRequest } from '../domain/model/communication-request.entity';
import { CommunicationRequestStatus } from '../domain/model/communication-request.enums';
import { PictogramCategory } from '../domain/model/pictogram.enums';
import {
  CommunicationRequestResource,
  CommunicationRequestsResponse,
} from './communication-request-response';

/** Traduce las solicitudes de comunicación entre la API y el dominio. */
export class CommunicationRequestAssembler implements BaseAssembler<
  CommunicationRequest,
  CommunicationRequestResource,
  CommunicationRequestsResponse
> {
  toEntitiesFromResponse(response: CommunicationRequestsResponse): CommunicationRequest[] {
    return response.communicationRequests.map((resource) => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: CommunicationRequestResource): CommunicationRequest {
    return new CommunicationRequest(
      resource.id,
      resource.profileId,
      resource.pictogramCode,
      resource.category as PictogramCategory,
      resource.status as CommunicationRequestStatus,
      new Date(resource.requestedAt),
      resource.confirmedAt ? new Date(resource.confirmedAt) : null,
      resource.confirmedByCaregiverId,
    );
  }

  toResourceFromEntity(entity: CommunicationRequest): CommunicationRequestResource {
    return {
      // Sin id al crear: json-server asigna el siguiente
      ...(entity.isNew() ? {} : { id: entity.id }),
      profileId: entity.profileId,
      pictogramCode: entity.pictogramCode,
      category: entity.category,
      status: entity.status,
      requestedAt: entity.requestedAt.toISOString(),
      confirmedAt: entity.confirmedAt?.toISOString() ?? null,
      confirmedByCaregiverId: entity.confirmedByCaregiverId,
    } as CommunicationRequestResource;
  }
}
