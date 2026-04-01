import { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

export default function ChatInput({ onSend, onStop = () => {}, isLoading }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  const handleInput = (e) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="input-area">
      <div className={`input-shell ${isLoading ? "input-shell--locked" : ""}`}>
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onInput={handleInput}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Generating response…" : "Ask anything  ⏎ to send"}
          disabled={isLoading}
          rows={1}
        />
        <div className="input-footer">
          {isLoading ? (
            <div className="generating-control" role="status" aria-live="polite">
              <div className="generating-control__main">
                <div className="gen-spinner" aria-hidden />
                <span className="generating-control__label">Generating…</span>
              </div>
              <button
                type="button"
                className="stop-btn"
                onClick={onStop}
                aria-label="Stop generation"
              >
                <span className="stop-btn__icon" aria-hidden />
                Stop
              </button>
            </div>
          ) : (
            <button
              className="send-btn"
              onClick={submit}
              disabled={!value.trim()}
            >
              send
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="input-hint">shift + enter for new line</p>
    </div>
  );
}
