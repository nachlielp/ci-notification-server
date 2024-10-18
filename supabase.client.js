import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import dayjs from "dayjs";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUnnotifiedEvents() {
  try {
    const { data, error } = await supabase
      .from("ci_events")
      .select("*")
      .gte("start_date", dayjs().format("YYYY-MM-DD"))
      .eq("hide", false)
      .not("is_notified", "is", true);

    if (error) {
      console.error("Error getting unnotified events:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error getting unnotified events:", error);
  }
}
export const getListOfSubscribersByTeacherIds = async (teacherIds) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, push_notification_tokens, subscriptions");

    const overlap = data.filter((user) => {
      return user.subscriptions.some((subscription) =>
        teacherIds.includes(subscription)
      );
    });

    if (error) {
      throw error;
    }

    const tokenObjs = overlap
      .map((user) => {
        return {
          push_notification_tokens: user.push_notification_tokens,
        };
      })
      .flat();

    const tokens = tokenObjs
      .map((tokenObj) => {
        return tokenObj.push_notification_tokens.map((token) => token);
      })
      .flat()
      .map((token) => token.token);

    return tokens;
  } catch (error) {
    console.error("Error getting list of subscribers by teacher ids:", error);
  }
};

export const setCIEventAsNotified = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("ci_events")
      .update({ is_notified: true })
      .eq("id", eventId);
  } catch (error) {
    console.error("Error setting CI event as notified:", error);
  }
};
