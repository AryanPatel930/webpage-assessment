/**
 * Builds a Mistral/Llama instruct-format prompt from message history.
 */
function buildPrompt(userMessage, history) {
  let prompt = "";
  const recent = history.slice(-6);
  for (const msg of recent) {
    if (msg.role === "user") {
      prompt += `[INST] ${msg.content} [/INST]`;
    } else {
      prompt += ` ${msg.content} `;
    }
  }
  prompt += `[INST] ${userMessage} [/INST]`;
  return prompt;
}

/**
 * Streams a response from the Express proxy server.
 * Calls onChunk(text) incrementally as tokens arrive.
 * Calls onDone() when the stream ends.
 * Throws on error.
 *
 * @param {string} userMessage
 * @param {Array} history
 * @param {function} onChunk - called with each text token
 * @param {function} onDone - called when stream is complete
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function sendMessage(
  userMessage,
  history = [],
  onChunk,
  onDone,
  options = {}
) {
  const { signal } = options;
  const prompt = buildPrompt(userMessage, history);

  const response = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
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
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
      throw err;
    }
    throw err;
  }

  onDone?.();
}
