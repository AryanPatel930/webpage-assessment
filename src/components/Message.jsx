import "./Message.css";

// Lightweight markdown renderer — handles the patterns the AI commonly outputs
function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="md-code-block">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // Heading h3
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="md-h3">{parseInline(line.slice(4))}</h3>);
      i++;
      continue;
    }

    // Heading h2
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="md-h2">{parseInline(line.slice(3))}</h2>);
      i++;
      continue;
    }

    // Heading h1
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="md-h1">{parseInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[\-\*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\-\*] /)) {
        items.push(<li key={i}>{parseInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i}>{parseInline(lines[i].replace(/^\d+\. /, ""))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>);
      continue;
    }

    // Blank line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="md-p">{parseInline(line)}</p>);
    i++;
  }

  return elements;
}

// Handle inline markdown: bold, italic, inline code
function parseInline(text) {
  const parts = [];
  // Regex matches **bold**, *italic*, `code` in order
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index} className="md-inline-code">{match[4]}</code>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

export default function Message({ message, isStreaming = false }) {
  const isUser = message.role === "user";

  return (
    <div className={`message message--${isUser ? "user" : "assistant"}`}>
      <div className="message-role">
        {isUser ? "you" : "ai"}
      </div>
      <div className="message-content">
        {isUser ? (
          <p className="md-p">{message.content}</p>
        ) : (
          <>
            {renderMarkdown(message.content)}
            {isStreaming && <span className="cursor" />}
          </>
        )}
      </div>
    </div>
  );
}