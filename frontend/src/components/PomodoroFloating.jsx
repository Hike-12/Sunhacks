import React, { useState } from "react";
import PomodoroDial from "./Pomodoro";

export default function PomodoroFloating() {
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  return (
    <>
      {/* Floating Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-6 right-6 bg-indigo-500 hover:bg-blue-700 text-black rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-all"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}
        aria-label="Open Pomodoro Timer"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Overlay & Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-[380px] h-[560px] md:rounded-2xl overflow-visible">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close Pomodoro"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {/* Flip Card */}
            <div className="perspective-1000 w-full h-full">
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  flipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* Front: Pomodoro Dial */}
                <div className="absolute w-full h-full [backface-visibility:hidden] bg-neutral-950 md:rounded-2xl shadow-2xl border border-neutral-800 flex flex-col">
                  <PomodoroDial showSettings={false} flipped={flipped} setFlipped={setFlipped} />
                </div>
                {/* Back: Settings */}
                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-neutral-950 md:rounded-2xl shadow-2xl border border-neutral-800 flex flex-col">
                  <PomodoroDial showSettings={true} flipped={flipped} setFlipped={setFlipped} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Flip card CSS */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </>
  );
}