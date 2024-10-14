// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import admin from "./firebase.js";
import cron from "node-cron";
import { authenticateRequest, login } from "./supabase.client.js";
import { sendToAllSubscribers } from "./notifications.js";
dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get("/api/test-not-verified", (req, res) => {
  res.send("Hello World - You are not authenticated");
});
app.get("/api/test-varify", authenticateRequest, (req, res) => {
  res.send("Hello World - You are authenticated");
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("login: ", req.body);
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const token = await login(email, password);
    if (token) {
      // Set the token as a cookie
      res.cookie("authToken", token, {
        httpOnly: true, // Helps prevent XSS attacks
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (e.g., 1 day)
      });
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/event-created", authenticateRequest, (req, res) => {
  const { eventId } = req.body;
  sendToAllSubscribers({ eventId });

  res.status(200).json({ success: true, message: "Notification scheduled" });
});
app.post("/api/send-notification", authenticateRequest, (req, res) => {
  const { eventId } = req.body;

  // console.log("send-notification: ", req.body);
  // if (!token) {
  //   return res.status(400).json({ error: "Token is required" });
  // }

  // const message = {
  //   data: {
  //     title: title || "New Notification",
  //     body: body || "This is a push notification from your server.",
  //     url: url || "https://example.com/messages",
  //   },
  //   token: token,
  // };

  // admin
  //   .messaging()
  //   .send(message)
  //   .then((response) => {
  //     console.log("Successfully sent message:", response);
  //     res.status(200).json({ success: true, response });
  //   })
  //   .catch((error) => {
  //     console.error("Error sending message:", error);
  //     res.status(500).json({ success: false, error });
  //   });
}); // Array to store scheduled notifications

app.post("/api/schedule-notification", authenticateRequest, (req, res) => {
  const { token, title, body, url, scheduleTime, timeZone } = req.body;
  console.log("schedule-notification: ", req.body);
  if (!token || !url || !scheduleTime || !timeZone) {
    return res
      .status(400)
      .json({ error: "Token, scheduleTime, and timeZone are required" });
  }

  // Schedule the notification with the specified time zone

  // Return a success response immediately
  res.status(200).json({ success: true, message: "Notification scheduled" });
});

app.listen(3001, () => {
  console.log("Server started on port 3001");
});
