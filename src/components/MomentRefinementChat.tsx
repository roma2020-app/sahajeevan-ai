import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Check, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { DurationOption, LocationType, MomentActivity } from "../types";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  updatedActivity?: Partial<MomentActivity>;
  timestamp: string;
  applied?: boolean;
}

interface MomentRefinementChatProps {
  activity: MomentActivity;
  duration: DurationOption;
  childAge: string;
  locationType: LocationType;
  interest?: string;
  onApplyRefinement: (updated: Partial<MomentActivity>) => void;
}

export const MomentRefinementChat: React.FC<MomentRefinementChatProps> = ({
  activity,
  duration,
  childAge,
  locationType,
  interest,
  onApplyRefinement
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt chips for parents
  const suggestedPrompts = [
    "🌧️ Adapt for indoor / rainy weather",
    "⚡ Make it more active & energetic",
    "⏳ Shorten this to 5 minutes",
    "👶 Adapt for a younger toddler sibling",
    "🎨 What if we don't have paper or crayons?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    setError(null);
    setInputValue("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Construct multi-turn history from current messages
    const currentHistory = messages.map((m) => ({
      role: m.role,
      text: m.text
    }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/refine-moment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment: activity,
          userConfig: {
            duration,
            childAge,
            locationType,
            interest
          },
          history: currentHistory,
          message: messageText
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const modelMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: "model",
          text: data.reply || "I've adapted the activity for you.",
          updatedActivity: data.updatedActivity || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, modelMessage]);
      } else {
        throw new Error(data.error || "Could not get response from Gemini");
      }
    } catch (err: any) {
      console.error("Refinement chat error:", err);
      setError("Unable to get refinement. Please check connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (msgId: string, updated?: Partial<MomentActivity>) => {
    if (!updated) return;
    onApplyRefinement(updated);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
  };

  return (
    <div className="rounded-2xl border border-[#D4E3D8] bg-white shadow-xs overflow-hidden transition-all mb-6">
      {/* Accordion / Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between bg-[#F8FAF9] hover:bg-[#F2F7F4] transition-colors text-left cursor-pointer border-b border-[#E8EFEA]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E5A44] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm sm:text-base text-[#1E3A2B]">
                Refine & Adapt with Gemini
              </h4>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3EFE7] text-[#24523B]">
                Multi-Turn AI
              </span>
            </div>
            <p className="text-xs text-[#626A65] mt-0.5">
              Ask follow-up questions or adapt this moment for weather, siblings, or time.
            </p>
          </div>
        </div>

        <div className="text-[#626A65] p-1">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Preset Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-[#707A74] uppercase tracking-wider">
              Quick Suggestions:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F0F5F2] hover:text-[#2E5A44] text-[#4A4F4C] border border-[#E5E0D8] hover:border-[#C4D9CC] transition-all cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="min-h-[160px] max-h-[360px] overflow-y-auto space-y-3.5 pr-1 pt-2">
            {messages.length === 0 ? (
              <div className="py-6 text-center text-xs sm:text-sm text-[#707A74] space-y-2 bg-[#FAF8F4] rounded-xl border border-dashed border-[#E5E0D8] p-4">
                <p className="font-medium text-[#2E5A44]">
                  💡 Have a question or constraint about "{activity.title}"?
                </p>
                <p className="text-xs text-[#707A74] max-w-md mx-auto">
                  Type any request like <em>"We only have 5 minutes"</em> or click one of the quick suggestions above. Gemini will adapt the activity steps in real time!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <div className="w-7 h-7 rounded-lg bg-[#2E5A44] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                      msg.role === "user"
                        ? "bg-[#2E5A44] text-white rounded-tr-xs"
                        : "bg-[#F3F7F5] text-[#1E3A2B] border border-[#DCE8E0] rounded-tl-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* If Gemini proposed refined activity steps */}
                    {msg.updatedActivity && (
                      <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#C6DDD0] text-xs space-y-2 text-[#1E3A2B]">
                        <div className="flex items-center justify-between border-b border-[#E8EFEA] pb-1.5 font-bold text-[#2E5A44]">
                          <span>✨ Refined Activity Adaptation</span>
                          {msg.applied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#2E5A44] bg-[#E8F2EC] px-2 py-0.5 rounded-md font-medium">
                              <Check className="w-3 h-3" />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApply(msg.id, msg.updatedActivity)}
                              className="px-2.5 py-1 rounded-md bg-[#2E5A44] hover:bg-[#244736] text-white font-medium text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              Apply to Card
                            </button>
                          )}
                        </div>

                        {msg.updatedActivity.title && (
                          <div className="font-semibold text-xs">
                            {msg.updatedActivity.title}
                          </div>
                        )}

                        {msg.updatedActivity.steps && (
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#424A45]">
                            {msg.updatedActivity.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-right ${
                        msg.role === "user" ? "text-white/70" : "text-[#828C86]"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-[#5A564F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-[#525E57] pl-1">
                <div className="w-7 h-7 rounded-lg bg-[#2E5A44] text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F3F7F5] rounded-xl border border-[#DCE8E0]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2E5A44]" />
                  <span>Gemini is adapting your activity...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-2 border-t border-[#E8EFEA]"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Gemini to adapt steps, change timing, or answer questions..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D8D2C7] bg-[#FAF8F4] text-xs sm:text-sm text-[#1E3A2B] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/20 focus:border-[#2E5A44] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-[#2E5A44] hover:bg-[#244736] disabled:bg-[#D4CEBF] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
