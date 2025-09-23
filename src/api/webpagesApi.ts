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
  includeContent = false,
}: {
  userId?: string;
  urls?: string[];
  includeContent?: boolean;
} = {}) {
  // Select fields based on includeContent flag
  const selectFields = includeContent
    ? "*"
    : "id, url, user_id, title, metadata, created_at, last_updated_at";

  let query = supabase.from("webpages").select(selectFields);
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

// Get webpage content (html_content and screenshot_url) on demand
export async function getWebpageContent(id: string) {
  const { data, error } = await supabase
    .from("webpages")
    .select("html_content, screenshot_url")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// Get multiple webpages with full content
export async function getWebpagesWithContent(ids: string[]) {
  const { data, error } = await supabase
    .from("webpages")
    .select("id, html_content, screenshot_url")
    .in("id", ids);
  if (error) throw error;
  return data;
}

// Check if webpage has heavy content available
export async function checkWebpageContent(id: string) {
  const { data, error } = await supabase
    .from("webpages")
    .select("html_content, screenshot_url")
    .eq("id", id)
    .single();
  if (error) throw error;

  return {
    hasHtml: !!data?.html_content,
    hasScreenshot: !!data?.screenshot_url,
  };
}

// Check if multiple webpages have heavy content available
export async function checkWebpagesContent(ids: string[]) {
  const { data, error } = await supabase
    .from("webpages")
    .select("id, html_content, screenshot_url")
    .in("id", ids);
  if (error) throw error;

  const results: {
    [id: string]: { hasHtml: boolean; hasScreenshot: boolean };
  } = {};

  data?.forEach((webpage: any) => {
    results[webpage.id] = {
      hasHtml: !!webpage.html_content,
      hasScreenshot: !!webpage.screenshot_url,
    };
  });

  return results;
}

// Update only the title of a webpage
export async function updateWebpageTitle(id: string, title: string) {
  const { data, error } = await supabase
    .from("webpages")
    .update({ title, last_updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, title");
  if (error) throw error;
  return data?.[0];
}

// Delete a webpage by id
export async function deleteWebpage(id: string) {
  const { error } = await supabase.from("webpages").delete().eq("id", id);
  if (error) throw error;
  return true;
}
