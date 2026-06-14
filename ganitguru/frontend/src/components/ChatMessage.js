"use client";
import { InlineMath, BlockMath } from "react-katex";

/**
 * Renders markdown-like text with LaTeX.
 * Supports:
 *   - $$...$$ → BlockMath
 *   - $...$ → InlineMath
 *   - **bold**
 *   - `code`
 *   - newlines → <br />
 */
function renderMath(text) {
  // Split on display math $$...$$
  const displayParts = text.split(/(\$\$[\s\S]*?\$\$)/g);
  return displayParts.flatMap((part, i) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const expr = part.slice(2, -2).trim();
      return [<BlockMath key={i} math={expr} />];
    }

    // Split on inline math $...$
    const inlineParts = part.split(/(\$[^$\n]+?\$)/g);
    return inlineParts.flatMap((s, j) => {
      if (s.startsWith("$") && s.endsWith("$") && s.length > 2) {
        const expr = s.slice(1, -1).trim();
        return [<InlineMath key={`${i}-${j}`} math={expr} />];
      }

      // Bold **...**
      const boldParts = s.split(/(\*\*[^*]+?\*\*)/g);
      return boldParts.flatMap((b, k) => {
        if (b.startsWith("**") && b.endsWith("**")) {
          return [<strong key={`${i}-${j}-${k}`}>{b.slice(2, -2)}</strong>];
        }
        // Code `...`
        const codeParts = b.split(/(`[^`]+?`)/g);
        return codeParts.flatMap((c, l) => {
          if (c.startsWith("`") && c.endsWith("`")) {
            return [<code key={`${i}-${j}-${k}-${l}`}>{c.slice(1, -1)}</code>];
          }
          // Newlines
          return c.split("\n").flatMap((line, m, arr) => {
            if (m === arr.length - 1) return [line];
            return [line, <br key={`br-${i}-${j}-${k}-${l}-${m}`} />];
          });
        });
      });
    });
  });
}

/**
 * Parse the raw model text:
 *  - Extract TOPIC: line → shown as a pill
 *  - Detect "Key Concept" section → styled box
 *  - Render the rest with LaTeX
 */
function parseModelText(raw) {
  const topicMatch = raw.match(/^TOPIC:\s*(.+)$/m);
  const topic = topicMatch ? topicMatch[1].trim() : null;

  // Remove TOPIC line from body
  let body = raw.replace(/^TOPIC:\s*.+\n?/m, "").trim();

  // Key concept box
  const kcMatch = body.match(/\*\*Key Concept[:\s]*\*\*([\s\S]+?)(?=\n\n|\n\*\*|$)/i);
  let keyConceptText = null;
  if (kcMatch) {
    keyConceptText = kcMatch[1].trim();
    body = body.replace(kcMatch[0], "").trim();
  }

  return { topic, body, keyConceptText };
}

export default function ChatMessage({ role, content, isStreaming }) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm
                        bg-saffron-500 text-white text-sm leading-relaxed shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  // Model message
  const { topic, body, keyConceptText } = parseModelText(content);

  return (
    <div className="flex gap-3 mb-6">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-saffron-100 dark:bg-saffron-900/40
                      flex items-center justify-center text-saffron-600 dark:text-saffron-400
                      text-xs font-display font-bold mt-0.5">
        π
      </div>

      <div className="flex-1 min-w-0">
        {/* Topic pill */}
        {topic && (
          <div className="mb-2">
            <span className="topic-pill">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              {topic}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="prose-math text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
          {renderMath(body)}
          {isStreaming && <span className="cursor" />}
        </div>

        {/* Key concept box */}
        {keyConceptText && (
          <div className="key-concept">
            <span className="font-semibold block mb-1">💡 Key Concept</span>
            {renderMath(keyConceptText)}
          </div>
        )}
      </div>
    </div>
  );
}
