import { Pictogram } from './pictogram.entity';
import { PictogramCategory } from './pictogram.enums';

/**
 * Catálogo fijo de pictogramas del tablero CAA. Es contenido que define Nubi, no datos
 * que haya que consultar: por eso vive en el dominio y no se pide a la API.
 */
export const PICTOGRAM_CATALOG: readonly Pictogram[] = [
  new Pictogram(1, 'WATER', PictogramCategory.BASIC_NEEDS, 'water_drop', true),
  new Pictogram(2, 'FOOD', PictogramCategory.BASIC_NEEDS, 'restaurant', true),
  new Pictogram(3, 'BATHROOM', PictogramCategory.BASIC_NEEDS, 'wc', false),
  new Pictogram(4, 'REST', PictogramCategory.BASIC_NEEDS, 'hotel', false),
  new Pictogram(5, 'PAIN', PictogramCategory.BASIC_NEEDS, 'healing', true),
  new Pictogram(6, 'HELP', PictogramCategory.BASIC_NEEDS, 'pan_tool', true),

  new Pictogram(7, 'HAPPY', PictogramCategory.EMOTIONS, 'sentiment_very_satisfied', true),
  new Pictogram(8, 'SAD', PictogramCategory.EMOTIONS, 'sentiment_dissatisfied', false),
  new Pictogram(9, 'ANGRY', PictogramCategory.EMOTIONS, 'mood_bad', false),
  new Pictogram(10, 'SCARED', PictogramCategory.EMOTIONS, 'sentiment_very_dissatisfied', false),

  new Pictogram(11, 'PLAY', PictogramCategory.ACTIVITIES, 'sports_esports', true),
  new Pictogram(12, 'MUSIC', PictogramCategory.ACTIVITIES, 'music_note', false),
  new Pictogram(13, 'READ', PictogramCategory.ACTIVITIES, 'menu_book', false),
  new Pictogram(14, 'GO_OUT', PictogramCategory.ACTIVITIES, 'park', false),
];
