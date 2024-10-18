import {
  getListOfSubscribersByTeacherIds,
  getUnnotifiedEvents,
  setCIEventAsNotified,
} from "./supabase.client.js";

import admin from "./firebase.js";

export async function sendToAllSubscribers() {
  const events = await getUnnotifiedEvents();
  if (!Array.isArray(events)) {
    console.error("Event not found");
    return;
  }

  let notificationResArray = [];
  const notifiedEvents = new Map();

  for (const event of events) {
    const multiDayTeacherIds = new Map(
      (event.multi_day_teachers || [])
        .filter((value) => value !== "NON_EXISTENT")
        .map((value) => [value, value]) // Use the value itself as the key
    );

    const sectionTeacherIds = new Map(
      event.segments
        .map((segment) => segment.teachers)
        .flat()
        .map((teacher) => teacher.value)
        .filter((id) => id !== "NON_EXISTENT")
        .map((value) => [value, value]) // Use the value itself as the key
    );

    const combinedTeacherIds = new Map([
      ...multiDayTeacherIds,
      ...sectionTeacherIds,
    ]);

    if (combinedTeacherIds.size === 0) {
      notifiedEvents.set(event.id, true);
      continue;
    }

    const subscribers = await getListOfSubscribersByTeacherIds(
      Array.from(combinedTeacherIds.keys())
    );

    const results = await Promise.allSettled(
      subscribers.map((subscriber) => {
        return sendNotification({
          title: event.title,
          body: `ארוע חדש ברשימת עדכונים שלכם`,
          token: subscriber,
          eventId: event.id,
        });
      })
    ).then((results) => {
      return results;
    });

    notificationResArray = notificationResArray.concat(results);
    notifiedEvents.set(event.id, true);
  }

  const setNotifiedResults = await Promise.allSettled(
    Array.from(notifiedEvents.keys()).map((eventId) => {
      return setCIEventAsNotified(eventId);
    })
  );

  return { notificationResArray, setNotifiedResults };
}

export async function sendNotification({ title, body, token, eventId }) {
  const message = {
    data: {
      title: title || "שגיעת התראה",
      body: body || "סליחה, אבל זה נשלח בטעות",
      url: process.env.DOMAIN_URL + "/" + eventId,
    },
    token: token,
  };

  return admin
    .messaging()
    .send(message)
    .then((response) => {
      return {
        destination: token,
        ci_event_id: eventId,
        success: true,
        messageId: response.messageId,
      };
    })
    .catch((error) => {
      return {
        destination: token,
        ci_event_id: eventId,
        success: false,
        messageId: null,
      };
    });
}
