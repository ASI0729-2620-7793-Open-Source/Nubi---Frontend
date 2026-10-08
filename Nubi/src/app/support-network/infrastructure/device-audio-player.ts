import { Injectable, computed, signal } from '@angular/core';

/** Arma el paisaje sonoro dentro del contexto de audio y devuelve cómo detenerlo. */
type Soundscape = (context: AudioContext, output: AudioNode) => () => void;

/**
 * Adaptador al "Reproductor de audio del dispositivo" del Design-Level Event Storming
 * (sección 4.6.1). Los sonidos de los estímulos auditivos se generan con la Web Audio API:
 * no dependen de archivos ni de conexión, igual que los recursos marcados como
 * `availableOffline`.
 */
@Injectable({ providedIn: 'root' })
export class DeviceAudioPlayer {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private stopSoundscape: (() => void) | null = null;
  private currentCode: string | null = null;
  private readonly playingState = signal(false);

  readonly playing = computed(() => this.playingState());

  /** Reproduce el sonido del recurso; si ya está sonando, solo ajusta el volumen. */
  play(code: string, volume: number): void {
    const soundscape = SOUNDSCAPES[code];
    if (!soundscape) return;

    if (this.currentCode !== code) {
      this.stop();
      const context = (this.context ??= this.createContext());
      this.master = context.createGain();
      this.master.gain.value = 0;
      this.master.connect(context.destination);
      this.stopSoundscape = soundscape(context, this.master);
      this.currentCode = code;
    }

    this.setVolume(volume);
    // El navegador solo deja sonar audio después de una interacción del usuario
    const context = this.context;
    if (context) {
      this.playingState.set(context.state === 'running');
      void context.resume().then(() => this.playingState.set(this.currentCode !== null));
    }
  }

  setVolume(volume: number): void {
    if (!this.context || !this.master) return;
    this.master.gain.setTargetAtTime(volume, this.context.currentTime, 0.4);
  }

  stop(): void {
    this.stopSoundscape?.();
    this.master?.disconnect();
    this.stopSoundscape = null;
    this.master = null;
    this.currentCode = null;
    this.playingState.set(false);
  }

  private createContext(): AudioContext {
    const context = new AudioContext();
    context.onstatechange = () =>
      this.playingState.set(context.state === 'running' && this.currentCode !== null);
    return context;
  }
}

const SOUNDSCAPES: Record<string, Soundscape> = {
  OCEAN_SOUNDS: oceanWaves,
  RELAXING_PIANO: relaxingPiano,
  GENTLE_RAIN: gentleRain,
};

/** Lluvia: un rumor constante de gotas finas y, cada tanto, alguna gota más cercana. */
function gentleRain(context: AudioContext, output: AudioNode): () => void {
  const source = context.createBufferSource();
  source.buffer = pinkNoise(context, 4);
  source.loop = true;

  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 500;
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 5500;
  const level = context.createGain();
  level.gain.value = 0.35;

  source.connect(highpass).connect(lowpass).connect(level).connect(output);
  source.start();

  // Gotas sueltas: ráfagas muy cortas de ruido filtrado, a intervalos irregulares
  const dropSound = whiteNoise(context, 0.05);
  let nextDrop: ReturnType<typeof setTimeout>;
  const playDrop = () => {
    const drop = context.createBufferSource();
    drop.buffer = dropSound;
    const band = context.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2500 + Math.random() * 3000;
    band.Q.value = 8;
    const envelope = context.createGain();
    const at = context.currentTime;
    envelope.gain.setValueAtTime(0.2 + Math.random() * 0.25, at);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);

    drop.connect(band).connect(envelope).connect(output);
    drop.start(at);
    drop.stop(at + 0.05);
    nextDrop = setTimeout(playDrop, 60 + Math.random() * 240);
  };
  playDrop();

  return () => {
    clearTimeout(nextDrop);
    source.stop();
    level.disconnect();
  };
}

/** Oleaje: ruido marrón filtrado que sube y baja con una ola cada 9 segundos. */
function oceanWaves(context: AudioContext, output: AudioNode): () => void {
  const source = context.createBufferSource();
  source.buffer = brownNoise(context, 6);
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 650;

  const swell = context.createGain();
  swell.gain.value = 0.5;

  const wave = context.createOscillator();
  wave.frequency.value = 1 / 9;
  const swellDepth = context.createGain();
  swellDepth.gain.value = 0.42;
  const filterDepth = context.createGain();
  filterDepth.gain.value = 380;
  wave.connect(swellDepth).connect(swell.gain);
  wave.connect(filterDepth).connect(filter.frequency);

  source.connect(filter).connect(swell).connect(output);
  source.start();
  wave.start();

  return () => {
    source.stop();
    wave.stop();
    swell.disconnect();
  };
}

/** Piano: notas lentas de una escala pentatónica, sin disonancias, con un eco suave. */
function relaxingPiano(context: AudioContext, output: AudioNode): () => void {
  const bus = context.createGain();
  const echo = context.createDelay();
  echo.delayTime.value = 0.42;
  const feedback = context.createGain();
  feedback.gain.value = 0.3;
  const echoLevel = context.createGain();
  echoLevel.gain.value = 0.3;

  bus.connect(output);
  bus.connect(echo);
  echo.connect(feedback).connect(echo);
  echo.connect(echoLevel).connect(output);

  const melody = [
    261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66, 329.63, 261.63, 220.0, 261.63, 196.0,
  ];
  let step = 0;
  const playNext = () => {
    const frequency = melody[step % melody.length];
    pianoNote(context, bus, frequency, context.currentTime, 0.45);
    if (step % 4 === 0) {
      pianoNote(context, bus, frequency / 2, context.currentTime, 0.25);
    }
    step++;
  };

  playNext();
  const interval = setInterval(playNext, 1600);

  return () => {
    clearInterval(interval);
    bus.disconnect();
    echoLevel.disconnect();
    feedback.disconnect();
  };
}

function pianoNote(
  context: AudioContext,
  output: AudioNode,
  frequency: number,
  at: number,
  level: number,
): void {
  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(level, at + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);

  const fundamental = context.createOscillator();
  fundamental.type = 'sine';
  fundamental.frequency.value = frequency;

  const overtone = context.createOscillator();
  overtone.type = 'triangle';
  overtone.frequency.value = frequency * 2;
  const overtoneLevel = context.createGain();
  overtoneLevel.gain.value = 0.15;

  fundamental.connect(envelope);
  overtone.connect(overtoneLevel).connect(envelope);
  envelope.connect(output);

  for (const oscillator of [fundamental, overtone]) {
    oscillator.start(at);
    oscillator.stop(at + 3.3);
  }
}

function whiteNoise(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Ruido rosa: más suave que el blanco, parecido al rumor de la lluvia. */
function pinkNoise(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.12;
  }
  return buffer;
}

function brownNoise(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}
