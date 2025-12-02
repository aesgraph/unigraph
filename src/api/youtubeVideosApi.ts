import { supabase } from "../utils/supabaseClient";

export interface AccessLog {
  accessTime: string;
}

export interface YouTubeVideo {
  id: string;
  title?: string | null;
  description?: string | null;
  publishedAt?: string | null; // timestamp with time zone
  duration?: string | null; // ISO 8601 duration string (e.g., PT5M3S)
  viewCount?: number | null;
  likeCount?: number | null;
  commentCount?: number | null;
  tags?: string | string[] | null; // table column is text; may store CSV or JSON array
  categoryId?: number | null;
  defaultLanguage?: string | null;
  defaultAudioLanguage?: string | null;
  liveBroadcastContent?: string | null;
  url?: string | null;
  thumbnail_default_url?: string | null;
  thumbnail_medium_url?: string | null;
  thumbnail_high_url?: string | null;
  accessLogs?: AccessLog[] | null;
  lastAccessTime?: string | null;
}

// List YouTube videos with optional limit and ordering by published date
export async function listYouTubeVideos({
  limit,
  orderBy = "publishedAt",
  ascending = false,
}: {
  limit?: number;
  orderBy?: keyof YouTubeVideo | string;
  ascending?: boolean;
} = {}): Promise<YouTubeVideo[]> {
  // Load across all users (table has no user_id per schema)
  let query = supabase.from("youtube_videos").select("*");

  // Order by provided column if present in table
  if (orderBy) {
    query = query.order(orderBy as string, { ascending });
  }

  if (limit && Number.isFinite(limit)) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as YouTubeVideo[]) || [];
}

// Get a single YouTube video by id
export async function getYouTubeVideo(
  id: string
): Promise<YouTubeVideo | null> {
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data as YouTubeVideo) || null;
}
