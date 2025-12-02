import { UserActivity } from "../api/userActivitiesApi";

export interface VideoAccessInfo {
  videoId: string;
  lastAccessTime: string;
  timestamp?: number;
  videoTitle?: string;
  watchDuration?: number;
  timestampAccessed?: string;
}

export interface DocumentAccessInfo {
  documentId: string;
  lastAccessTime: string;
  documentTitle?: string;
  accessType?: string;
}

export class UserActivityCache {
  private videoAccessMap: Map<string, VideoAccessInfo> = new Map();
  private documentAccessMap: Map<string, DocumentAccessInfo> = new Map();
  private lastUpdated: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Update the cache with user activities
   * @param activities Array of UserActivity objects
   */
  updateCache(activities: UserActivity[]): void {
    this.videoAccessMap.clear();
    this.documentAccessMap.clear();

    // Filter for YouTube video activities and process them
    const youtubeActivities = activities.filter(
      (activity) =>
        activity.activity_id === "youtube_video_accessed" && activity.context
    );

    // Group by video_id and keep the most recent access time for each video
    youtubeActivities.forEach((activity) => {
      const context = activity.context as any;
      const videoId = context?.video_id || context?.resource?.resourceId;

      if (videoId) {
        const existingEntry = this.videoAccessMap.get(videoId);
        const activityTime = new Date(activity.timestamp).getTime();

        // Only update if this activity is more recent than existing entry
        if (
          !existingEntry ||
          activityTime > new Date(existingEntry.lastAccessTime).getTime()
        ) {
          this.videoAccessMap.set(videoId, {
            videoId,
            lastAccessTime: activity.timestamp,
            timestamp: context.timestamp,
            videoTitle: context.video_title,
            watchDuration: context.watch_duration,
            timestampAccessed: context.timestamp_accessed,
          });
        }
      }
    });

    // Filter for document activities and process them
    const documentActivities = activities.filter(
      (activity) =>
        (activity.activity_id === "document_accessed" ||
          activity.activity_id === "document_opened" ||
          activity.activity_id === "document_viewed") &&
        activity.context
    );

    // Group by document_id and keep the most recent access time for each document
    documentActivities.forEach((activity) => {
      const context = activity.context as any;
      const documentId = context?.document_id || context?.resource?.resourceId;

      if (documentId) {
        const existingEntry = this.documentAccessMap.get(documentId);
        const activityTime = new Date(activity.timestamp).getTime();

        // Only update if this activity is more recent than existing entry
        if (
          !existingEntry ||
          activityTime > new Date(existingEntry.lastAccessTime).getTime()
        ) {
          this.documentAccessMap.set(documentId, {
            documentId,
            lastAccessTime: activity.timestamp,
            documentTitle: context.document_title,
            accessType: activity.activity_id,
          });
        }
      }
    });

    this.lastUpdated = Date.now();
  }

  /**
   * Get the last access time for a specific video
   * @param videoId YouTube video ID
   * @returns VideoAccessInfo or null if not found
   */
  getVideoAccessInfo(videoId: string): VideoAccessInfo | null {
    if (this.isExpired()) {
      return null;
    }
    return this.videoAccessMap.get(videoId) || null;
  }

  /**
   * Get the last access time for multiple videos
   * @param videoIds Array of YouTube video IDs
   * @returns Record mapping video IDs to their access info
   */
  getMultipleVideoAccessInfo(
    videoIds: string[]
  ): Record<string, VideoAccessInfo | null> {
    if (this.isExpired()) {
      return {};
    }

    const result: Record<string, VideoAccessInfo | null> = {};
    videoIds.forEach((videoId) => {
      result[videoId] = this.videoAccessMap.get(videoId) || null;
    });
    return result;
  }

  /**
   * Get all cached video access information
   * @returns Array of VideoAccessInfo objects
   */
  getAllVideoAccessInfo(): VideoAccessInfo[] {
    if (this.isExpired()) {
      return [];
    }
    return Array.from(this.videoAccessMap.values());
  }

  /**
   * Get the last access time as a timestamp string for a video
   * @param videoId YouTube video ID
   * @returns ISO timestamp string or null
   */
  getLastAccessTime(videoId: string): string | null {
    const accessInfo = this.getVideoAccessInfo(videoId);
    return accessInfo?.lastAccessTime || null;
  }

  /**
   * Get the last access info for a specific document
   * @param documentId Document ID
   * @returns DocumentAccessInfo or null if not found
   */
  getDocumentAccessInfo(documentId: string): DocumentAccessInfo | null {
    if (this.isExpired()) {
      return null;
    }
    return this.documentAccessMap.get(documentId) || null;
  }

