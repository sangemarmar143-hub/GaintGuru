"use client";
import { useState } from "react";

const FREE_FEATURES = [
  "10 messages per day",
  "Classes 6–12 NCERT support",
  "LaTeX maths rendering",
  "Hindi + English",
  "Chat history (session)",
];

const PRO_FEATURES = [
  "Unlimited messages",
  "Priority Gemini responses",
  "Full chat history saved",
  "Download solutions as PDF",
  "Early access to new features",
  "Cancel anytime",
];

export default function UpgradeModal({ open, onClose, onUpgrade, usage }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function handleUpgrade() {
    setLoading(true);
    try {
      await onUpgrade();
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl
                      border border-stone-200 dark:border-stone-700 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-saffron-500 to-orange-600 px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-amber-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="text-sm font-semibold text-amber-100 uppercase tracking-widest">GanitGuru Pro</span>
          </div>
          <h2 className="text-2xl font-display font-bold">Unlock Unlimited Learning</h2>
          <p className="text-sm text-orange-100 mt-1">
            {usage?.plan === "free" && usage?.usedToday >= (usage?.limit ?? 10)
              ? "Aapki aaj ki limit khatam ho gayi — Pro upgrade karein!"
              : "Aaj bhi, kal bhi — bina rok-tok ke padhte raho."}
          </p>
        </div>

        {done ? (
          /* Success state */
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center
                            justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              🎉 Welcome to Pro!
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6 text-sm">
              Ab aap unlimited sawalon ke jawab pa sakte hain. Maths mein koi bhi cheez rok nahi sakti!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl
                         font-semibold transition-colors"
            >
              Padhna shuru karo →
            </button>
          </div>
        ) : (
          /* Plans comparison */
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* Free plan */}
              <div className="rounded-xl border-2 border-stone-200 dark:border-stone-700 p-4">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Free</div>
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">₹0</div>
                <ul className="space-y-1.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                      <svg className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro plan */}
              <div className="rounded-xl border-2 border-saffron-400 dark:border-saffron-500 p-4
                              bg-saffron-50 dark:bg-saffron-900/10 relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-saffron-500 text-white text-[10px] font-bold px-2.5 py-0.5
                                   rounded-full uppercase tracking-widest whitespace-nowrap">
                    Recommended
                  </span>
                </div>
                <div className="text-xs font-bold text-saffron-600 dark:text-saffron-400 uppercase tracking-widest mb-2">Pro</div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">₹199</span>
                  <span className="text-xs text-stone-400">/month</span>
                </div>
                <ul className="space-y-1.5">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-stone-700 dark:text-stone-300">
                      <svg className="w-3.5 h-3.5 text-saffron-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Usage bar (if free) */}
            {usage?.plan === "free" && (
              <div className="mb-4 p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                  <span>Aaj ke messages</span>
                  <span className="font-semibold">{usage.usedToday ?? 0} / {usage.limit ?? 10}</span>
                </div>
                <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saffron-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((usage.usedToday ?? 0) / (usage.limit ?? 10)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-600
                         hover:from-saffron-600 hover:to-orange-700 text-white font-bold text-sm
                         transition-all shadow-lg hover:shadow-xl active:scale-[0.98]
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing…
                </span>
              ) : (
                "Pro mein Upgrade karein — ₹199/month"
              )}
            </button>

            <p className="text-center text-xs text-stone-400 mt-3">
              Demo mode — payment integration ke liye Razorpay/Stripe connect karein
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
