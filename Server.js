// server.js
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS - frontend'ten doğrudan çağrı için
app.use(
  cors({
    origin: "*", // İstersen buraya sadece kendi domainini yazabilirsin
  })
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "⚠️ Uyarı: GEMINI_API_KEY tanımlı değil. .env dosyasını doldurmayı unutma!"
  );
}

app.get("/", (req, res) => {
  res.send("SkyStil backend çalışıyor. /style-advice endpoint'ini kullan.");
});

app.post("/style-advice", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt alanı zorunlu." });
    }

    if (!GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY sunucuda tanımlı değil." });
    }

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Gemini hata:", resp.status, text);
      return res.status(resp.status).send(text);
    }

    const data = await resp.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Üzgünüm, cevap alınamadı.";

    res.json({ text });
  } catch (err) {
    console.error("Sunucu hatası:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SkyStil backend port", PORT, "üzerinde çalışıyor.");
});
