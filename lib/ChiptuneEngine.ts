"use client";

/**
 * Original 8-bit "jeepney jingle" composed and synthesized entirely in the
 * browser with the Web Audio API. No external audio files, no copyrighted
 * material - just oscillators playing a melody/bassline/drum pattern we
 * wrote ourselves.
 */

type NoteName =
  | "C3" | "D3" | "E3" | "F3" | "G3" | "A3" | "B3"
  | "C4" | "D4" | "E4" | "F4" | "G4" | "A4" | "B4"
  | "C5" | "D5" | "E5" | "F5" | "G5" | "A5" | "B5"
  | "REST";

const NOTE_FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
};

// A bouncy, upbeat melody meant to feel like a jeepney barker's jingle.
// Each entry: [note, durationInBeats]
const MELODY: [NoteName, number][] = [
  ["E4", 0.5], ["G4", 0.5], ["A4", 0.5], ["G4", 0.5],
  ["E4", 0.5], ["G4", 0.5], ["C5", 1],
  ["B4", 0.5], ["A4", 0.5], ["G4", 0.5], ["A4", 0.5],
  ["G4", 0.5], ["E4", 0.5], ["D4", 1],
  ["E4", 0.5], ["G4", 0.5], ["A4", 0.5], ["G4", 0.5],
  ["E4", 0.5], ["D4", 0.5], ["E4", 1],
  ["G4", 0.5], ["A4", 0.5], ["B4", 0.5], ["C5", 0.5],
  ["D5", 0.5], ["C5", 0.5], ["A4", 1],
];

const BASSLINE: [NoteName, number][] = [
  ["C3", 1], ["G3", 1],
  ["C3", 1], ["G3", 1],
  ["A3", 1], ["E3", 1],
  ["F3", 1], ["G3", 1],
  ["C3", 1], ["G3", 1],
  ["A3", 1], ["E3", 1],
  ["F3", 1], ["F3", 1], ["G3", 1], ["G3", 1],
];

export class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private playing = false;
  private timer: number | null = null;
  private muted = false;

  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.18;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : 0.18;
    }
  }

  isMuted() {
    return this.muted;
  }

  private playNote(freq: number, startTime: number, dur: number, type: OscillatorType, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.95);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur);
  }

  private playDrum(startTime: number, kind: "kick" | "hat") {
    if (!this.ctx || !this.masterGain) return;
    if (kind === "kick") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, startTime);
      osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.12);
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    } else {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 6000;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(startTime);
    }
  }

  start() {
    const ctx = this.ensureContext();
    if (this.playing) return;
    this.playing = true;
    const tempo = 150; // bpm
    const beatDur = 60 / tempo;

    let cursor = ctx.currentTime + 0.1;
    const loopLengthBeats = MELODY.reduce((s, [, d]) => s + d, 0);
    const loopDur = loopLengthBeats * beatDur;

    const scheduleLoop = (loopStart: number) => {
      let t = loopStart;
      for (const [note, dur] of MELODY) {
        if (note !== "REST") this.playNote(NOTE_FREQ[note], t, dur * beatDur, "square", 0.09);
        t += dur * beatDur;
      }
      let bt = loopStart;
      for (const [note, dur] of BASSLINE) {
        if (note !== "REST") this.playNote(NOTE_FREQ[note], bt, dur * beatDur, "triangle", 0.12);
        bt += dur * beatDur;
      }
      // drums: kick on every beat, hat on off-beats
      let dt = loopStart;
      let beatCount = 0;
      while (dt < loopStart + loopDur - 0.001) {
        this.playDrum(dt, beatCount % 2 === 0 ? "kick" : "hat");
        this.playDrum(dt + beatDur / 2, "hat");
        dt += beatDur;
        beatCount++;
      }
    };

    scheduleLoop(cursor);
    const tick = () => {
      cursor += loopDur;
      scheduleLoop(cursor);
      this.timer = window.setTimeout(tick, loopDur * 1000 * 0.92);
    };
    this.timer = window.setTimeout(tick, loopDur * 1000 * 0.92);
  }

  stop() {
    this.playing = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }

  playFlap() {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playScore() {
    const ctx = this.ensureContext();
    [880, 1175].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  playHit() {
    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }
}

let singleton: ChiptuneEngine | null = null;
export function getChiptuneEngine() {
  if (!singleton) singleton = new ChiptuneEngine();
  return singleton;
}
