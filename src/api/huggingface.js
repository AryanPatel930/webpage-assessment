/**
 * Streams a response from the Express proxy server.
 * Sends the full messages array so the model has complete conversation context.
 *
 * @param {Array} messages - Full conversation history [{role, content}]
 * @param {function} onChunk - called with each text token as it streams in
 * @param {function} onDone - called when stream is complete
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function sendMessage(messages = [], onChunk, onDone, options = {}) {
  const { signal } = options;

  // Send only role + content — strip internal fields like id
  const payload = messages.map(({ role, content }) => ({ role, content }));

  const response = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: payload }),
    signal,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `Server error ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          onDone?.();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.token) {
            onChunk?.(parsed.token);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (err) {
    if (signal?.aborted || err?.name === "AbortError") {
      try { await reader.cancel(); } catch { /* ignore */ }
      throw err;
    }
    throw err;
  }

  onDone?.();
}