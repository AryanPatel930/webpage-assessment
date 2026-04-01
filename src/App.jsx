import { useState, useRef, useEffect, useCallback } from "react";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import Header from "./components/Header";
import { sendMessage } from "./api/huggingface";
import "./App.css";

const STORAGE_KEY = "chat-history";

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [messages, setMessages] = useState(loadHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);
  const streamAccumRef = useRef("");
  const streamDoneRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isLoading]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleSend = async (prompt) => {
    if (!prompt.trim() || isLoading) return;

    const userMessage = { role: "user", content: prompt, id: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent("");
    setError(null);
    streamAccumRef.current = "";
    streamDoneRef.current = false;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const { signal } = ac;

    let accumulated = "";

    try {
      await sendMessage(
        prompt,
        messages,
        (token) => {
          accumulated += token;
          streamAccumRef.current = accumulated;
          setStreamingContent(accumulated);
        },
        () => {
          streamDoneRef.current = true;
          const aiMessage = {
            role: "assistant",
            content: accumulated,
            id: Date.now() + 1,
          };
          setMessages((prev) => [...prev, aiMessage]);
          setStreamingContent("");
          setIsLoading(false);
          abortRef.current = null;
        },
        { signal }
      );
    } catch (err) {
      if (err?.name === "AbortError" && !streamDoneRef.current) {
        const partial = streamAccumRef.current;
        streamAccumRef.current = "";
        setStreamingContent("");
        setIsLoading(false);
        abortRef.current = null;
        if (partial) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: partial, id: Date.now() + 1 },
          ]);
        }
        return;
      }
      if (err?.name === "AbortError") {
        return;
      }
      setError(err.message || "Something went wrong. Please try again.");
      setStreamingContent("");
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreamingContent("");
    setError(null);
    setIsLoading(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="app">
      <Header onClear={handleClear} hasMessages={messages.length > 0} />
      <main className="main">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          streamingContent={streamingContent}
          error={error}
          bottomRef={bottomRef}
        />
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
