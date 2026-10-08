import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/** Solicitud de comunicación tal como la guarda la API falsa (json-server). */
export interface CommunicationRequestResource extends BaseResource {
  profileId: number;
  pictogramCode: string;
  category: string;
  status: string;
  requestedAt: string;
  confirmedAt: string | null;
  confirmedByCaregiverId: number | null;
}

export interface CommunicationRequestsResponse extends BaseResponse {
  communicationRequests: CommunicationRequestResource[];
}
