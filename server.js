const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('PUBLIC'));

const BOT_TOKEN = "8284697030:AAGNJha-hAkTaMak5jVbiIlcvohS8mkEilY";
const MY_CHAT_ID = "8007161832"; 
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let pendingReply = null;

// الموقع بيبعت رسالة
app.post("/api/send", async (req, res) => {
  pendingReply = null;
  const text = req.body.text;
  
  // إرسال لتيليجرام
  const response = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: MY_CHAT_ID,
      text: `💬 صاحبك بيقول:\n\n${text}`,
      reply_markup: { force_reply: true }
    })
  });

  // لو في مشكلة في الاتصال بتيليجرام (للتجربة المحلية)
  const data = await response.json();
  if (!data.ok) console.log("خطأ في تيليجرام:", data);

  res.json({ ok: true });
});

// الموقع بيسأل: في رد جديد؟
app.get("/api/reply", (req, res) => {
  const r = pendingReply; pendingReply = null;
  res.json({ ok: true, reply: r });
});

// تيليجرام بيبعت الرد هنا
app.post("/webhook", (req, res) => {
  if (req.body.message?.reply_to_message) {
    pendingReply = req.body.message.text;
  }
  res.sendStatus(200);
});

// زرار تجربة محلية (عشان تتأكد إن الشات شغال)
app.post("/api/fake", (req, res) => {
  pendingReply = "أهلاً بك! أنا الذكاء الاصطناعي، كيف أقدر أساعدك؟ (رد تجريبي)";
  res.json({ ok: true });
});

const url = process.env.WEBHOOK_URL;
if (url) fetch(`${API}/setWebhook?url=${url}`);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));