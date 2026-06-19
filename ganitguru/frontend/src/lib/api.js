const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Simple persistent user ID (no auth needed — stored in localStorage)
function getUserId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("gg_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("gg_user_id", id);
  }
  return id;
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-id": getUserId(),
  };
}

export async function createChat(classLevel = 10) {
  const res = await fetch(`${BASE}/api/chats`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ classLevel }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function fetchChats() {
  const res = await fetch(`${BASE}/api/chats`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function deleteChat(id) {
  await fetch(`${BASE}/api/chats/${id}`, { method: "DELETE", headers: authHeaders() });
}

/** Fetch current subscription status */
export async function fetchSubscription() {
  const res = await fetch(`${BASE}/api/subscription`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch subscription");
  return res.json();
}

/** Upgrade current user to Pro (call after payment) */
export async function upgradeToPro() {
  const res = await fetch(`${BASE}/api/subscription/upgrade`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Upgrade failed");
  return res.json();
}

/** Dev only: downgrade back to free */
export async function downgradeToFree() {
  const res = await fetch(`${BASE}/api/subscription/downgrade`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Downgrade failed");
  return res.json();
}

/**
 * Stream a message to the backend.
 * Calls onUsage({ plan, usedToday, limit, remaining }) when usage arrives.
 */
export async function streamMessage(
  chatId,
  message,
  classLevel,
  language,
  onToken,
  onDone,
  onUsage
) {
  const res = await fetch(`${BASE}/api/chat/${chatId}/stream`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message, classLevel, language }),
  });

  if (res.status === 429) {
    const data = await res.json();
    throw Object.assign(new Error(data.message || "Limit reached"), {
      code: "daily_limit_reached",
      ...data,
    });
  }

  if (!res.ok) throw new Error(`Server error ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop();

    for (const part of parts) {
      const line = part.replace(/^data: /, "").trim();
      if (!line) continue;
      try {
        const json = JSON.parse(line);
        if (json.usage && onUsage) onUsage(json.usage);
        if (json.token) onToken(json.token);
        if (json.done) onDone(json.topic ?? null, json.chatId);
        if (json.error) throw new Error(json.error);
      } catch (e) {
        if (e.message !== "Unexpected token") throw e;
      }
    }
  }
}
