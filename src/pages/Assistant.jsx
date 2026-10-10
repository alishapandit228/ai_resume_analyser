import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { PageHeader, EmptyState } from "../components/Common.jsx";
import { useApp } from "../context/AppContext.jsx";
import { sendChatMessage } from "../api/client.js";

const SUGGESTIONS = [
  "How can I improve my projects section?",
  "Which skills should I learn for this role?",
  "What skills am I missing?",
  "Why does Docker matter for this job?",
];

export default function Assistant() {
  const { resume, job } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const message = text ?? input;
    if (!message.trim() || !resume) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const res = await sendChatMessage(resume.id, job?.id, message);
      setMessages((m) => [...m, { role: "assistant", text: res.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `Sorry — ${e.message}` }]);
    } finally {
      setSending(false);
    }
  };

  if (!resume) {
    return (
      <div>
        <PageHeader title="AI Assistant" />
        <EmptyState
          icon={MessageCircle}
          title="Upload a resume to chat"
          subtitle="The assistant answers using your resume (and job description, if selected) as context — nothing is invented."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="AI Career Assistant" subtitle={`Context: ${resume.label}${job ? ` · ${job.title}` : ""}`} />
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs border border-line rounded-full px-3 py-1.5 text-muted hover:border-brand hover:text-brand">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              m.role === "user" ? "bg-brand text-white" : "bg-white border border-line text-ink"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-muted">Thinking...</p>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-line bg-white px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your resume, skills, or this job..."
            className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <button onClick={() => send()} disabled={sending} className="btn-primary px-4">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
