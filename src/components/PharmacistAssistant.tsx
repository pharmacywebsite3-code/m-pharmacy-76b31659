import { useState, useRef, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Mic, Sparkles } from "lucide-react";
import { askPharmacist, type ChatMessage } from "@/lib/pharmacist-chat.functions";
import { cn } from "@/lib/utils";

type UIMessage = ChatMessage & { id: string };

const PLACEHOLDER = "Ask me anything about your medications... / ስለ መድሃኒትዎ ማንኛውንም ነገር ይጠይቁኝ...";

// Simulated voice samples cycled when the mic is "listening"
const VOICE_SAMPLES = [
  "What is paracetamol used for and what's a safe adult dose?",
  "Can I take ibuprofen with aspirin?",
  "የቫይታሚን ሲ ጥቅም ምንድነው?",
  "How do I upload my prescription on M-Pharmacy?",
];

export function PharmacistAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi, I'm your M-Pharmacy AI Pharmacist. Ask me about medications, dosages, or our services — in English or Amharic.\n\nሰላም! በእንግሊዝኛ ወይም በአማርኛ ስለ መድሃኒት ይጠይቁኝ።",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const ask = useServerFn(askPharmacist);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const userMsg: UIMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const nextHistory = [...messages, userMsg];
      setMessages(nextHistory);
      setInput("");
      setLoading(true);
      try {
        const { reply } = await ask({
          data: {
            messages: nextHistory
              .filter((m) => m.role !== "system")
              .map(({ role, content }) => ({ role, content })),
          },
        });
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply || "…" },
        ]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ ${e instanceof Error ? e.message : "Something went wrong."}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [ask, loading, messages],
  );

  const startListening = useCallback(() => {
    if (loading || listening) return;
    setListening(true);
    // Simulate voice capture: pulse for ~2.2s then drop a sample query into the input
    listenTimer.current = setTimeout(() => {
      const sample = VOICE_SAMPLES[Math.floor(Math.random() * VOICE_SAMPLES.length)];
      setListening(false);
      setInput(sample);
      inputRef.current?.focus();
    }, 2200);
  }, [loading, listening]);

  const stopListening = useCallback(() => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    setListening(false);
  }, []);

  useEffect(() => () => stopListening(), [stopListening]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Pharmacist Assistant"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center",
          "bg-gradient-to-br from-teal-500 to-emerald-600 text-white",
          "hover:scale-105 active:scale-95 transition-transform",
          "ring-4 ring-teal-500/20",
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed z-50 bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4",
            "bottom-24 right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[calc(100vh-7rem)] rounded-3xl",
          )}
          role="dialog"
          aria-label="AI Pharmacist Assistant chat"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] leading-tight">AI Pharmacist</div>
              <div className="text-xs text-teal-50/90 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Online · English & አማርኛ
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="h-8 w-8 rounded-full hover:bg-white/15 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-teal-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listening overlay */}
          {listening && (
            <div className="px-4 py-3 bg-teal-50 border-t border-teal-100 flex items-center gap-3">
              <div className="flex items-end gap-1 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1 bg-teal-600 rounded-full animate-pulse"
                    style={{
                      height: `${30 + (i % 3) * 25}%`,
                      animation: `soundwave 0.9s ease-in-out ${i * 0.12}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-sm text-teal-800 font-medium">Listening… / በማዳመጥ ላይ…</span>
              <button
                onClick={stopListening}
                className="ml-auto text-xs text-teal-700 hover:underline"
              >
                Cancel
              </button>
              <style>{`@keyframes soundwave { 0%,100% { height: 20%; } 50% { height: 100%; } }`}</style>
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              aria-label={listening ? "Stop listening" : "Start voice input"}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={PLACEHOLDER}
              disabled={loading}
              className="flex-1 h-10 px-3 rounded-full bg-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-teal-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
