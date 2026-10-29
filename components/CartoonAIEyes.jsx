"use client";

import React, { useState, useEffect } from "react";

export default function CartoonAIEyes({ size = "md", isThinking = false, isExcited = false, isTalking = false }) {
  const [blink, setBlink] = useState(false);
  const [lookDirection, setLookDirection] = useState("center"); // 'center' | 'left' | 'right' | 'up'

  // Natural blinking interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Curious looking around interval
  useEffect(() => {
    if (isThinking) {
      // Rapid looking when thinking
      const thinkInterval = setInterval(() => {
        const dirs = ["left", "right", "up", "center"];
        setLookDirection(dirs[Math.floor(Math.random() * dirs.length)]);
      }, 500);
      return () => clearInterval(thinkInterval);
    }

    const lookInterval = setInterval(() => {
      const dirs = ["center", "center", "left", "right", "up"];
      setLookDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 2800);

    return () => clearInterval(lookInterval);
  }, [isThinking]);

  // Dimension scaling
  const dim = {
    sm: { container: "w-8 h-8", eye: "w-3 h-3.5", pupil: "w-1.5 h-1.5", gap: "gap-1", mouth: "w-2 h-1" },
    md: { container: "w-11 h-11", eye: "w-4 h-5", pupil: "w-2.5 h-2.5", gap: "gap-1.5", mouth: "w-3 h-1.5" },
    lg: { container: "w-14 h-14", eye: "w-5 h-6", pupil: "w-3 h-3", gap: "gap-2", mouth: "w-4 h-2" },
    xl: { container: "w-24 h-24", eye: "w-8 h-10", pupil: "w-5 h-5", gap: "gap-3", mouth: "w-6 h-3" },
    "2xl": { container: "w-32 h-32", eye: "w-10 h-13", pupil: "w-6 h-6", gap: "gap-4", mouth: "w-8 h-4" },
  }[size] || { container: "w-11 h-11", eye: "w-4 h-5", pupil: "w-2.5 h-2.5", gap: "gap-1.5", mouth: "w-3 h-1.5" };

  // Pupil translation based on look direction
  const pupilTransform = {
    center: "translate-x-0 translate-y-0",
    left: "-translate-x-1 translate-y-0",
    right: "translate-x-1 translate-y-0",
    up: "translate-x-0 -translate-y-1",
  }[lookDirection];

  return (
    <div className={`relative ${dim.container} rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center select-none transition-transform duration-300 hover:scale-110 active:scale-95 animate-[float_3s_ease-in-out_infinite]`}>
      {/* Outer Glow Halo */}
      <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md animate-pulse pointer-events-none" />

      {/* Face Base */}
      <div className={`relative w-full h-full rounded-full bg-slate-950 flex items-center justify-center ${dim.gap} px-1.5 overflow-hidden`}>
        {/* Left Eye */}
        <div 
          className={`relative ${dim.eye} bg-white rounded-full flex items-center justify-center shadow-inner transition-all duration-150 overflow-hidden ${
            blink ? "scale-y-[0.08]" : isExcited ? "scale-105" : "scale-100"
          }`}
        >
          {/* Pupil */}
          <div 
            className={`relative ${dim.pupil} rounded-full bg-slate-900 transition-transform duration-300 ease-out flex items-center justify-center ${pupilTransform}`}
          >
            {/* Catchlight sparkle dot */}
            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white opacity-90 pointer-events-none" />
            <span className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white/70 pointer-events-none" />
          </div>
        </div>

        {/* Right Eye */}
        <div 
          className={`relative ${dim.eye} bg-white rounded-full flex items-center justify-center shadow-inner transition-all duration-150 overflow-hidden ${
            blink ? "scale-y-[0.08]" : isExcited ? "scale-105" : "scale-100"
          }`}
        >
          {/* Pupil */}
          <div 
            className={`relative ${dim.pupil} rounded-full bg-slate-900 transition-transform duration-300 ease-out flex items-center justify-center ${pupilTransform}`}
          >
            {/* Catchlight sparkle dot */}
            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-white opacity-90 pointer-events-none" />
            <span className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white/70 pointer-events-none" />
          </div>
        </div>

        {/* Happy Cheek Blush dots */}
        <div className="absolute bottom-1 left-2 w-1.5 h-0.5 rounded-full bg-pink-500/40 blur-[0.5px]" />
        <div className="absolute bottom-1 right-2 w-1.5 h-0.5 rounded-full bg-pink-500/40 blur-[0.5px]" />

        {/* Talking Mouth */}
        {isTalking && (
          <div className="absolute bottom-1.5 w-3 h-1.5 rounded-full bg-emerald-400 animate-pulse transition-all" />
        )}
      </div>
    </div>
  );
}
