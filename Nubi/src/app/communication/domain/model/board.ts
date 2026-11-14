import { MoodLevel } from '../../../shared/domain/mood';
import { currentLocale, st, withTexts } from '../../../shared/infrastructure/i18n-bridge';

/** Bounded Context Comunicación Asistida: tablero de pictogramas y registro de ánimo. */
export type CategoryType = 'BASIC_NEEDS' | 'EMOTIONS' | 'ACTIVITIES' | 'CUSTOM';
export type SelectionStatus = 'PENDING_DELIVERY' | 'DELIVERED' | 'UNDERSTOOD' | 'NOT_UNDERSTOOD';

export interface PictogramCategory {
  id: number;
  name: string;
  type: CategoryType;
  displayOrder: number;
}

export interface Pictogram {
  id: number;
  categoryId: number;
  label: string;
  phrase: string;
  imageUrl: string;
  audioUrl: string | null;
  hasAudio: boolean;
  favorite: boolean;
  custom: boolean;
  displayOrder: number;
}

export interface CommunicationBoard {
  id: number;
  profileId: number;
  maxFavorites: number;
  categories: PictogramCategory[];
  pictograms: Pictogram[];
}

export interface PictogramSelection {
  id: number;
  pictogramId: number;
  status: SelectionStatus;
  selectedAt: string;
  understoodAt: string | null;
}

export interface MoodCheckIn {
  id: number;
  level: MoodLevel;
  checkedAt: string;
}

export const SELECTION_STATUS: Record<SelectionStatus, { label: string; chip: string }> = {
  PENDING_DELIVERY: withTexts({ chip: 'sun' }, { label: 'selection.PENDING_DELIVERY' }),
  DELIVERED: withTexts({ chip: 'sky' }, { label: 'selection.DELIVERED' }),
  UNDERSTOOD: withTexts({ chip: 'mint' }, { label: 'selection.UNDERSTOOD' }),
  NOT_UNDERSTOOD: withTexts({ chip: 'coral' }, { label: 'selection.NOT_UNDERSTOOD' }),
};

export const CATEGORY_ICON: Record<CategoryType, string> = {
  BASIC_NEEDS: '🧃',
  EMOTIONS: '💛',
  ACTIVITIES: '🧩',
  CUSTOM: '⭐',
};

/** Los pictogramas del catálogo por defecto se dibujan con emojis grandes y claros. */
const EMOJI_BY_LABEL: Record<string, string> = {
  agua: '💧',
  comida: '🍎',
  baño: '🚽',
  descanso: '🛏️',
  dolor: '🤕',
  ayuda: '🙋',
  feliz: '😊',
  triste: '😢',
  enojado: '😠',
  asustado: '😨',
  jugar: '🧸',
  música: '🎵',
  leer: '📚',
  salir: '🚪',
};

/**
 * Cómo se ve un pictograma: `emoji:🍎` guarda un emoji elegido por el cuidador; una URL
 * http(s) se muestra como imagen; los del catálogo usan el emoji de su etiqueta.
 */
export function pictogramVisual(pictogram: Pick<Pictogram, 'imageUrl' | 'label'>): { emoji?: string; image?: string } {
  const url = pictogram.imageUrl ?? '';
  if (url.startsWith('emoji:')) return { emoji: url.slice(6) };
  if (/^(https?:|data:)/.test(url)) return { image: url };
  return { emoji: EMOJI_BY_LABEL[pictogram.label.toLowerCase()] ?? '⭐' };
}

/** Lee la frase en voz alta con la voz del dispositivo (sin conexión, sin archivos). */
export function speak(text: string): void {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(st(text));
  utterance.lang = currentLocale() === 'en-US' ? 'en-US' : 'es-ES';
  utterance.rate = 0.9;
  utterance.pitch = 1.05;
  speechSynthesis.speak(utterance);
}
