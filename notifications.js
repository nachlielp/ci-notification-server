import {
  getEventById,
  getListOfSubscribersByTeacherIds,
} from "./supabase.client.js";

import admin from "./firebase.js";

export async function sendToAllSubscribers({ eventId }) {
  const event = await getEventById(eventId);
  if (!event) {
    console.error("Event not found");
    return;
  }
  const multiDayTeacherIds = event.multi_day_teachers?.filter(
    (value) => value !== "NON_EXISTENT"
  );

  const sectionTeacherIds = event.segments
    .map((segment) => {
      return segment.teachers;
    })
    .flat()
    .map((teacher) => {
      return teacher.value;
    })
    .filter((id) => id !== "NON_EXISTENT");

  const teacherIds = [...multiDayTeacherIds, ...sectionTeacherIds];
  console.log("teacherIds: ", teacherIds);
  const subscribers = await getListOfSubscribersByTeacherIds(teacherIds);

  for (const subscriber of subscribers) {
    await sendNotification({
      title: "התראה על ארוע",
      body: "התראה על ארוע שלך ביום מסוים",
      token: subscriber,
      eventId,
    });
  }
}

export async function sendNotification({ title, body, token, eventId }) {
  const message = {
    data: {
      title: title || "שגיעת התראה",
      body: body || "סליחה, אבל זה נשלח בטעות",
      url: process.env.DOMAIN_URL + eventId,
    },
    token: token,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

async function scheduleNotification({ eventId, scheduleTime, timeZone }) {
  // const task = cron.schedule(
  //     scheduleTime,
  //     () => {
  //       const message = {
  //         data: {
  //           title: title || "התארה על ארוע 💃",
  //           body: body || "תזכורת על ארוע שלך ביום מסוים",
  //           url: url || "ci.nachli.com",
  //         },
  //         token: token,
  //       };
  //       admin
  //         .messaging()
  //         .send(message)
  //         .then((response) => {
  //           console.log("Successfully sent scheduled message:", response);
  //         })
  //         .catch((error) => {
  //           console.error("Error sending scheduled message:", error);
  //         });
  //     },
  //     {
  //       scheduled: true,
  //       timezone: timeZone, // Use the provided time zone
  //     }
  //   );
  //   // Add the task to the list of scheduled notifications
  //   scheduledNotifications.push({
  //     token,
  //     title,
  //     body,
  //     url,
  //     scheduleTime,
  //     timeZone,
  //     task,
  //   });
}
