const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("✅ StudnixAI backend is running!");
});

// Ask AI endpoint
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  // Check prompt
  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "❌ Prompt is required" });
  }

  // Check API key
  if (!process.env.OPENROUTER_KEY) {
    console.error("❌ OPENROUTER_KEY missing in environment");
    return res
      .status(500)
      .json({ error: "Server misconfigured: API key missing" });
  }

  try {
    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI study assistant for students. Your name is StudnixAI. Your father is Sanket Padhyal. Sanket Padhyal is Developer of this website",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`, // TWO WAYS EITHER CREATE A .ENV FILE AND PASTE YOUR KEY/API OVER THERE IN FORMAT OPENROUTER_KEY="YOUR_KEY" OR USE BACKEND KEY HIDING SESSION PIN OKAY!
        },
      },
    );

    // Extract reply
    const reply =
      response.data?.choices?.[0]?.message?.content || "⚠️ No response from AI";
    res.json({ reply });
  } catch (err) {
    // Log actual error to console
    console.error("❌ API Error:", err.response?.data || err.message);

    // Send a clear error to frontend
    res.status(500).json({
      error: err.response?.data || err.message || "Internal Server Error",
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
