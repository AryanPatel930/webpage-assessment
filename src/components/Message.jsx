import "./Message.css";

export default function Message({ message, isStreaming = false }) {
  const isUser = message.role === "user";

  return (
    <div className={`message message--${isUser ? "user" : "assistant"}`}>
      <div className="message-role">
        {isUser ? "you" : "ai"}
      </div>
      <div className="message-content">
        {message.content}
        {isStreaming && <span className="cursor" />}
      </div>
    </div>
  );
}
