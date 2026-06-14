"use client";

export default function Sidebar({ chats, activeChatId, onSelect, onNew, onDelete, open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative z-20 top-0 left-0 h-full w-72 flex flex-col
                    bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800
                    transition-transform duration-200
                    ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <span className="text-sm font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-widest">
            Chats
          </span>
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-saffron-500 hover:bg-saffron-600 text-white transition-colors"
            aria-label="New chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New
          </button>
        </div>

        {/* Chat list */}
        <ul className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {chats.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-stone-400 dark:text-stone-600">
              No chats yet.<br />Ask your first question!
            </li>
          )}
          {chats.map((chat) => (
            <li key={chat.id}>
              <button
                onClick={() => { onSelect(chat.id); onClose(); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg group flex items-start justify-between gap-2
                            transition-colors text-sm
                            ${activeChatId === chat.id
                              ? "bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-300"
                              : "hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                            }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{chat.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Class {chat.classLevel}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded
                             hover:text-red-500 text-stone-400 shrink-0"
                  aria-label="Delete chat"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-400">NCERT Classes 6–12</p>
        </div>
      </aside>
    </>
  );
}
