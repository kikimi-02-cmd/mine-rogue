"use client";
import { useEffect } from "react";

interface Props {
  floor: number;
  onContinue: () => void;
}

export default function FloorClearScreen({ floor, onContinue }: Props) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1050);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-flash-green pointer-events-none overflow-hidden">
      <div className="relative animate-fade-in-out text-center">
        <span className="absolute left-1/2 top-1/2 h-44 w-44 rounded-full border-2 border-emerald-400/70 animate-clear-ring" />
        <span
          className="absolute left-1/2 top-1/2 h-44 w-44 rounded-full border border-emerald-300/50 animate-clear-ring"
          style={{ animationDelay: "0.12s" }}
        />
        <p className="relative text-xs font-black tracking-[0.45em] text-emerald-400">
          FLOOR CLEAR
        </p>
        <p className="relative mt-1 text-6xl font-black text-white drop-shadow-[0_0_22px_rgba(16,185,129,0.65)]">
          B{floor}F
        </p>
        <p className="relative mt-2 text-2xl">✨</p>
      </div>
    </div>
  );
}
