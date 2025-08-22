import React, { useState } from "react";
import PomodoroDial from "./Pomodoro";

export default function PomodoroFloating() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Icon Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-6 right-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-all"
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
          <div className="relative w-full max-w-lg mx-auto mb-0 md:mb-0 md:mt-0 md:rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Close Pomodoro"
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="bg-neutral-950 md:rounded-2xl shadow-2xl border border-neutral-800">
              <PomodoroDial />
            </div>
          </div>
        </div>
      )}
    </>
  );
}