  /**
   * Get the last access info for multiple documents
   * @param documentIds Array of document IDs
   * @returns Record mapping document IDs to their access info
   */
  getMultipleDocumentAccessInfo(
    documentIds: string[]
  ): Record<string, DocumentAccessInfo | null> {
    if (this.isExpired()) {
      return {};
    }

    const result: Record<string, DocumentAccessInfo | null> = {};
    documentIds.forEach((documentId) => {
      result[documentId] = this.documentAccessMap.get(documentId) || null;
    });
    return result;
  }

  /**
   * Get the last access time as a timestamp string for a document
   * @param documentId Document ID
   * @returns ISO timestamp string or null
   */
  getDocumentLastAccessTime(documentId: string): string | null {
    const accessInfo = this.getDocumentAccessInfo(documentId);
    return accessInfo?.lastAccessTime || null;
  }

  /**
   * Get last access times for multiple documents as timestamp strings
   * @param documentIds Array of document IDs
   * @returns Record mapping document IDs to their last access timestamps
   */
  getDocumentLastAccessTimes(
    documentIds: string[]
  ): Record<string, string | null> {
    const accessInfoMap = this.getMultipleDocumentAccessInfo(documentIds);
    const result: Record<string, string | null> = {};

    Object.entries(accessInfoMap).forEach(([documentId, accessInfo]) => {
      result[documentId] = accessInfo?.lastAccessTime || null;
    });

    return result;
  }

  /**
   * Get last access times for multiple videos as timestamp strings
   * @param videoIds Array of YouTube video IDs
   * @returns Record mapping video IDs to their last access timestamps
   */
  getLastAccessTimes(videoIds: string[]): Record<string, string | null> {
    const accessInfoMap = this.getMultipleVideoAccessInfo(videoIds);
    const result: Record<string, string | null> = {};

    Object.entries(accessInfoMap).forEach(([videoId, accessInfo]) => {
      result[videoId] = accessInfo?.lastAccessTime || null;
    });

    return result;
  }

  /**
   * Check if the cache has expired
   * @returns true if cache is expired, false otherwise
   */
  isExpired(): boolean {
    return Date.now() - this.lastUpdated > this.CACHE_DURATION;
  }

  /**
   * Check if the cache is empty
   * @returns true if cache is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.videoAccessMap.size === 0 && this.documentAccessMap.size === 0;
  }

  /**
   * Get the number of cached access records
   * @returns number of cached records (videos + documents)
   */
  size(): number {
    return this.videoAccessMap.size + this.documentAccessMap.size;
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.videoAccessMap.clear();
    this.documentAccessMap.clear();
    this.lastUpdated = 0;
  }

  /**
   * Get cache statistics
   * @returns object with cache statistics
   */
  getStats(): {
    size: number;
    videoCount: number;
    documentCount: number;
    lastUpdated: number;
    isExpired: boolean;
    cacheAge: number;
  } {
    return {
      size: this.size(),
      videoCount: this.videoAccessMap.size,
      documentCount: this.documentAccessMap.size,
      lastUpdated: this.lastUpdated,
      isExpired: this.isExpired(),
      cacheAge: Date.now() - this.lastUpdated,
    };
  }

  /**
   * Format a timestamp for display
   * @param timestamp ISO timestamp string
   * @returns formatted date string
   */
  static formatTimestamp(timestamp: string): string {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid Date";
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   * @param timestamp ISO timestamp string
   * @returns relative time string
   */
  static getRelativeTime(timestamp: string): string {
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return "Just now";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error calculating relative time:", error);
      return "Unknown";
    }
  }
}

// Create a singleton instance for global use
export const userActivityCache = new UserActivityCache();

// Utility functions for common operations
export const updateUserActivityCache = (activities: UserActivity[]): void => {
  userActivityCache.updateCache(activities);
};

export const getVideoLastAccessTime = (videoId: string): string | null => {
  return userActivityCache.getLastAccessTime(videoId);
};

export const getVideoLastAccessTimes = (
  videoIds: string[]
): Record<string, string | null> => {
  return userActivityCache.getLastAccessTimes(videoIds);
};

export const getVideoAccessInfo = (videoId: string): VideoAccessInfo | null => {
  return userActivityCache.getVideoAccessInfo(videoId);
};

export const getMultipleVideoAccessInfo = (
  videoIds: string[]
): Record<string, VideoAccessInfo | null> => {
  return userActivityCache.getMultipleVideoAccessInfo(videoIds);
};

export const getDocumentLastAccessTime = (
  documentId: string
): string | null => {
  return userActivityCache.getDocumentLastAccessTime(documentId);
};

export const getDocumentLastAccessTimes = (
  documentIds: string[]
): Record<string, string | null> => {
  return userActivityCache.getDocumentLastAccessTimes(documentIds);
};

export const getDocumentAccessInfo = (
  documentId: string
): DocumentAccessInfo | null => {
  return userActivityCache.getDocumentAccessInfo(documentId);
};

export const getMultipleDocumentAccessInfo = (
  documentIds: string[]
): Record<string, DocumentAccessInfo | null> => {
  return userActivityCache.getMultipleDocumentAccessInfo(documentIds);
};
