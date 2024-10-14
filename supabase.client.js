import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authenticateRequest = async (req, res, next) => {
  // Parse the cookie string to extract the authToken
  //issue with postman
  const cookieString = req.headers.cookie || "";
  const cookies = cookieString.split("; ").reduce((acc, cookie) => {
    const [name, value] = cookie.split("=");
    acc[name] = value;
    return acc;
  }, {});

  const token = cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = data;
  next();
};

export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const accessToken = data.session?.access_token;
    if (error) {
      console.error("Error logging in:", error);
    }
    return accessToken;
  } catch (error) {
    console.error("Error logging in:", error);
  }
  return null;
}
