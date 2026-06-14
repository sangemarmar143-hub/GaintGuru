"use client";
import Logo from "./Logo";
import UsageBadge from "./UsageBadge";

const CLASSES = Array.from({ length: 7 }, (_, i) => i + 6); // 6–12

export default function Header({ classLevel, onClassChange, darkMode, onToggleDark, usage, onUpgradeClick }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3
                        bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b
                        border-stone-200 dark:border-stone-800">
      {/* Brand */}
      <Logo size={34} />
      <div className="flex flex-col leading-none">
        <span className="font-display font-bold text-lg text-saffron-600 dark:text-saffron-400 tracking-tight">
          GanitGuru
        </span>
        <span className="text-[10px] text-stone-400 uppercase tracking-widest">
          AI Maths Tutor
        </span>
      </div>

      <div className="flex-1" />

      {/* Usage badge */}
      <UsageBadge usage={usage} onUpgradeClick={onUpgradeClick} />

      {/* Class selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline">Class</span>
        <select
          value={classLevel}
          onChange={(e) => onClassChange(Number(e.target.value))}
          className="text-sm font-semibold rounded-lg px-3 py-1.5 border border-stone-200
                     dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800
                     dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-400
                     cursor-pointer"
          aria-label="Select class"
        >
          {CLASSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        aria-label="Toggle dark mode"
        className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
      >
        {darkMode ? (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM18 9a1 1 0 010 2h-1a1 1 0 110-2h1zm-1.78 5.78a1 1 0 01-1.42 0l-.7-.71a1 1 0 011.41-1.42l.71.71a1 1 0 010 1.42zM11 17a1 1 0 11-2 0v-1a1 1 0 112 0v1zm-5.78-1.78a1 1 0 010-1.42l.71-.7a1 1 0 111.42 1.41l-.71.71a1 1 0 01-1.42 0zM3 11a1 1 0 110-2h1a1 1 0 010 2H3zm1.78-6.22a1 1 0 011.42 0l.7.71A1 1 0 015.49 6.9l-.71-.71a1 1 0 010-1.41zM10 6a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
        ) : (
          <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        )}
      </button>
    </header>
  );
}
