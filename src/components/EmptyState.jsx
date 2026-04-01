import "./EmptyState.css";

const suggestions = [
  "Explain how async/await works in JavaScript",
  "What's the difference between REST and GraphQL?",
  "Write a Python function to flatten a nested list",
  "Summarize the key ideas in Clean Code",
];

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-glyph">✦</div>
      <p className="empty-headline">What do you want to know?</p>
      <p className="empty-sub">Ask anything — code, concepts, ideas, writing.</p>
      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip"
            onClick={() => {
              const textarea = document.querySelector(".chat-textarea");
              if (textarea) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLTextAreaElement.prototype, "value"
                ).set;
                nativeInputValueSetter.call(textarea, s);
                textarea.dispatchEvent(new Event("input", { bubbles: true }));
                textarea.focus();
              }
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
