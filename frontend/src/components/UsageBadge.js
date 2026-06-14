"use client";

/**
 * Shows the daily usage counter for free users.
 * For Pro users shows a crown badge instead.
 */
export default function UsageBadge({ usage, onUpgradeClick }) {
  if (!usage) return null;

  if (usage.plan === "pro") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                      bg-gradient-to-r from-amber-400 to-orange-500
                      text-white text-xs font-semibold shadow-sm">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        Pro
      </div>
    );
  }

  const used = usage.usedToday ?? 0;
  const limit = usage.limit ?? 10;
  const remaining = limit - used;
  const pct = Math.min((used / limit) * 100, 100);
  const isLow = remaining <= 3;
  const isEmpty = remaining <= 0;

  return (
    <button
      onClick={onUpgradeClick}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
                  transition-all hover:shadow-md
                  ${isEmpty
                    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                    : isLow
                    ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400"
                    : "bg-stone-50 border-stone-200 text-stone-600 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-300"
                  }`}
      aria-label="View subscription"
    >
      {/* Progress ring */}
      <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.2"/>
        <circle
          cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={`${2 * Math.PI * 8}`}
          strokeDashoffset={`${2 * Math.PI * 8 * (1 - pct / 100)}`}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>

      <span>
        {isEmpty ? "Limit reached" : `${remaining} left`}
      </span>

      {/* Upgrade nudge */}
      <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                        bg-saffron-500 text-white group-hover:bg-saffron-600 transition-colors`}>
        Upgrade
      </span>
    </button>
  );
}
