import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Plus,
  ArrowRight,
  RefreshCw,
  Upload,
  UserCheck,
  Package,
  ShieldCheck,
  Zap,
  Bot,
  User,
  Paperclip,
  Check,
  HelpCircle,
  Clock,
  ChevronRight,
  Trash2
} from "lucide-react";
import { sendAuthenticatedAgentCommand } from "../../services/api";

interface AuthenticatedAgentWorkspaceProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onSyncWorkspaceState?: (state: any) => void;
}

export const AuthenticatedAgentWorkspace: React.FC<AuthenticatedAgentWorkspaceProps> = ({
  currentTab,
  onNavigateTab,
  onSyncWorkspaceState
}) => {
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: "user" | "agent";
    text: string;
    actionTimeline?: Array<{ step: number; title: string; status: string; detail: string }>;
    confirmationPrompt?: any;
    toolUsed?: string;
    timestamp?: string;
  }>>([
    {
      id: "init",
      role: "agent",
      text: "Welcome to your dedicated **GST Assistant & Copilot**.\n\nYou can issue commands in natural English — such as *“Create an invoice for Rahul Enterprises for 5 ASUS TUF A16 laptops at ₹75,000 each”* or *“Scan catalogue for missing HSN codes”* — and I will execute the business tool pipeline directly across your authenticated workspace.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleExecuteCommand = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMessageId = Date.now().toString();
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: userMessageId, role: "user" as const, text: promptToSend, timestamp: timeNow };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAuthenticatedAgentCommand(promptToSend, { currentTab });
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          text: res.message,
          actionTimeline: res.actionTimeline,
          confirmationPrompt: res.confirmationPrompt,
          toolUsed: res.toolUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Synchronize workspace UI if returned
      if (res.updatedWorkspace) {
        if (res.updatedWorkspace.targetTab) {
          onNavigateTab(res.updatedWorkspace.targetTab);
        }
        if (onSyncWorkspaceState) {
          onSyncWorkspaceState(res.updatedWorkspace);
        }
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          text: "An error occurred while executing the tool command on your GST workspace. Please verify your permissions and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSim = () => {
    handleExecuteCommand("Process and import uploaded invoice manifest document.");
  };

  const clearChat = () => {
    setMessages([
      {
        id: "init",
        role: "agent",
        text: "Workspace conversation history cleared. How can I assist you with your GST compliance today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const quickPrompts = [
    "Create an invoice for Rahul Enterprises for 5 ASUS TUF A16 laptops at ₹75,000 each.",
    "Show invoices that need compliance review.",
    "Add ASUS TUF A16 Gaming Laptop to my product catalogue with 18% GST.",
    "Import bulk product manifest from Excel file.",
    "Run statutory GST validation scan on my last 10 invoices."
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="cred-card p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00A878] to-[#00E599] flex items-center justify-center text-[#07111F] font-black shadow-[0_0_25px_rgba(0,229,153,0.35)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                AI Agent Workspace
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Natural language command execution across your invoices, product catalog, and statutory GST rules.
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Suggested Command Chips */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block px-1">
          Quick Execution Shortcuts
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleExecuteCommand(prompt)}
              className="text-xs font-medium px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer text-left flex items-center gap-2"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log Container */}
      <div className="cred-card rounded-3xl border border-white/10 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 sm:p-6 flex-1 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "agent" && (
                <div className="w-9 h-9 rounded-2xl bg-[#00A878]/15 border border-[#00A878]/30 flex items-center justify-center text-[#00E599] shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2.5 max-w-2xl ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-[#00A878] to-[#00E599] text-[#07111F] font-semibold rounded-tr-sm ml-auto"
                      : "bg-black/50 border border-white/10 text-zinc-200 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Action Timeline execution cards */}
                {m.actionTimeline && m.actionTimeline.length > 0 && (
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 w-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                      Tool Activity Pipeline:
                    </span>
                    <div className="space-y-2">
                      {m.actionTimeline.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-3 text-xs">
                          <div className="w-5 h-5 rounded-full bg-[#00E599]/20 border border-[#00E599]/40 flex items-center justify-center text-[#00E599] shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{step.title}</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Confirmation Box */}
                {m.confirmationPrompt && (
                  <div className="p-4 rounded-2xl bg-[#0C182B] border border-[#00E599]/40 space-y-3 w-full">
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      {m.confirmationPrompt.title}
                    </p>
                    <p className="text-xs text-zinc-300">{m.confirmationPrompt.message}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.confirmationPrompt.actions.map((act: any, aIdx: number) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            if (act.action === "FINALIZE_INVOICE" || act.action === "IMPORT_VERIFIED") {
                              handleExecuteCommand(`Confirm: ${act.label}`);
                            } else {
                              onNavigateTab("create-invoice");
                            }
                          }}
                          className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            act.type === "primary"
                              ? "bg-[#00E599] text-[#07111F] shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:scale-105"
                              : act.type === "review"
                              ? "bg-[#E67E22]/20 text-[#E67E22] border border-[#E67E22]/40 hover:bg-[#E67E22]/30"
                              : "bg-white/10 text-zinc-300 hover:bg-white/20"
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {m.timestamp && (
                  <span className="text-[10px] text-zinc-500 font-mono block px-1">
                    {m.timestamp}
                  </span>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-[#00E599] font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing workspace tool pipeline & CBIC validation...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand();
          }}
          className="p-4 border-t border-white/10 bg-black/40 flex items-center gap-3"
        >
          <button
            type="button"
            onClick={handleFileUploadSim}
            title="Upload CSV / Invoices for Batch Processing"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your instruction: e.g. Create an invoice for Rahul Enterprises for 5 laptops..."
            className="flex-1 px-4 py-3 bg-black/80 rounded-2xl border border-white/10 text-xs font-medium text-white focus:border-[#00E599] focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-[#00A878] to-[#00E599] text-[#07111F] font-black uppercase text-xs tracking-wider rounded-2xl transition-all hover:scale-105 disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(0,229,153,0.3)] flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </form>
      </div>
    </div>
  );
};
