"use client";
import { useState, useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(true); // Defaults to true (unmuted)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false); // Prevents multiple intervals from starting

  const melody = [
    523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25, 783.99, 880.0,
    783.99, 659.25, 523.25, 440.0, 523.25,
  ];

  const playNote = (freq: number, time: number, duration: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  };

  const startMusic = () => {
    if (hasStartedRef.current) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    // Resume context if it's suspended (browser autoplay policy)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    hasStartedRef.current = true;
    let time = audioCtxRef.current.currentTime + 0.1;
    let i = 0;

    intervalRef.current = setInterval(() => {
      const note = melody[i % melody.length];
      playNote(note, time, 0.2);
      time += 0.3;
      i++;
    }, 300);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      // Turn off
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      hasStartedRef.current = false;
      setIsPlaying(false);
    } else {
      // Turn on
      setIsPlaying(true);
      startMusic();
    }
  };

  useEffect(() => {
    // Browsers require a user interaction to start audio
    const handleFirstInteraction = () => {
      if (isPlaying) startMusic();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isPlaying]);

  return (
    <button
      onClick={toggleMusic}
      className="absolute top-4 right-4 z-50 bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-bold p-3 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-red-600"
    >
      {isPlaying ? "🔊" : "🔇"}
    </button>
  );
}
