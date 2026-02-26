"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUESTIONS = [
  "How do I create a circle?",
  "What is the Slider tool?",
  "How do I reflect an object?",
  "How can I create a tangent line?",
  "What commands work with lists?",
  "How do I use the Spreadsheet View?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              assistantText += parsed.text;
              setMessages([
                ...newMessages,
                { role: "assistant", content: assistantText },
              ]);
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6557d2] to-[#4285f4] text-white px-4 py-3 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl font-bold">
            G
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">GeoGebra Assistant</h1>
            <p className="text-sm text-white/80">Ask me about tools, commands & features</p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {showWelcome && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#6557d2] to-[#4285f4] rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                G
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Welcome to GeoGebra Assistant
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                I can help you find the right tools and commands in GeoGebra Calculator Suite. Ask me anything!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#6557d2] hover:bg-[#ededfc] transition-colors text-sm text-gray-700 hover:text-[#6557d2]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#6557d2] text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                } ${
                  msg.role === "assistant" && isLoading && i === messages.length - 1
                    ? "streaming-cursor"
                    : ""
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-[#6557d2] prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-li:my-0.5 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[#6557d2] prose-code:before:content-none prose-code:after:content-none prose-table:text-sm prose-hr:my-3">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <footer className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about GeoGebra tools, commands, or features..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-[15px] focus:outline-none focus:border-[#6557d2] focus:ring-2 focus:ring-[#6557d2]/20 placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-[#6557d2] text-white rounded-xl px-5 py-3 font-medium text-[15px] hover:bg-[#5446c1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2 max-w-3xl mx-auto">
          Answers are based on the official GeoGebra Manual. For the full documentation, visit{" "}
          <a
            href="https://geogebra.github.io/docs/manual/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6557d2] hover:underline"
          >
            geogebra.github.io/docs
          </a>
        </p>
      </footer>
    </div>
  );
}
