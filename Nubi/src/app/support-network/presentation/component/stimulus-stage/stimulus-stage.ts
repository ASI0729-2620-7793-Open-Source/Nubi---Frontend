import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type Scene = 'bubbles' | 'waves' | 'stars' | 'rain' | 'ocean' | 'piano';

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  glyph: string;
}

const SCENES: Record<string, Scene> = {
  FLOATING_BUBBLES: 'bubbles',
  COLOR_WAVES: 'waves',
  STARRY_SKY: 'stars',
  GENTLE_RAIN: 'rain',
  OCEAN_SOUNDS: 'ocean',
  RELAXING_PIANO: 'piano',
};

/** Número estable entre 0 y 1: las partículas no cambian de lugar al redibujar. */
function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function particles(
  count: number,
  build: (index: number) => Omit<Particle, 'glyph'> & { glyph?: string },
): Particle[] {
  return Array.from({ length: count }, (_, index) => ({ glyph: '', ...build(index) }));
}

/**
 * Área de visualización del estímulo en uso, con el círculo "Respira" al centro.
 * La intensidad (de 0 a 1) cambia cuántos elementos hay y qué tan rápido se mueven;
 * el modo de baja estimulación baja el brillo y detiene todo menos la respiración.
 */
@Component({
  selector: 'app-stimulus-stage',
  imports: [TranslatePipe],
  templateUrl: './stimulus-stage.html',
  styleUrls: ['./stimulus-stage.css', './stimulus-scenes.css'],
  host: {
    '[class]': "'scene-' + scene()",
    '[class.low-stimulation]': 'lowStimulation()',
    '[style.--intensity]': 'intensity()',
  },
})
export class StimulusStage {
  readonly code = input.required<string>();
  readonly intensity = input(0.6);
  readonly lowStimulation = input(false);

  protected readonly scene = computed<Scene>(() => SCENES[this.code()] ?? 'bubbles');
  protected readonly waveLayers = [1, 2, 3];

  protected readonly particles = computed<Particle[]>(() => {
    const intensity = this.intensity();
    switch (this.scene()) {
      case 'bubbles':
        return particles(5 + Math.round(intensity * 10), (i) => ({
          x: seeded(i, 1) * 94,
          y: 100,
          size: 18 + seeded(i, 2) * 46,
          duration: 22 - intensity * 10 + seeded(i, 3) * 6,
          delay: seeded(i, 4) * 22,
        }));
      case 'stars':
        return particles(40 + Math.round(intensity * 70), (i) => ({
          x: seeded(i, 1) * 100,
          y: seeded(i, 2) * 100,
          size: 1.5 + seeded(i, 3) * 2.5,
          duration: 2.5 + seeded(i, 4) * 4,
          delay: seeded(i, 5) * 6,
        }));
      case 'rain':
        return particles(18 + Math.round(intensity * 45), (i) => ({
          x: seeded(i, 1) * 104,
          y: -10,
          size: 14 + seeded(i, 2) * 18,
          duration: 2 - intensity * 0.8 + seeded(i, 3) * 0.6,
          delay: seeded(i, 4) * 2.5,
        }));
      case 'piano':
        return particles(4 + Math.round(intensity * 6), (i) => ({
          x: 8 + seeded(i, 1) * 84,
          y: 100,
          size: 18 + seeded(i, 2) * 14,
          duration: 14 - intensity * 5 + seeded(i, 3) * 4,
          delay: seeded(i, 4) * 14,
          glyph: seeded(i, 5) < 0.5 ? '♪' : '♫',
        }));
      default:
        return [];
    }
  });
}
