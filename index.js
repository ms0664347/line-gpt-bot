import express from "express";
import axios from "axios";
import { middleware, Client } from "@line/bot-sdk";

const app = express();
app.use(express.json());

// LINE ENV
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Client(config);

// Webhook Endpoint
app.post("/webhook", middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        // 呼叫 free.v36.cm API
        const aiRes = await axios.post(
          "https://free.v36.cm/v1/chat/completions",
          {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: userText }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.FREE_API_KEY}`,
            },
          }
        );

        const replyText =
          aiRes.data?.choices?.[0]?.message?.content || "（AI 沒回應）";

        await lineClient.replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        });
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("ERROR");
  }
});

// Railway Port config
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
