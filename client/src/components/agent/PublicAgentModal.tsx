import React, { useState } from "react";
import {
  Sparkles,
  Send,
  X,
  Lock,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Bot,
  User,
  RefreshCw
} from "lucide-react";
import { sendPublicAgentPrompt } from "../../services/api";

interface PublicAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export const PublicAgentModal: React.FC<PublicAgentModalProps> = ({
  isOpen,
  onClose,
  onLoginClick
}) => {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; isRestricted?: boolean }>>([
    {
      role: "assistant",
      text: "Hello! I am the **GSTSAHAYAK Assistant**. I can help you understand statutory GST concepts, HSN/SAC chapter classifications, pre-validation rules, and how our hybrid Explainable AI platform works."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg = { role: "user" as const, text: promptToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendPublicAgentPrompt(promptToSend);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: res.response,
          isRestricted: res.isPrivateRestricted
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having trouble connecting to the informational knowledge base right now. Please try again or log in to access the workspace."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is GST?",
    "What is HSN/SAC?",
    "What is GST pre-validation?",
    "How does anomaly detection work?",
    "Create an invoice for me"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#081324] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00A878] to-[#00E599] flex items-center justify-center text-[#07111F] font-black shadow-[0_0_20px_rgba(0,229,153,0.3)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  GSTSAHAYAK Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono text-[9px] font-bold">
                  Public Informational Mode
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                General GST knowledge & platform guide (Log in to execute actions)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-[#00A878]/10 border border-[#00A878]/30 flex items-center justify-center text-[#00A878] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed font-medium ${
                  m.role === "user"
                    ? "bg-white text-[#07111F] font-semibold"
                    : "bg-black/50 border border-white/10 text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {m.isRestricted && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-[#E67E22] font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      Requires Business Authentication
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onLoginClick();
                      }}
                      className="cred-btn-primary py-1.5 px-3 text-[10px]"
                    >
                      <span>Log in to Workspace</span>
                      <ArrowRight className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#00A878] font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Consulting statutory GST knowledge base...</span>
            </div>
          )}
        </div>

        {/* Sample questions */}
        <div className="px-5 py-2.5 border-t border-white/5 bg-black/20 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0">
            Ask:
          </span>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/5 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-white/10 bg-black/40 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about GST rules, HSN codes, or platform capabilities..."
            className="flex-1 px-4 py-3 bg-black/60 rounded-2xl border border-white/10 text-xs font-medium text-white focus:border-[#00E599] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-[#00E599] hover:bg-[#00c985] text-[#07111F] rounded-2xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,229,153,0.3)]"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </div>
    </div>
  );
};
