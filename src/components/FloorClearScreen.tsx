"use client";
import { useEffect } from "react";

interface Props {
  floor: number;
  onContinue: () => void;
}

export default function FloorClearScreen({ floor, onContinue }: Props) {
  useEffect(() => {
    const t = setTimeout(onContinue, 1700);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-flash-green pointer-events-none">
      <div className="animate-fade-in-out text-center">
        <p className="text-5xl font-black text-[#10B981] tracking-widest drop-shadow-lg">
          B{floor}F
        </p>
        <p className="text-3xl font-black text-white tracking-[0.3em] mt-1 drop-shadow-lg">
          CLEAR!
        </p>
      </div>
    </div>
  );
}
