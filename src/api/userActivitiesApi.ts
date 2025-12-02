import { supabase } from "../utils/supabaseClient";

export interface ResourceReference {
  resourceType: string;
  resourceId: string;
}

export interface UserActivityContext {
  [key: string]: any;
  resource?: ResourceReference;
}

export interface UserActivity {
  id: string;
  user_id: string;
  timestamp: string;
  activity_id: string;
  context?: UserActivityContext; // JSONB field for additional context data
  log?: string;
}

export interface CreateUserActivityParams {
  activity_id: string;
  context?: UserActivityContext;
  log?: string;
  user_id?: string; // Optional, will use auth.uid() if not provided
}

export interface UpdateUserActivityParams {
  id: string;
  activity_id?: string;
  context?: UserActivityContext;
  log?: string;
}

export interface ListUserActivitiesParams {
  userId?: string;
  activityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface UserActivityStats {
  total: number;
  byActivityId: Record<string, number>;
  byDate: Record<string, number>;
}

// Create a new user activity
export async function createUserActivity(
  params: CreateUserActivityParams
): Promise<UserActivity> {
  console.log("createUserActivity called with params:", params);

  // Get current user to ensure we have a valid user_id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Error getting current user:", authError);
    throw new Error("User not authenticated");
  }

  if (!user) {
    console.error("No authenticated user found");
    throw new Error("User not authenticated");
  }

  const insertData = {
    activity_id: params.activity_id,
    context: params.context || null,
    log: params.log || null,
    user_id: params.user_id || user.id,
  };

  console.log("Inserting data to user_activity table:", insertData);
  console.log("Current user:", { id: user.id, email: user.email });

  const { data, error } = await supabase
    .from("user_activity")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating user activity:", error);
    throw error;
  }

  console.log("User activity created successfully:", data);
  return data;
}

