import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.HF_TOKEN) {
  console.log("✓ HF_TOKEN loaded successfully");
} else {
  console.error("✗ HF_TOKEN not found — check that server/.env exists and has HF_TOKEN=hf_...");
}

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

app.post("/api/chat", async (req, res) => {
  // Accept full messages array for proper conversation context
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing or invalid messages array." });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Server misconfiguration: HF_TOKEN is not set." });
  }

  try {
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        // Send the full conversation history so the model has full context
        messages,
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!hfResponse.ok) {
      const errorBody = await hfResponse.json().catch(() => ({}));
      if (hfResponse.status === 503) {
        return res.status(503).json({ error: "The model is loading. Please try again in 20–30 seconds." });
      }
      if (hfResponse.status === 401) {
        return res.status(401).json({ error: "Invalid HuggingFace token. Check your server .env file." });
      }
      return res.status(hfResponse.status).json({
        error: errorBody.error?.message || errorBody.error || `HuggingFace API error ${hfResponse.status}.`,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const reader = hfResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") {
          res.write("data: [DONE]\n\n");
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    res.end();
  } catch (err) {
    console.error("Proxy error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error. Please try again." });
    }
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});