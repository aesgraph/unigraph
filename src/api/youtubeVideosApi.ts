import { ENV, getEnvVar } from "../utils/envUtils";
import { supabase } from "../utils/supabaseClient";

export interface AccessLog {
  accessTime: string;
}

export interface YouTubeVideo {
  id: string;
  user_id?: string | null;
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
  userId,
  limit,
  orderBy = "publishedAt",
  ascending = false,
}: {
  userId?: string;
  limit?: number;
  orderBy?: keyof YouTubeVideo | string;
  ascending?: boolean;
} = {}): Promise<YouTubeVideo[]> {
  let query = supabase.from("youtube_videos").select("*");

  // Filter by user_id if provided
  if (userId) {
    query = query.eq("user_id", userId);
  }

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
  id: string,
  userId?: string
): Promise<YouTubeVideo | null> {
  let query = supabase.from("youtube_videos").select("*").eq("id", id);

  // Filter by user_id if provided
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  // Handle "no rows" error gracefully - this is expected when video doesn't exist
  if (error) {
    // PGRST116 is the error code for "no rows returned" from Supabase
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      return null;
    }
    throw error;
  }

  return (data as YouTubeVideo) || null;
}

// Delete a YouTube video by id
export async function deleteYouTubeVideo(id: string): Promise<void> {
  const { error } = await supabase.from("youtube_videos").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Interface for YouTube API metadata response
interface YouTubeVideoMetadata {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  duration: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  tags: string[];
  categoryId: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  liveBroadcastContent: string;
  url: string;
}

// Fetch video metadata from YouTube Data API v3
async function fetchYouTubeVideoMetadata(
  videoId: string
): Promise<YouTubeVideoMetadata | null> {
  // Use the same pattern as VITE_LIVE_CHAT_URL - try ENV constant first, then getEnvVar
  const apiKey = ENV.YOUTUBE_API_KEY || getEnvVar("VITE_YOUTUBE_API_KEY");

  if (!apiKey) {
    console.warn("YouTube API key not configured. Skipping metadata fetch.");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails,statistics,status`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `YouTube API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found in YouTube API");
    }

    const item = data.items[0];
    const snippet = item.snippet || {};
    const statistics = item.statistics || {};
    const contentDetails = item.contentDetails || {};

    return {
      id: videoId,
      title: snippet.title || "",
      description: snippet.description || "",
      publishedAt: snippet.publishedAt || "",
      thumbnails: snippet.thumbnails || {},
      duration: contentDetails.duration || "",
      viewCount: statistics.viewCount || "0",
      likeCount: statistics.likeCount || "0",
      commentCount: statistics.commentCount || "0",
      tags: snippet.tags || [],
      categoryId: snippet.categoryId || "",
      defaultLanguage: snippet.defaultLanguage || undefined,
      defaultAudioLanguage: snippet.defaultAudioLanguage || undefined,
      liveBroadcastContent: snippet.liveBroadcastContent || "none",
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    console.error("Error fetching YouTube video metadata:", error);
    throw error;
  }
}

// Import YouTube video from URL
export async function importYouTubeVideo(
  url: string,
  userId: string
): Promise<YouTubeVideo> {
  if (!userId) {
    throw new Error("User ID is required to import YouTube videos");
  }

  const videoId = extractVideoId(url);
  console.log("calling import youtube video with url ", url);
  if (!videoId) {
    throw new Error(
      "Invalid YouTube URL. Please provide a valid YouTube video URL."
    );
  }

  // Check if video already exists for this user
  console.log("here 1");
  let existing: YouTubeVideo | null = null;
  try {
    existing = await getYouTubeVideo(videoId, userId);
  } catch (error) {
    // If there's an unexpected error, log it but continue with import
    console.warn("Error checking for existing video:", error);
  }

  if (existing) {
    return existing;
  }

  console.log("here 2");
  // Fetch metadata from YouTube API
  let metadata: YouTubeVideoMetadata | null = null;
  try {
    metadata = await fetchYouTubeVideoMetadata(videoId);
    console.log("youtube metadata is ", metadata);
  } catch (error) {
    console.error("Failed to fetch YouTube metadata:", error);
    // Continue with basic entry if API fails
  }

  // Prepare video data
  const videoData: any = {
    id: videoId,
    user_id: userId,
    url: url,
  };

  if (metadata) {
    // Map YouTube API metadata to database schema
    videoData.title = metadata.title;
    videoData.description = metadata.description;
    videoData.publishedAt = metadata.publishedAt;
    videoData.duration = metadata.duration;
    videoData.viewCount = parseInt(metadata.viewCount) || null;
    videoData.likeCount = parseInt(metadata.likeCount) || null;
    videoData.commentCount = parseInt(metadata.commentCount) || null;
    videoData.tags =
      Array.isArray(metadata.tags) && metadata.tags.length > 0
        ? JSON.stringify(metadata.tags)
        : null;
    videoData.categoryId = parseInt(metadata.categoryId) || null;
    videoData.defaultLanguage = metadata.defaultLanguage || null;
    videoData.defaultAudioLanguage = metadata.defaultAudioLanguage || null;
    videoData.liveBroadcastContent = metadata.liveBroadcastContent || null;

    // Map thumbnails
    if (metadata.thumbnails) {
      videoData.thumbnail_default_url =
        metadata.thumbnails.default?.url || null;
      videoData.thumbnail_medium_url = metadata.thumbnails.medium?.url || null;
      videoData.thumbnail_high_url = metadata.thumbnails.high?.url || null;
    }
  } else {
    // Fallback to basic entry if API is not available
    videoData.title = null;
    videoData.description = null;
    videoData.publishedAt = null;
    videoData.duration = null;
    videoData.viewCount = null;
    videoData.likeCount = null;
    videoData.commentCount = null;
    videoData.tags = null;
    videoData.categoryId = null;
    videoData.defaultLanguage = null;
    videoData.defaultAudioLanguage = null;
    videoData.liveBroadcastContent = null;
    videoData.thumbnail_default_url = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    videoData.thumbnail_medium_url = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    videoData.thumbnail_high_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  const { data, error } = await supabase
    .from("youtube_videos")
    .insert([videoData])
    .select()
    .single();

  if (error) {
    // If it's a duplicate key error, try to fetch the existing record
    if (error.code === "23505" || error.message?.includes("duplicate")) {
      const existing = await getYouTubeVideo(videoId, userId);
      if (existing) {
        return existing;
      }
    }
    throw error;
  }

  return data;
}
