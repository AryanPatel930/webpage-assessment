import Message from "./Message";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import "./ChatWindow.css";

export default function ChatWindow({ messages, isLoading, streamingContent, error, bottomRef }) {
  const isEmpty = messages.length === 0 && !isLoading && !streamingContent;

  if (isEmpty) {
    return (
      <div className="chat-window chat-window--empty">
        <EmptyState />
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {/* Show skeleton only while waiting for the very first token */}
        {isLoading && !streamingContent && <SkeletonLoader />}

        {/* Live streaming message — appears token by token */}
        {streamingContent && (
          <Message
            message={{ role: "assistant", content: streamingContent }}
            isStreaming={true}
          />
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
