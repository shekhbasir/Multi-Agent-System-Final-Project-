import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Bot,
  X,
  Trash2,
  Send,
  Lightbulb,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import opportunityApi from "../../config/opportunityApi";

const OpportunityAssistant = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const prefersReducedMotion = useReducedMotion();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [messages, loading, prefersReducedMotion]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [question]);

  const ask = async () => {
    const q = question.trim();

    if (!q || loading) return;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: q,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await opportunityApi.post(
        "/assistant",
        {
          question: q,
        },
        {
          timeout: 30000,
        },
      );

      const answer = response?.data?.answer;

      if (!answer) {
        throw new Error("AI returned an empty response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: answer,
        },
      ]);
    } catch (error) {
      let errorMessage = "Sorry, I couldn't process that right now.";

      // Backend returned an error
      if (error?.response) {
        const status = error.response.status;

        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.details;

        if (backendMessage) {
          errorMessage = backendMessage;
        } else if (status === 401) {
          errorMessage = "Your session has expired. Please login again.";
        } else if (status === 403) {
          errorMessage = "You are not authorized to use the AI assistant.";
        } else if (status === 429) {
          errorMessage =
            "AI service rate limit reached. Please try again in a moment.";
        } else if (status >= 500) {
          errorMessage = "AI server error. Please check your backend terminal.";
        } else {
          errorMessage = `AI request failed with status ${status}.`;
        }
      }

      // Request was sent but no response came back
      else if (error?.request) {
        errorMessage =
          "Could not reach the backend server. Make sure your backend is running on port 7000.";
      }

      // Axios / JavaScript error
      else if (error?.message) {
        errorMessage = error.message;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask();
    }
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
  };

  const closeAssistant = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (error) {
      // clipboard unavailable — fail silently, non-critical feature
    }
  };

  const suggestedQuestions = [
    "Find me remote React jobs",
    "Find me remote internships",
    "Show me hackathons",
    "Which opportunities should I apply to first?",
  ];

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            whileHover={
              prefersReducedMotion ? undefined : { scale: 1.04, y: -2 }
            }
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-2xl shadow-black/30 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <span className="relative flex h-2 w-2">
              {!prefersReducedMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            TalkSphere AI ⭐
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[calc(100vh-48px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl shadow-black/40 sm:w-[380px]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/20 text-blue-300">
                  <Bot className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Opportunity Assistant
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/40">
                    AI-powered opportunity By Developer{" "}
                    <span className="text-red-500">Er Basir Shekh</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={clearChat}
                    disabled={loading}
                    aria-label="Clear chat"
                    whileHover={
                      prefersReducedMotion || loading
                        ? undefined
                        : { scale: 1.08 }
                    }
                    whileTap={
                      prefersReducedMotion || loading
                        ? undefined
                        : { scale: 0.92 }
                    }
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  onClick={closeAssistant}
                  disabled={loading}
                  aria-label="Close AI assistant"
                  whileHover={
                    prefersReducedMotion || loading
                      ? undefined
                      : { scale: 1.08 }
                  }
                  whileTap={
                    prefersReducedMotion || loading
                      ? undefined
                      : { scale: 0.92 }
                  }
                  className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </motion.button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              {/* EMPTY STATE */}
              {messages.length === 0 && (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mb-5 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400/15 to-violet-400/15">
                      <Bot className="h-6 w-6 text-blue-300" strokeWidth={2} />
                    </div>
                    <h3 className="font-medium text-white">How can I help?</h3>
                    <p className="mt-1 text-xs text-white/40">
                      Ask me about opportunities available in your platform.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {suggestedQuestions.map((suggestion, i) => (
                      <motion.button
                        key={suggestion}
                        type="button"
                        disabled={loading}
                        onClick={() => setQuestion(suggestion)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                        whileHover={
                          prefersReducedMotion ? undefined : { y: -1 }
                        }
                        className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Lightbulb
                          className="h-3.5 w-3.5 shrink-0 text-white/30"
                          strokeWidth={2}
                        />
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAT MESSAGES */}
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const isError = message.role === "error";

                return (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className={`group flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isError
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white/10 text-blue-300"
                        }`}
                      >
                        {isError ? (
                          <AlertTriangle className="h-3 w-3" strokeWidth={2} />
                        ) : (
                          <Bot className="h-3 w-3" strokeWidth={2} />
                        )}
                      </div>
                    )}

                    <div
                      className={`relative max-w-[80%] whitespace-pre-wrap break-words rounded-xl px-3 py-2.5 leading-relaxed ${
                        isUser
                          ? "bg-white text-black"
                          : isError
                            ? "border border-red-500/20 bg-red-500/10 text-red-300"
                            : "bg-white/10 text-white/90"
                      }`}
                    >
                      {isError && (
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-red-400">
                          AI Error
                        </div>
                      )}

                      {message.text}

                      {!isUser && !isError && (
                        <button
                          type="button"
                          onClick={() => handleCopy(message.text, index)}
                          aria-label="Copy response"
                          className="absolute -bottom-2 -right-2 rounded-md border border-white/10 bg-[#0d1424] p-1 text-white/40 opacity-0 shadow-sm transition-all hover:text-white/80 group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          {copiedIndex === index ? (
                            <Check
                              className="h-3 w-3 text-green-400"
                              strokeWidth={2}
                            />
                          ) : (
                            <Copy className="h-3 w-3" strokeWidth={2} />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* THINKING */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start gap-2"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-300">
                    <Bot className="h-3 w-3" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-white/50"
                        animate={
                          prefersReducedMotion
                            ? { opacity: [0.4, 1, 0.4] }
                            : { y: [0, -4, 0] }
                        }
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 bg-white/[0.02] p-3">
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about opportunities..."
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/25 disabled:opacity-50"
                />

                <motion.button
                  type="button"
                  onClick={ask}
                  disabled={!question.trim() || loading}
                  whileHover={
                    prefersReducedMotion || !question.trim() || loading
                      ? undefined
                      : { scale: 1.05 }
                  }
                  whileTap={
                    prefersReducedMotion || !question.trim() || loading
                      ? undefined
                      : { scale: 0.95 }
                  }
                  className="flex shrink-0 items-center justify-center gap-1.5 self-end rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" strokeWidth={2} />
                  Send
                </motion.button>
              </div>

              <p className="mt-2 text-center text-[10px] text-white/25">
                Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OpportunityAssistant;
