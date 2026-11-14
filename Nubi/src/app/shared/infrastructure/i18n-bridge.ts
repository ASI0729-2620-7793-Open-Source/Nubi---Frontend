/**
 * Puente de traducción para el código que no es un componente (funciones de fechas, manejo de
 * errores, constantes del dominio). I18nStore lo conecta con ngx-translate al arrancar la app;
 * mientras tanto devuelve la clave tal cual.
 */
type Translator = (key: string, params?: Record<string, unknown>) => string;

let translator: Translator = (key) => key;
let locale = 'es-PE';

export function bindTranslator(fn: Translator): void {
  translator = fn;
}

export function setLocale(value: string): void {
  locale = value;
}

/** Locale de Intl vigente: es-PE o en-US. */
export function currentLocale(): string {
  return locale;
}

/** Traduce una clave; admite parámetros {{nombre}}. */
export function t(key: string, params?: Record<string, unknown>): string {
  return translator(key, params);
}

/** Verdadero si la clave existe en el idioma activo. */
export function hasTranslation(key: string): boolean {
  return translator(key) !== key;
}

/** Clave estable para un texto que viene del backend ("Burbujas flotantes" -> burbujasFlotantes). */
export function serverKey(text: string): string {
  const folded = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const words = folded.split(' ').filter(Boolean);
  const camel = words.map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1))).join('');
  return `server.${camel.slice(0, 70)}`;
}

/**
 * Texto que llega del backend (catálogo de calma, guía SOS, pictogramas, rutina sugerida):
 * si existe su traducción en el idioma activo se usa; si no (por ejemplo, un pictograma que creó
 * la familia) se muestra tal como se guardó.
 */
export function st(text: string | null | undefined): string {
  if (!text) return '';
  const key = serverKey(text);
  const translated = translator(key);
  return translated === key ? text : translated;
}

/**
 * Copia `base` y agrega propiedades de texto que se calculan con t(clave) en cada lectura, así las
 * etiquetas de las constantes del dominio cambian solas al cambiar el idioma.
 */
export function withTexts<B extends object, K extends string>(base: B, texts: Record<K, string>): B & Record<K, string> {
  const target = { ...base } as B & Record<K, string>;
  for (const [prop, key] of Object.entries<string>(texts)) {
    Object.defineProperty(target, prop, { get: () => t(key), enumerable: true });
  }
  return target;
}
