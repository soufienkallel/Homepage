import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

// ─── Configuration ────────────────────────────────────────────────
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || '/api/chat'; // served by api/chat in this deployment

function generateSessionId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Types ────────────────────────────────────────────────────────
/**
 * @typedef {{ role: 'user' | 'assistant'; content: string; }} Message
 */

// ─── ChatBubble (floating button) ─────────────────────────────────
function ChatBubble({ onClick, hasNewMessage }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ouvrir le chat MALLOULIAUTO"
      className="fixed bottom-[88px] lg:bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange text-white shadow-lg hover:bg-brand-orange-dark transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
    >
      <MessageCircle className="w-6 h-6" />
      {hasNewMessage && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// ─── Lightweight markdown renderer (no external deps) ────────────
function renderMarkdown(text) {
  if (!text) return null;

  // Split into paragraphs by double newline
  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, bi) => {
    const trimmed = block.trim();

    // Detect list blocks (lines starting with - or *)
    const lines = trimmed.split('\n');
    const isList = lines.every((l) => /^\s*[-*]\s/.test(l) || l.trim() === '');
    if (isList) {
      const items = lines.filter((l) => /^\s*[-*]\s/.test(l));
      return (
        <ul key={bi} className="list-disc pl-4 my-1 space-y-0.5">
          {items.map((item, ii) => (
            <li key={ii}>{renderInline(item.replace(/^\s*[-*]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p key={bi} className={bi > 0 ? 'mt-2' : ''}>
        {lines.map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text) {
  // Bold (**text** or __text__), then links [label](url)
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|__(.+?)__|\[([^\]]+)\]\((https?:\/\/[^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] || match[3]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2] || match[3]}
        </strong>
      );
    } else if (match[4] && match[5]) {
      // Link
      parts.push(
        <a
          key={match.index}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          {match[4]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// ─── ChatMessage ──────────────────────────────────────────────────
function ChatMessageItem({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-blue text-white rounded-br-md'
            : 'bg-brand-gray/30 text-brand-navy rounded-bl-md'
        }`}
      >
        {isUser ? message.content : renderMarkdown(message.content)}
      </div>
    </div>
  );
}

// ─── ChatPanel (main chat window) ─────────────────────────────────
function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour ! Je suis l'assistant MALLOULIAUTO. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(generateSessionId());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const userMessage = { role: 'user', content: text };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');
      setIsLoading(true);

      // Add placeholder for assistant response
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      try {
        const response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Erreur ${response.status}`);
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6);
              try {
                const data = JSON.parse(jsonStr);
                if (data.text) {
                  assistantText += data.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantText,
                    };
                    return updated;
                  });
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }
        }

        if (!assistantText) {
          throw new Error('Pas de réponse reçue');
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content:
              'Désolé, je rencontre un problème technique. Veuillez réessayer ou nous contacter directement sur mallouliauto.com.',
          };
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  return (
    <div className="fixed bottom-[88px] lg:bottom-6 right-6 z-50 flex flex-col w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-brand-gray/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-brand-navy text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Assistant MALLOULIAUTO</p>
            <p className="text-xs text-white/70">En ligne</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer le chat"
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <ChatMessageItem key={i} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start mb-3">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-brand-gray/30">
              <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={sendMessage}
        className="flex items-center gap-2 px-4 py-3 border-t border-brand-gray/30 bg-white"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          disabled={isLoading}
          maxLength={4000}
          className="flex-1 px-4 py-2.5 text-sm bg-brand-gray/10 border border-brand-gray/30 rounded-xl text-brand-navy placeholder-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Envoyer"
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// ─── ChatWidget (main export) ─────────────────────────────────────
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage] = useState(false);

  return (
    <>
      {isOpen ? (
        <ChatPanel onClose={() => setIsOpen(false)} />
      ) : (
        <ChatBubble onClick={() => setIsOpen(true)} hasNewMessage={hasNewMessage} />
      )}
    </>
  );
}
