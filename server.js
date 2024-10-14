// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import admin from "./firebase.js";
import cron from "node-cron";
dotenv.config();

const app = express();

app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

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

const scheduledNotifications = []; // Array to store scheduled notifications

app.post("/api/schedule-notification", (req, res) => {
  const { token, title, body, url, scheduleTime, timeZone } = req.body;
  console.log("schedule-notification: ", req.body);
  if (!token || !url || !scheduleTime || !timeZone) {
    return res
      .status(400)
      .json({ error: "Token, scheduleTime, and timeZone are required" });
  }

  // Schedule the notification with the specified time zone
  const task = cron.schedule(
    scheduleTime,
    () => {
      const message = {
        data: {
          title: title || "התארה על ארוע 💃",
          body: body || "תזכורת על ארוע שלך ביום מסוים",
          url: url || "ci.nachli.com",
        },
        token: token,
      };

      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log("Successfully sent scheduled message:", response);
        })
        .catch((error) => {
          console.error("Error sending scheduled message:", error);
        });
    },
    {
      scheduled: true,
      timezone: timeZone, // Use the provided time zone
    }
  );

  // Add the task to the list of scheduled notifications
  scheduledNotifications.push({
    token,
    title,
    body,
    url,
    scheduleTime,
    timeZone,
    task,
  });

  // Return a success response immediately
  res.status(200).json({ success: true, message: "Notification scheduled" });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
