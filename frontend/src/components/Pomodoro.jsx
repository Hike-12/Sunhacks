import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PomodoroDial({ showSettings, flipped, setFlipped }) {
  // -------------------- Settings (persisted) --------------------
  const defaultSettings = {
    focusMinutes: 25,
    breakMinutes: 5,
    autoSwitch: true,
    tickSound: false,
  };

  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("pomodoroSettings:v1");
      if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("pomodoroSettings:v1", JSON.stringify(settings));
  }, [settings]);

  // -------------------- Timer State --------------------
  const [mode, setMode] = useState("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [endAt, setEndAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(0);

  const modeDurationMs = useMemo(() => {
    const mins = mode === "focus" ? settings.focusMinutes : settings.breakMinutes;
    return Math.max(1, mins) * 60 * 1000;
  }, [mode, settings.focusMinutes, settings.breakMinutes]);

  useEffect(() => {
    if (!isRunning) setRemainingMs(modeDurationMs);
  }, [modeDurationMs, isRunning]);

  // -------------------- Interval Loop --------------------
  const intervalRef = useRef(null);
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    const startAt = Date.now();
    const target = endAt ?? startAt + remainingMs;
    setEndAt(target);

    const tick = () => {
      const now = Date.now();
      const rem = Math.max(0, target - now);
      setRemainingMs(rem);
      if (rem === 0) {
        chime();
        setIsRunning(false);
        setEndAt(null);
        if (settings.autoSwitch) {
          requestAnimationFrame(() => {
            const next = mode === "focus" ? "break" : "focus";
            setMode(next);
            setRemainingMs(next === "focus" ? settings.focusMinutes * 60 * 1000 : settings.breakMinutes * 60 * 1000);
            setTimeout(() => setIsRunning(true), 300);
          });
        }
      }
    };

    intervalRef.current = window.setInterval(tick, 250);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, endAt, settings.autoSwitch, settings.breakMinutes, settings.focusMinutes, mode]);

  // -------------------- Controls --------------------
  const start = () => {
    if (remainingMs <= 0) setRemainingMs(modeDurationMs);
    setIsRunning(true);
  };
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setEndAt(null);
    setRemainingMs(modeDurationMs);
  };
  const switchMode = (m) => {
    setIsRunning(false);
    setEndAt(null);
    setMode(m);
    setRemainingMs(m === "focus" ? settings.focusMinutes * 60 * 1000 : settings.breakMinutes * 60 * 1000);
  };

  // -------------------- Formatting --------------------
  const totalMs = modeDurationMs;
  const progress = 1 - remainingMs / totalMs;
  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const timeStr = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  const [wallClock, setWallClock] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setWallClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // -------------------- Sound --------------------
  const audioCtxRef = useRef(null);
  const chime = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.001;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
      o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  // -------------------- Dial Geometry --------------------
  const size = 260;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, c * progress);
  const gap = Math.max(0.0001, c - dash);

  // -------------------- Render --------------------
  // Only Settings Panel
  if (showSettings) {
    return (
      <div className="w-full h-full min-h-0 bg-neutral-900/60 rounded-2xl border border-neutral-800/60 shadow-xl flex flex-col p-6">
        <h2 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">Settings</h2>
        <div className="space-y-5 w-full flex-1 overflow-y-auto">
          <Field label="Focus length (minutes)">
            <NumberInput min={1} max={180} value={settings.focusMinutes} onChange={(v) => setSettings((s) => ({ ...s, focusMinutes: v }))} />
          </Field>
          <Field label="Break length (minutes)">
            <NumberInput min={1} max={60} value={settings.breakMinutes} onChange={(v) => setSettings((s) => ({ ...s, breakMinutes: v }))} />
          </Field>
          <ToggleRow label="Auto-switch phases" desc="Automatically jump Focus ↔ Break on finish." checked={settings.autoSwitch} onChange={(v) => setSettings((s) => ({ ...s, autoSwitch: v }))} />
          <div className="pt-2 flex gap-2 px-12">
            <button onClick={() => setSettings(defaultSettings)} className="px-3 py-2 rounded-xl text-sm bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">Reset settings</button>
            <button onClick={() => { if (mode === "focus") setRemainingMs(settings.focusMinutes * 60 * 1000); else setRemainingMs(settings.breakMinutes * 60 * 1000); }} className="px-3 py-2 rounded-xl text-sm bg-indigo-400 text-black hover:bg-purple-500">Apply now</button>
          </div>
          <div className="pt-4 text-xs text-neutral-500 leading-relaxed">
            Durations are saved locally. When you change them, click <span className="text-neutral-300">Apply now</span> to update the current timer.
          </div>
        </div>
        {/* Switch to Timer */}
        <button
          onClick={() => setFlipped(false)}
          className="mt-6 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-xs"
        >
          Back to Timer
        </button>
      </div>
    );
  }

  // Only Timer Dial
  return (
    <div className="w-full h-full min-h-0 bg-neutral-900/60 rounded-2xl border border-neutral-800/60 shadow-xl flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-purple-800/80 ring-4 ring-indigo-400/10" />
          <span className="text-sm tracking-wide uppercase text-neutral-400">Pomodoro</span>
        </div>
        {/* <div className="text-sm tabular-nums  text-neutral-400">{wallClock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div> */}
      </div>

      {/* Mode Switch */}
      <div className="flex items-center gap-2 mb-5">
        {(["focus", "break"]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={"px-4 py-2 rounded-xl text-sm font-medium transition border " + (mode === m ? "bg-white text-black border-white/10" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-700")}
          >
            {m === "focus" ? "Focus" : "Break"}
          </button>
        ))}
      </div>

      {/* Dial */}
      <div className="relative">
        <svg width={260} height={260} viewBox="0 0 260 260">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <circle cx={130} cy={130} r={116} stroke="rgba(255,255,255,0.08)" strokeWidth={14} fill="none" />
          <g transform="rotate(-90 130 130)">
            <circle
              cx={130}
              cy={130}
              r={116}
              stroke="url(#g)"
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={Math.max(0, 2 * Math.PI * 116 * (1 - remainingMs / (Math.max(1, mode === "focus" ? settings.focusMinutes : settings.breakMinutes) * 60 * 1000)) ) + " " + Math.max(0.0001, 2 * Math.PI * 116 - Math.max(0, 2 * Math.PI * 116 * (1 - remainingMs / (Math.max(1, mode === "focus" ? settings.focusMinutes : settings.breakMinutes) * 60 * 1000))))}
              fill="none"
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[56px] font-semibold tabular-nums select-none">{timeStr}</div>
          <div className="mt-2 text-xs tracking-widest uppercase text-neutral-400">{mode === "focus" ? "Focus" : "Break"} time</div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        {!isRunning ? (
          <button onClick={start} className="px-5 py-2.5 rounded-xl bg-indigo-500 text-black font-semibold hover:bg-indigo-400 transition">Start</button>
        ) : (
          <button onClick={pause} className="px-5 py-2.5 rounded-xl bg-indigo-400 text-black font-semibold hover:bg-purple-300 transition">Pause</button>
        )}
        <button onClick={reset} className="px-4 py-2.5 rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 transition">Reset</button>
      </div>

      {/* Switch to Settings */}
      <button
        onClick={() => setFlipped(true)}
        className="mt-6 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 hover:bg-neutral-700 text-xs"
      >
        Settings
      </button>
    </div>
  );
}

// -------------------- UI Subcomponents --------------------
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs text-neutral-400 uppercase tracking-wider">{label}</div>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min = 0, max = 999 }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onChange(Math.max(min, Math.min(max, value - 1)))} className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        className="w-24 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-sky-00/40"
      />
      <button onClick={() => onChange(Math.max(min, Math.min(max, value + 1)))} className="px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 hover:bg-neutral-700">+</button>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
      <div>
        <div className="text-sm text-neutral-200">{label}</div>
        {desc && <div className="text-xs text-neutral-500 mt-1">{desc}</div>}
      </div>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={(checked ? "bg-indigo-400" : "bg-neutral-700") + " relative inline-flex h-6 w-11 items-center rounded-full transition"}>
        <span className={(checked ? "translate-x-6 bg-black" : "translate-x-1 bg-white") + " inline-block h-4 w-4 transform rounded-full transition"} />
      </button>
    </div>
  );
}
