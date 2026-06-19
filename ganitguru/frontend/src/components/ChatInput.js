"use client";
import { useState, useRef } from "react";

export default function ChatInput({ onSend, disabled, isLimitReached, onUpgradeClick }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }

  // Limit reached state — show upgrade prompt instead of input
  if (isLimitReached) {
    return (
      <div className="sticky bottom-0 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur
                      border-t border-stone-200 dark:border-stone-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3
                          p-4 rounded-2xl bg-gradient-to-r from-saffron-50 to-orange-50
                          dark:from-saffron-950/20 dark:to-orange-950/20
                          border-2 border-saffron-200 dark:border-saffron-800">
            <div>
              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                🔒 Aaj ki free limit khatam ho gayi
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Kal fir try karein, ya Pro upgrade karein for unlimited access
              </p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-saffron-500 to-orange-600
                         hover:from-saffron-600 hover:to-orange-700 text-white font-bold text-sm
                         rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Pro — ₹199/month
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur
                    border-t border-stone-200 dark:border-stone-800 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 flex items-end gap-2 bg-white dark:bg-stone-900
                        border border-stone-200 dark:border-stone-700 rounded-2xl
                        shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-saffron-400
                        transition-shadow">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type a maths question… (Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-stone-900 dark:text-stone-100
                       placeholder-stone-400 focus:outline-none leading-relaxed py-1"
            style={{ maxHeight: "160px" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                     bg-saffron-500 hover:bg-saffron-600 disabled:opacity-40
                     disabled:cursor-not-allowed text-white transition-all
                     active:scale-95 shadow-sm"
        >
          {disabled ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-stone-400 mt-2">
        GanitGuru can make mistakes. Verify important steps independently.
      </p>
    </div>
  );
}
