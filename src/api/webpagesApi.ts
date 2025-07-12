import { supabase } from "../utils/supabaseClient";

export interface Webpage {
  id: string;
  url: string;
  user_id: string;
  title?: string;
  html_content?: string;
  screenshot_url?: string;
  metadata?: any;
  created_at?: string;
  last_updated_at?: string | null;
}

// Save (upsert) a webpage
export async function saveWebpage(webpage: Webpage) {
  const { data, error } = await supabase
    .from("webpages")
    .upsert([webpage], { onConflict: "id" })
    .select();
  if (error) throw error;
  return data?.[0];
}

// List webpages for a user, optionally filtered by a list of URLs
export async function listWebpages({
  userId,
  urls,
}: {
  userId?: string;
  urls?: string[];
} = {}) {
  let query = supabase.from("webpages").select("*");
  if (userId) query = query.eq("user_id", userId);
  if (urls && urls.length > 0) query = query.in("url", urls);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Get a single webpage by id
export async function getWebpage(id: string) {
  const { data, error } = await supabase
    .from("webpages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
