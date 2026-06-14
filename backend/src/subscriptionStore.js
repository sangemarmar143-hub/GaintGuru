/**
 * Subscription & Rate-Limit Store
 *
 * Plans:
 *   free → 10 messages/day
 *   pro  → unlimited
 *
 * In production, replace with DB + JWT/session user IDs.
 * Current key: IP address (req.ip) — simple & requires no login.
 *
 * UPGRADING:
 *   - Add auth middleware, use userId as key instead of IP
 *   - Store plan in users table: users(id, email, plan, plan_expires_at)
 *   - Store daily counts in Redis with TTL = seconds until midnight
 */

const FREE_LIMIT = 10;

// Map<userId, { plan: "free"|"pro", usedToday: number, resetDate: string (YYYY-MM-DD) }>
const users = new Map();

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "2024-06-14"
}

function getOrCreate(userId) {
  if (!users.has(userId)) {
    users.set(userId, { plan: "free", usedToday: 0, resetDate: todayStr() });
  }
  const user = users.get(userId);
  // Reset count if it's a new day
  if (user.resetDate !== todayStr()) {
    user.usedToday = 0;
    user.resetDate = todayStr();
  }
  return user;
}

/**
 * Check if a user can send a message.
 * Returns { allowed: bool, plan, usedToday, limit, remaining }
 */
function checkLimit(userId) {
  const user = getOrCreate(userId);
  const limit = user.plan === "pro" ? Infinity : FREE_LIMIT;
  const remaining = user.plan === "pro" ? Infinity : Math.max(0, limit - user.usedToday);
  return {
    allowed: user.plan === "pro" || user.usedToday < FREE_LIMIT,
    plan: user.plan,
    usedToday: user.usedToday,
    limit: user.plan === "pro" ? null : FREE_LIMIT,
    remaining: user.plan === "pro" ? null : remaining,
  };
}

/** Increment message count after a successful send */
function recordMessage(userId) {
  const user = getOrCreate(userId);
  if (user.plan === "free") user.usedToday += 1;
}

/** Upgrade a user to Pro (call this after payment confirmation) */
function upgradeToPro(userId) {
  const user = getOrCreate(userId);
  user.plan = "pro";
  return user;
}

/** Downgrade back to free (for testing / subscription expiry) */
function downgradeToFree(userId) {
  const user = getOrCreate(userId);
  user.plan = "free";
  user.usedToday = 0;
  user.resetDate = todayStr();
  return user;
}

/** Get full user status */
function getStatus(userId) {
  const user = getOrCreate(userId);
  return { ...user, ...checkLimit(userId) };
}

module.exports = { checkLimit, recordMessage, upgradeToPro, downgradeToFree, getStatus };
