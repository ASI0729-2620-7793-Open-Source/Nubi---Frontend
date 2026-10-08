import { PictogramCategory } from './pictogram.enums';

/**
 * Pictograma del tablero CAA (Comunicación Aumentativa y Alternativa): una opción que
 * el perfil toca para comunicar algo. Sus textos traducidos están en public/i18n.
 */
export class Pictogram {
  constructor(
    public readonly id: number,
    /** Identificador estable del pictograma; con él se buscan sus textos traducidos. */
    public readonly code: string,
    public readonly category: PictogramCategory,
    /** Nombre del ícono de Material que lo representa. */
    public readonly icon: string,
    public readonly favorite: boolean,
  ) {}

  /** Comando "Marcar pictograma como favorito", o lo desmarca si ya lo era. */
  toggleFavorite(): Pictogram {
    return new Pictogram(this.id, this.code, this.category, this.icon, !this.favorite);
  }
}
