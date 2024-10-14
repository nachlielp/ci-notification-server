// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import admin from "./firebase.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());

app.post("/api/send-notification", (req, res) => {
  const { token, title, body, url } = req.body;
  console.log("send-notification: ", req.body);
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const message = {
    data: {
      title: title || "New Notification",
      body: body || "This is a push notification from your server.",
      url: url || "https://example.com/messages",
    },
    token: token,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
      res.status(200).json({ success: true, response });
    })
    .catch((error) => {
      console.error("Error sending message:", error);
      res.status(500).json({ success: false, error });
    });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