// Get a single user activity by id
export async function getUserActivity(id: string): Promise<UserActivity> {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update a user activity
export async function updateUserActivity(
  params: UpdateUserActivityParams
): Promise<UserActivity> {
  const updateData: Partial<UserActivity> = {};

  if (params.activity_id !== undefined)
    updateData.activity_id = params.activity_id;
  if (params.context !== undefined) updateData.context = params.context;
  if (params.log !== undefined) updateData.log = params.log;

  const { data, error } = await supabase
    .from("user_activity")
    .update(updateData)
    .eq("id", params.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a user activity
export async function deleteUserActivity(id: string): Promise<void> {
  const { error } = await supabase.from("user_activity").delete().eq("id", id);

  if (error) throw error;
}

// List user activities with optional filters
export async function listUserActivities(
  params: ListUserActivitiesParams = {}
): Promise<UserActivity[]> {
  let query = supabase
    .from("user_activity")
    .select("*")
    .order("timestamp", { ascending: false });

  if (params.userId) {
    query = query.eq("user_id", params.userId);
  }

  if (params.activityId) {
    query = query.eq("activity_id", params.activityId);
  }

  if (params.startDate) {
    query = query.gte("timestamp", params.startDate);
  }

  if (params.endDate) {
    query = query.lte("timestamp", params.endDate);
  }

  if (params.offset !== undefined) {
    // Use range() when offset is provided (handles both offset and limit)
    const limit = params.limit || 50;
    query = query.range(params.offset, params.offset + limit - 1);
  } else if (params.limit) {
    // Use limit() only when no offset is provided
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Get user activities with pagination support (returns data and pagination info)
export interface GetUserActivitiesParams {
  userId: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  activityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetUserActivitiesResult {
  data: UserActivity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getUserActivities(
  params: GetUserActivitiesParams
): Promise<GetUserActivitiesResult> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const offset = (page - 1) * pageSize;

  // Build the query
  let query = supabase
    .from("user_activity")
    .select("*", { count: "exact" })
    .eq("user_id", params.userId);

  // Add optional filters
  if (params.activityId) {
    query = query.eq("activity_id", params.activityId);
  }

  if (params.startDate) {
    query = query.gte("timestamp", params.startDate);
  }

  if (params.endDate) {
    query = query.lte("timestamp", params.endDate);
  }

  // Add sorting
  const sortBy = params.sortBy || "timestamp";
  const sortOrder = params.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Add pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching user activities:", error);
    throw error;
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    data: data || [],
    total,
    page,
    pageSize,
    totalPages,
  };
}

// Get user activities by activity ID
export async function getUserActivitiesByActivityId(
  activityId: string,
  userId?: string
): Promise<UserActivity[]> {
  const params: ListUserActivitiesParams = {
    activityId,
    userId,
  };
  return listUserActivities(params);
}

// Get recent user activities
export async function getRecentUserActivities(
  userId?: string,
  limit: number = 50
): Promise<UserActivity[]> {
  const params: ListUserActivitiesParams = {
    userId,
    limit,
  };
  return listUserActivities(params);
}

// Get user activity statistics
export async function getUserActivityStats(
  userId?: string,
  startDate?: string,
  endDate?: string
): Promise<UserActivityStats> {
  let query = supabase.from("user_activity").select("activity_id, timestamp");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (startDate) {
    query = query.gte("timestamp", startDate);
  }

  if (endDate) {
    query = query.lte("timestamp", endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  const activities = data || [];
  const byActivityId: Record<string, number> = {};
  const byDate: Record<string, number> = {};

  activities.forEach((activity: any) => {
    // Count by activity ID
    byActivityId[activity.activity_id] =
      (byActivityId[activity.activity_id] || 0) + 1;

    // Count by date (YYYY-MM-DD format)
    const date = new Date(activity.timestamp).toISOString().split("T")[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  return {
    total: activities.length,
    byActivityId,
    byDate,
  };
}

// Log a simple activity (convenience function)
export async function logActivity(
  activityId: string,
  log?: string,
  context?: UserActivityContext
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    log,
    context,
  });
}

// Log YouTube video interactions
export async function logYouTubeActivity(
  activityId: string,
  videoId: string,
  timestamp?: number,
  context?: UserActivityContext
): Promise<UserActivity> {
  if (!context) {
    context = {};
  }

  if (!context.resource) {
    context.resource = { resourceType: "youtube_video", resourceId: videoId };
  }

  console.log("logYouTubeActivity called with:", {
    activityId,
    videoId,
    timestamp,
    context,
  });

  const activityData = {
    activity_id: activityId,
    context: {
      ...context,
      video_id: videoId,
      timestamp,
    },
    log: `YouTube ${activityId} - Video: ${videoId}${timestamp ? ` at ${timestamp}s` : ""}`,
  };

  console.log("Creating user activity with data:", activityData);

  const result = await createUserActivity(activityData);
  console.log("User activity created successfully:", result);

  return result;
}

// Log document interactions
export async function logDocumentActivity(
  activityId: string,
  documentId: string,
  context?: UserActivityContext
): Promise<UserActivity> {
  if (!context) {
    context = {};
  }

  if (!context.resource) {
    context.resource = { resourceType: "document", resourceId: documentId };
  }

  console.log("logDocumentActivity called with:", {
    activityId,
    documentId,
    context,
  });

  const activityData = {
    activity_id: activityId,
    context: {
      ...context,
      document_id: documentId,
    },
    log: `Document ${activityId} - ID: ${documentId}`,
  };

  console.log("Creating document activity with data:", activityData);

  const result = await createUserActivity(activityData);
  console.log("Document activity created successfully:", result);

  return result;
}

// Log annotation interactions
export async function logAnnotationActivity(
  activityId: string,
  annotationId: string,
  context?: any
): Promise<UserActivity> {
  return createUserActivity({
    activity_id: activityId,
    context: {
      annotation_id: annotationId,
      ...context,
    },
    log: `Annotation ${activityId} - ID: ${annotationId}`,
  });
}

// Delete old activities (cleanup function)
export async function deleteOldActivities(
  olderThanDays: number = 30,
  userId?: string
): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  let query = supabase
    .from("user_activity")
    .delete()
    .lt("timestamp", cutoffDate.toISOString());

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) throw error;

  // Note: Supabase doesn't return count of deleted rows directly
  // This would need to be handled differently in a real implementation
  return { deletedCount: 0 };
}

// Get activity timeline (activities grouped by day)
export async function getActivityTimeline(
  userId?: string,
  days: number = 30
): Promise<Record<string, UserActivity[]>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const activities = await listUserActivities({
    userId,
    startDate: startDate.toISOString(),
  });

  // Group activities by date
  const timeline: Record<string, UserActivity[]> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp).toISOString().split("T")[0];
    if (!timeline[date]) {
      timeline[date] = [];
    }
    timeline[date].push(activity);
  });

  return timeline;
}

// Search activities by log content
export async function searchUserActivities(
  searchTerm: string,
  userId?: string,
  limit: number = 50
): Promise<UserActivity[]> {
  if (!searchTerm.trim()) {
    return [];
  }

  let query = supabase
    .from("user_activity")
    .select("*")
    .ilike("log", `%${searchTerm}%`)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching user activities:", error);
    throw error;
  }

  return data || [];
}
