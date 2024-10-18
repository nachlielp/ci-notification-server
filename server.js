// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { sendToAllSubscribers } from "./notifications.js";
import cron from "node-cron";
dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.get("/api/test", async (req, res) => {
  try {
    const { notificationResArray, setNotifiedResults } =
      await sendToAllSubscribers();
    res.json({ success: true, notificationResArray, setNotifiedResults });
  } catch (error) {
    console.error("Error getting unnotified events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

cron.schedule("*/5 * * * *", async () => {
  console.log("Running cron job");
  const { notificationResArray, setNotifiedResults } =
    await sendToAllSubscribers();
  console.log("notificationResArray: ", notificationResArray);
  console.log("setNotifiedResults: ", setNotifiedResults);
});

const PORT = process.env.LOCAL_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
