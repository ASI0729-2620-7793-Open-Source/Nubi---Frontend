/**
 * Value Object inmutable: cada operación devuelve un temporizador nuevo, como define
 * el diagrama de clases (sección 4.7.1).
 */
export class CalmTimer {
  constructor(
    public readonly durationMinutes: number,
    public readonly remainingSeconds: number,
    public readonly running: boolean,
  ) {}

  static start(minutes: number): CalmTimer {
    return new CalmTimer(minutes, minutes * 60, true);
  }

  get totalSeconds(): number {
    return this.durationMinutes * 60;
  }

  /** Fracción del tiempo que todavía queda, de 1 a 0. */
  get remainingRatio(): number {
    return this.totalSeconds === 0 ? 0 : this.remainingSeconds / this.totalSeconds;
  }

  pause(): CalmTimer {
    return new CalmTimer(this.durationMinutes, this.remainingSeconds, false);
  }

  resume(): CalmTimer {
    return this.isExpired()
      ? this
      : new CalmTimer(this.durationMinutes, this.remainingSeconds, true);
  }

  tick(seconds: number): CalmTimer {
    if (!this.running) return this;
    const remaining = Math.max(0, this.remainingSeconds - seconds);
    return new CalmTimer(this.durationMinutes, remaining, remaining > 0);
  }

  isExpired(): boolean {
    return this.remainingSeconds === 0;
  }
}
