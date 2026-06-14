"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import UpgradeModal from "@/components/UpgradeModal";
import { createChat, fetchChats, deleteChat, streamMessage, fetchSubscription, upgradeToPro } from "@/lib/api";

const WELCOME = {
  role: "model",
  content: `TOPIC: Welcome to GanitGuru
Namaste! 🙏 I'm **GanitGuru**, your personal NCERT maths tutor.

I can help you with:
- **Step-by-step solutions** with full working shown
- **Formulas and proofs** rendered clearly with LaTeX
- Questions in **Hindi or English** — just ask!
- Topics from **Class 6 to Class 12** NCERT syllabus

Try asking something like:
- *Solve $x^2 - 5x + 6 = 0$*
- *Pythagoras theorem ka proof dikhao*
- *Area of a triangle with sides 3, 4, 5 cm*`,
};

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [classLevel, setClassLevel] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([WELCOME]);
  const [streaming, setStreaming] = useState(false);

  // Subscription state
  const [usage, setUsage] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [limitBanner, setLimitBanner] = useState(null); // error message when blocked

  const bottomRef = useRef(null);
  const initialized = useRef(false);

  // Dark mode
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(stored === "dark" || (!stored && prefersDark));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Load chats + subscription on mount
  useEffect(() => {
    fetchChats().then(setChats).catch(() => {});
    fetchSubscription().then(setUsage).catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNew = useCallback(async () => {
    try {
      const chat = await createChat(classLevel);
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([WELCOME]);
      setLimitBanner(null);
    } catch {
      setActiveChatId(null);
      setMessages([WELCOME]);
    }
  }, [classLevel]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      handleNew();
    }
  }, [handleNew]);

  async function handleSelectChat(id) {
    setActiveChatId(id);
    setMessages([WELCOME]);
    setLimitBanner(null);
    setSidebarOpen(false);
  }

  async function handleDeleteChat(id) {
    await deleteChat(id);
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([WELCOME]);
    }
  }

  async function handleSend(text) {
    if (streaming) return;
    setLimitBanner(null);

    let chatId = activeChatId;
    if (!chatId) {
      const chat = await createChat(classLevel);
      chatId = chat.id;
      setActiveChatId(chatId);
      setChats((prev) => [chat, ...prev]);
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);

    let accumulated = "";
    setMessages((prev) => [...prev, { role: "model", content: "", isStreaming: true }]);

    try {
      await streamMessage(
        chatId,
        text,
        classLevel,
        "auto",
        (token) => {
          accumulated += token;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "model", content: accumulated, isStreaming: true };
            return next;
          });
        },
        (_topic) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "model", content: accumulated, isStreaming: false };
            return next;
          });
          fetchChats().then(setChats).catch(() => {});
          // Refresh usage after each successful message
          fetchSubscription().then(setUsage).catch(() => {});
        },
        (usageData) => {
          // Live update from SSE usage event
          setUsage((prev) => ({ ...prev, ...usageData }));
        }
      );
    } catch (err) {
      if (err.code === "daily_limit_reached") {
        // Remove the empty placeholder
        setMessages((prev) => prev.slice(0, -2)); // remove user + empty model msg
        // Actually keep the user message, just remove empty model placeholder
        setMessages((prev) => {
          const next = [...prev];
          next.pop(); // remove empty streaming placeholder
          return next;
        });
        setLimitBanner(err.message);
        setShowUpgrade(true);
      } else {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "model",
            content: `TOPIC: Error\nSorry, something went wrong: ${err.message}. Please try again.`,
            isStreaming: false,
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  async function handleUpgrade() {
    await upgradeToPro();
    const status = await fetchSubscription();
    setUsage(status);
    setLimitBanner(null);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={handleSelectChat}
        onNew={handleNew}
        onDelete={handleDeleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <Header
          classLevel={classLevel}
          onClassChange={(c) => { setClassLevel(c); handleNew(); }}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          usage={usage}
          onUpgradeClick={() => setShowUpgrade(true)}
        />

        {/* Mobile hamburger */}
        <button
          className="lg:hidden fixed top-3.5 left-3 z-40 p-2 rounded-lg
                     bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5 text-stone-600 dark:text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Limit banner */}
        {limitBanner && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30
                          border border-red-200 dark:border-red-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {limitBanner}
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="shrink-0 px-3 py-1 bg-saffron-500 hover:bg-saffron-600 text-white
                         text-xs font-semibold rounded-lg transition-colors"
            >
              Upgrade karein
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={msg.isStreaming}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </main>

        <ChatInput
          onSend={handleSend}
          disabled={streaming || (usage?.plan === "free" && usage?.usedToday >= (usage?.limit ?? 10))}
          isLimitReached={usage?.plan === "free" && usage?.usedToday >= (usage?.limit ?? 10)}
          onUpgradeClick={() => setShowUpgrade(true)}
        />
      </div>

      {/* Upgrade modal */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={handleUpgrade}
        usage={usage}
      />
    </div>
  );
}
