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

function GeoGebraLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 261 40" className={className} aria-label="GeoGebra">
      <path fillRule="evenodd" clipRule="evenodd" d="M260.3 37V10.7H257V15.5C255.7 13.7 254.1 12.3 252.4 11.4C250.6 10.5 248.7 10 246.5 10C242.8 10 239.6 11.3 236.9 14C234.2 16.7 232.9 19.9 232.9 23.7C232.9 27.6 234.3 30.9 236.9 33.6C239.5 36.3 242.7 37.7 246.4 37.7C248.5 37.7 250.4 37.3 252.2 36.4C254 35.5 255.6 34.2 257 32.5V37H260.3ZM241.6 14.7C243.2 13.8 244.9 13.3 246.8 13.3C249.7 13.3 252.2 14.3 254.2 16.4C256.2 18.4 257.2 21 257.2 24C257.2 26 256.8 27.8 255.9 29.4C255 31 253.8 32.3 252.1 33.2C250.4 34.1 248.7 34.6 246.8 34.6C244.9 34.6 243.2 34.1 241.6 33.2C240 32.2 238.7 30.9 237.8 29.2C236.9 27.5 236.4 25.8 236.4 23.9C236.4 22 236.9 20.3 237.8 18.6C238.7 16.9 240 15.6 241.6 14.7Z" fill="currentColor"/>
      <path d="M217.9 11.7H221.4V15.5C222.4 14 223.5 12.9 224.7 12.1C225.8 11.4 227 11 228.3 11C229.2 11 230.2 11.3 231.3 11.9L229.5 14.8C228.8 14.5 228.2 14.3 227.7 14.3C226.6 14.3 225.5 14.8 224.4 15.7C223.4 16.6 222.6 18.1 222 20C221.6 21.5 221.4 24.5 221.4 29.1V38H217.9V11.7Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M185.6 1V37.4H189.1V32.6C190.4 34.4 192 35.8 193.7 36.7C195.4 37.6 197.4 38.1 199.5 38.1C203.2 38.1 206.4 36.8 209.1 34.1C211.8 31.5 213.1 28.2 213.1 24.4C213.1 20.6 211.7 17.3 209.1 14.6C206.5 11.9 203.3 10.5 199.6 10.5C197.5 10.5 195.6 10.9 193.8 11.8C192 12.7 190.4 14 189 15.7V1H185.6ZM204.4 33.5C202.8 34.4 201.1 34.9 199.2 34.9C196.2 34.9 193.8 33.8 191.9 31.8C189.9 29.8 188.9 27.2 188.9 24.2C188.9 22.2 189.3 20.4 190.2 18.8C191.1 17.2 192.3 15.9 194 15C195.7 14.1 197.4 13.6 199.3 13.6C201.1 13.6 202.8 14.1 204.4 15C206 16 207.3 17.3 208.2 19C209.1 20.6 209.6 22.4 209.6 24.3C209.6 26.1 209.1 27.9 208.2 29.6C207.3 31.3 206 32.6 204.4 33.5Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M178.3 29.6L175.4 28.1C174.3 29.8 173.4 31.1 172.6 31.9C171.7 32.7 170.7 33.3 169.4 33.8C168.1 34.3 166.8 34.5 165.5 34.5C162.7 34.5 160.4 33.6 158.5 31.6C156.6 29.7 155.7 27.2 155.6 24.1H179.3C179.3 20.5 178.3 17.5 176.4 15.1C173.7 11.7 170.1 10 165.6 10C161.3 10 157.8 11.7 155.2 15C153.1 17.6 152.1 20.6 152.1 23.9C152.1 27.4 153.3 30.6 155.7 33.4C158.1 36.2 161.5 37.6 165.8 37.6C167.7 37.6 169.5 37.3 171 36.7C172.5 36.1 173.9 35.2 175.1 34.1C176.3 32.9 177.4 31.4 178.3 29.6ZM173.4 16.9C174.3 18 174.9 19.4 175.4 21.2H155.7C156.4 18.8 157.4 17 158.8 15.8C160.7 14.1 162.9 13.3 165.5 13.3C167.1 13.3 168.6 13.6 170 14.3C171.4 14.9 172.5 15.8 173.4 16.9Z" fill="currentColor"/>
      <path d="M144.9 7.4L142.1 10C140.1 8 137.9 6.6 135.6 5.6C133.2 4.6 130.9 4.1 128.7 4.1C125.9 4.1 123.3 4.8 120.7 6.2C118.2 7.6 116.2 9.4 114.8 11.8C113.4 14.1 112.7 16.6 112.7 19.2C112.7 21.9 113.4 24.4 114.9 26.8C116.3 29.2 118.3 31.1 120.9 32.5C123.4 33.9 126.2 34.6 129.2 34.6C132.9 34.6 136 33.6 138.5 31.5C141 29.4 142.5 26.8 143 23.5H131.7V20H147C147 25.5 145.3 29.9 142.1 33.1C138.9 36.3 134.5 38 129.1 38C122.5 38 117.3 35.8 113.5 31.3C110.5 27.8 109.1 23.9 109.1 19.3C109.1 15.9 109.9 12.8 111.6 9.9C113.3 7 115.6 4.7 118.6 3.1C121.6 1.5 124.9 0.6 128.6 0.6C131.6 0.6 134.5 1.1 137.1 2.2C139.7 3.3 142.3 5 144.9 7.4Z" fill="currentColor"/>
      {/* GeoGebra icon - curves and circles */}
      <path fillRule="evenodd" clipRule="evenodd" d="M100.3 17.2C98.8 15.2 96.3 14 93.1 13.8C93.2 13.5 93.2 13.2 93.2 12.9C93.2 12.3 93 11.7 92.8 11.2C97.1 11.3 100.8 13.2 102.8 16.2C101.8 16.2 101 16.6 100.3 17.2ZM86.4 15.4C85.8 14.7 85.4 13.8 85.4 12.9V12.8C82.6 14.1 80.2 16.2 78.4 18.7C79.3 19 80.1 19.7 80.6 20.5C80.7 20.3 80.8 20.1 81 19.9C82.2 18.2 83.9 16.7 86 15.6L86.4 15.4ZM78.6 26.1C78.2 26.2 77.7 26.3 77.2 26.3C76.7 26.3 76.2 26.2 75.8 26C75.7 27.8 75.9 29.5 76.8 31.4C77.3 32.5 78 33.4 78.8 34.2C79.2 33.3 79.8 32.6 80.7 32.2C80.2 31.6 79.8 31 79.4 30.3C78.8 29 78.5 27.5 78.6 26.1ZM86.7 35.1L86.5 35.1C86.4 35 86.3 35 86.2 35L86.2 35.3C86.3 35.4 86.3 35.5 86.3 35.7C86.3 36.4 86.1 37.1 85.7 37.7C88.5 38.1 91.7 37.7 94.7 36.4C94.1 35.8 93.7 34.9 93.6 34C91.3 35 88.8 35.4 86.7 35.1ZM101.9 23.8C102.2 23.9 102.5 24 102.9 24C103.5 24 104.1 23.8 104.6 23.6C104.4 25.7 103.6 28.2 101.9 30.6L101.4 31.2C101.2 31.4 101.1 31.6 100.9 31.8C100.5 31 99.8 30.3 98.9 30L99.2 29.7C99.3 29.5 99.4 29.4 99.5 29.3C100.9 27.4 101.7 25.5 101.9 23.8Z" fill="currentColor"/>
      {/* Circle outlines */}
      <path fillRule="evenodd" clipRule="evenodd" d="M73.3 22.4C73.3 20.2 75 18.5 77.2 18.5C79.4 18.5 81.1 20.2 81.1 22.4C81.1 24.6 79.4 26.3 77.2 26.3C75 26.3 73.3 24.6 73.3 22.4ZM74.5 22.4C74.5 23.9 75.7 25.1 77.2 25.1C78.7 25.1 79.9 23.9 79.9 22.4C79.9 20.9 78.7 19.7 77.2 19.7C75.7 19.7 74.5 20.9 74.5 22.4Z" fill="#191919"/>
      <circle cx="77.2" cy="22.4" r="2.7" fill="#9999FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M78.5 35.7C78.5 33.5 80.2 31.8 82.4 31.8C84.6 31.8 86.3 33.5 86.3 35.7C86.3 37.9 84.6 39.6 82.4 39.6C80.2 39.6 78.5 37.9 78.5 35.7ZM79.7 35.7C79.7 37.2 80.9 38.4 82.4 38.4C83.9 38.4 85.1 37.2 85.1 35.7C85.1 34.2 83.9 33 82.4 33C80.9 33 79.7 34.2 79.7 35.7Z" fill="#191919"/>
      <circle cx="82.4" cy="35.7" r="2.7" fill="#9999FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M85.4 12.9C85.4 10.7 87.1 9 89.3 9C91.5 9 93.2 10.7 93.2 12.9C93.2 15.1 91.5 16.8 89.3 16.8C87.1 16.8 85.4 15.1 85.4 12.9ZM86.6 12.9C86.6 14.4 87.8 15.6 89.3 15.6C90.8 15.6 92 14.4 92 12.9C92 11.4 90.8 10.2 89.3 10.2C87.8 10.2 86.6 11.4 86.6 12.9Z" fill="#191919"/>
      <circle cx="89.3" cy="12.9" r="2.7" fill="#9999FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M99 20.1C99 17.9 100.7 16.2 102.9 16.2C105.1 16.2 106.8 17.9 106.8 20.1C106.8 22.3 105.1 24 102.9 24C100.7 24 99 22.3 99 20.1ZM100.2 20.1C100.2 21.6 101.4 22.8 102.9 22.8C104.4 22.8 105.6 21.6 105.6 20.1C105.6 18.6 104.4 17.4 102.9 17.4C101.4 17.4 100.2 18.6 100.2 20.1Z" fill="#191919"/>
      <circle cx="102.9" cy="20.1" r="2.7" fill="#9999FF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M93.6 33.6C93.6 31.4 95.3 29.7 97.5 29.7C99.7 29.7 101.4 31.4 101.4 33.6C101.4 35.8 99.7 37.5 97.5 37.5C95.3 37.5 93.6 35.8 93.6 33.6ZM94.8 33.6C94.8 35.1 96 36.3 97.5 36.3C99 36.3 100.2 35.1 100.2 33.6C100.2 32.1 99 30.9 97.5 30.9C96 30.9 94.8 32.1 94.8 33.6Z" fill="#191919"/>
      <circle cx="97.5" cy="33.6" r="2.7" fill="#9999FF"/>
      {/* Second "e" */}
      <path fillRule="evenodd" clipRule="evenodd" d="M69.6 29.6L66.7 28.1C65.7 29.8 64.7 31 63.9 31.9C63 32.7 62 33.3 60.7 33.8C59.4 34.3 58.1 34.5 56.8 34.5C54 34.5 51.7 33.6 49.8 31.6C47.9 29.7 47 27.2 46.9 24.1H70.6C70.6 20.5 69.6 17.5 67.7 15.1C65 11.7 61.4 10 56.9 10C52.6 10 49.1 11.7 46.5 15C44.4 17.6 43.4 20.6 43.4 23.9C43.4 27.4 44.6 30.6 47 33.4C49.4 36.2 52.8 37.6 57.1 37.6C59 37.6 60.8 37.3 62.3 36.7C63.8 36.1 65.2 35.2 66.4 34.1C67.6 32.9 68.7 31.4 69.6 29.6ZM64.7 16.7C65.6 17.8 66.2 19.2 66.7 21H47C47.7 18.6 48.7 16.8 50.1 15.6C52 13.9 54.2 13.1 56.8 13.1C58.4 13.1 59.9 13.4 61.3 14.1C62.7 14.7 63.8 15.6 64.7 16.7Z" fill="currentColor"/>
      {/* First "G" */}
      <path d="M36.3 7.7L33.5 10.3C31.5 8.3 29.3 6.9 27 5.9C24.6 4.9 22.3 4.4 20.1 4.4C17.3 4.4 14.7 5.1 12.1 6.5C9.6 7.9 7.6 9.7 6.2 12.1C4.8 14.4 4.1 16.9 4.1 19.5C4.1 22.2 4.8 24.7 6.3 27.1C7.7 29.5 9.7 31.4 12.3 32.8C14.8 34.2 17.6 34.9 20.6 34.9C24.3 34.9 27.4 33.9 29.9 31.8C32.4 29.7 33.9 27.1 34.4 23.8H23V20.4H38.3C38.3 25.9 36.6 30.3 33.4 33.5C30.2 36.7 25.8 38.4 20.4 38.4C13.8 38.4 8.6 36.2 4.8 31.7C1.8 28.2 0.4 24.3 0.4 19.7C0.4 16.3 1.2 13.2 2.9 10.3C4.6 7.4 6.9 5.1 9.9 3.5C12.9 1.9 16.2 1 19.9 1C22.9 1 25.8 1.5 28.4 2.6C31.1 3.6 33.7 5.3 36.3 7.7Z" fill="currentColor"/>
    </svg>
  );
}

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
    <div className="flex flex-col h-screen max-h-screen bg-[#fafafc]">
      {/* Header */}
      <header className="bg-[#6557d2] text-white px-4 py-3.5 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <GeoGebraLogo className="h-6 text-white" />
          <span className="text-white/50 text-lg font-light">|</span>
          <span className="text-sm font-semibold text-white/90">Assistant</span>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {showWelcome && (
            <div className="text-center py-12">
              <div className="mx-auto mb-6">
                <GeoGebraLogo className="h-8 text-[#666666] mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-[#1c1c1f] mb-2">
                Calculator Suite Assistant
              </h2>
              <p className="text-[#85848a] mb-8 max-w-md mx-auto">
                I can help you find the right tools and commands in GeoGebra Calculator Suite. Ask me anything!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-full border border-[#e6e6eb] bg-white hover:border-[#6557d2] hover:bg-[#f3f0ff] transition-colors text-sm font-semibold text-[#6557d2] hover:text-[#5145a8]"
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
                className={`max-w-[85%] px-5 py-3 text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#6557d2] text-white rounded-3xl rounded-br-lg"
                    : "bg-white border border-[#e6e6eb] text-[#2f2f33] rounded-3xl rounded-bl-lg shadow-sm"
                } ${
                  msg.role === "assistant" && isLoading && i === messages.length - 1
                    ? "streaming-cursor"
                    : ""
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-[#5145a8] prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-li:my-0.5 prose-code:bg-[#f3f0ff] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-full prose-code:text-[#6557d2] prose-code:before:content-none prose-code:after:content-none prose-table:text-sm prose-hr:my-3 prose-strong:text-[#1c1c1f] prose-a:text-[#6557d2] prose-a:no-underline hover:prose-a:underline">
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
      <footer className="border-t border-[#e6e6eb] bg-white px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about GeoGebra tools, commands, or features..."
            rows={1}
            className="flex-1 resize-none rounded-full border border-[#d1d0d6] px-5 py-3 text-[15px] focus:outline-none focus:border-[#6557d2] focus:ring-2 focus:ring-[#6557d2]/20 placeholder:text-[#b4b3ba] text-[#2f2f33]"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-[#6557d2] text-white rounded-full px-6 py-3 font-semibold text-[15px] hover:bg-[#5145a8] active:bg-[#3b337a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-center text-xs text-[#b4b3ba] mt-2 max-w-3xl mx-auto">
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
