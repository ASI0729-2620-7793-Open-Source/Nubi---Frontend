import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { CommunicationRequestStatus } from './communication-request.enums';
import { Pictogram } from './pictogram.entity';
import { PictogramCategory } from './pictogram.enums';

/** Id de una solicitud que todavía no se guardó: la API le asigna el definitivo. */
const NEW_REQUEST_ID = 0;

/**
 * Aggregate Root. Necesidad que el perfil comunicó tocando un pictograma del tablero CAA
 * y que su cuidador debe confirmar que recibió.
 */
export class CommunicationRequest implements BaseEntity {
  constructor(
    public readonly id: number,
    public readonly profileId: number,
    public readonly pictogramCode: string,
    public readonly category: PictogramCategory,
    public readonly status: CommunicationRequestStatus,
    public readonly requestedAt: Date,
    public readonly confirmedAt: Date | null,
    public readonly confirmedByCaregiverId: number | null,
  ) {}

  /** Comando "Comunicar necesidad". */
  static create(profileId: number, pictogram: Pictogram): CommunicationRequest {
    return new CommunicationRequest(
      NEW_REQUEST_ID,
      profileId,
      pictogram.code,
      pictogram.category,
      CommunicationRequestStatus.PENDING,
      new Date(),
      null,
      null,
    );
  }

  isNew(): boolean {
    return this.id === NEW_REQUEST_ID;
  }

  isPending(): boolean {
    return this.status === CommunicationRequestStatus.PENDING;
  }

  /** Comando "Confirmar recepción". */
  confirm(caregiverId: number): CommunicationRequest {
    return new CommunicationRequest(
      this.id,
      this.profileId,
      this.pictogramCode,
      this.category,
      CommunicationRequestStatus.CONFIRMED,
      this.requestedAt,
      new Date(),
      caregiverId,
    );
  }
}
