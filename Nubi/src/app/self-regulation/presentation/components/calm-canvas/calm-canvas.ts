import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Lienzo de dibujo tranquilo: trazos suaves con colores pastel que se desvanecen poco a poco,
 * como dibujar en la arena. No hay que "hacerlo bien": solo mover la mano con calma.
 */
@Component({
  selector: 'app-calm-canvas',
  imports: [TranslatePipe],
  template: `
    <div class="wrap">
      <canvas
        #canvas
        (pointerdown)="start($event)"
        (pointermove)="draw($event)"
        (pointerup)="end()"
        (pointerleave)="end()"
        [attr.aria-label]="'calmCanvas.lienzoParaDibujar' | translate"
      ></canvas>
      <div class="palette">
        @for (color of colors; track color) {
          <button type="button" [style.background]="color" [class.active]="color === current()" (click)="current.set(color)" [attr.aria-label]="('calmCanvas.color' | translate) + color"></button>
        }
        <button type="button" class="tool" [class.active]="fade()" (click)="fade.set(!fade())" [title]="'calmCanvas.arenaMagicaLoDibujado' | translate">
          <span class="icon">auto_awesome</span>
        </button>
        <button type="button" class="tool" (click)="clear()" [title]="'calmCanvas.borrarTodo' | translate"><span class="icon">ink_eraser</span></button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .wrap {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 320px;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background: linear-gradient(160deg, #fffaf2, #fdf1e6);
      box-shadow: inset 0 0 0 1px var(--line);
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
      cursor: crosshair;
    }
    .palette {
      position: absolute;
      left: 50%;
      bottom: 14px;
      translate: -50% 0;
      display: flex;
      gap: 8px;
      padding: 8px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: var(--shadow-m);
    }
    .palette button {
      width: 38px;
      height: 38px;
      border: 3px solid #fff;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 0 1px var(--line);
    }
    .palette button.active {
      box-shadow: 0 0 0 3px var(--teal-500);
    }
    .palette .tool {
      display: grid;
      place-items: center;
      background: var(--surface-2);
      color: var(--ink-2);
    }
  `,
})
export class CalmCanvas implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly colors = ['#9a93bd', '#86b5ae', '#8ba8bf', '#d3b783', '#c9988f'];
  protected readonly current = signal(this.colors[0]);
  protected readonly fade = signal(true);
  private context!: CanvasRenderingContext2D;
  private drawing = false;
  private last: { x: number; y: number } | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    const canvas = this.canvas().nativeElement;
    this.context = canvas.getContext('2d')!;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    // Arena mágica: cada medio segundo el dibujo se aclara un poco
    this.fadeTimer = setInterval(() => {
      if (!this.fade() || this.drawing) return;
      this.context.save();
      this.context.globalCompositeOperation = 'destination-out';
      this.context.fillStyle = 'rgba(255,255,255,0.035)';
      this.context.fillRect(0, 0, canvas.width, canvas.height);
      this.context.restore();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.resizeObserver?.disconnect();
  }

  start(event: PointerEvent): void {
    this.drawing = true;
    this.last = this.point(event);
    this.canvas().nativeElement.setPointerCapture(event.pointerId);
  }

  draw(event: PointerEvent): void {
    if (!this.drawing || !this.last) return;
    const point = this.point(event);
    const ctx = this.context;
    ctx.strokeStyle = this.current();
    ctx.lineWidth = 14 * devicePixelRatio;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(this.last.x, this.last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    this.last = point;
  }

  end(): void {
    this.drawing = false;
    this.last = null;
  }

  clear(): void {
    const canvas = this.canvas().nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
  }

  private point(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * devicePixelRatio, y: (event.clientY - rect.top) * devicePixelRatio };
  }

  private resize(): void {
    const canvas = this.canvas().nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width * devicePixelRatio);
    canvas.height = Math.max(1, rect.height * devicePixelRatio);
  }
}
