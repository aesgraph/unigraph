import { getColor, useTheme } from "@aesgraph/app-shell";
import React, { useEffect, useState } from "react";
import { getUserActivities, UserActivity } from "../../api/userActivitiesApi";
import { useAuth } from "../../hooks/useAuth";

interface UserActivityLogsViewProps {
  // Standard props that all views receive
  resourceId?: string;
  url?: string;
  title?: string;
}

const UserActivityLogsView: React.FC<UserActivityLogsViewProps> = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(50);

  // Load user activities
  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getUserActivities({
          userId: user.id,
          page,
          pageSize,
          sortBy: "timestamp",
          sortOrder: "desc", // Most recent first
        });

        setActivities(result.data);
      } catch (err) {
        console.error("Failed to load user activities:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load activities"
        );
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [user?.id, page, pageSize]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Format context data for display
  const formatContext = (context: any): string => {
    if (!context) return "";

    try {
      // If it's an object, show key-value pairs
      if (typeof context === "object") {
        const pairs = Object.entries(context)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        return pairs || "{}";
      }

      return String(context);
    } catch {
      return String(context);
    }
  };

  // Handle page navigation
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (activities.length === pageSize) {
      setPage(page + 1);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "text"),
        }}
      >
        <div>Loading user activity logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "error"),
          padding: theme.sizes.spacing.lg,
        }}
      >
        <div style={{ fontSize: "18px", marginBottom: theme.sizes.spacing.md }}>
          Error Loading Activity Logs
        </div>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>{error}</div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          backgroundColor: getColor(theme.colors, "background"),
          color: getColor(theme.colors, "textSecondary"),
        }}
      >
        <div>Please sign in to view your activity logs.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: getColor(theme.colors, "background"),
        color: getColor(theme.colors, "text"),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.sizes.spacing.lg,
          borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
          backgroundColor: getColor(theme.colors, "surface"),
        }}
      >
        <h2 style={{ margin: 0, color: getColor(theme.colors, "text") }}>
          User Activity Logs
        </h2>
        <p
          style={{
            margin: `${theme.sizes.spacing.sm} 0 0 0`,
            color: getColor(theme.colors, "textSecondary"),
            fontSize: "14px",
          }}
        >
          Track your engagement and activity across the platform
        </p>
      </div>

      {/* Content */}
      <div
        style={{ flex: 1, overflow: "auto", padding: theme.sizes.spacing.lg }}
      >
        {activities.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              color: getColor(theme.colors, "textSecondary"),
            }}
          >
            <div>No activity logs found.</div>
          </div>
        ) : (
          <>
            {/* Activity Table */}
            <div
              style={{
                backgroundColor: getColor(theme.colors, "surface"),
                borderRadius: theme.sizes.borderRadius.md,
                overflow: "hidden",
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: getColor(
                        theme.colors,
                        "backgroundSecondary"
                      ),
                      borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
                    }}
                  >
                    <th
                      style={{
                        padding: theme.sizes.spacing.md,
                        textAlign: "left",
                        color: getColor(theme.colors, "text"),
                        fontWeight: 600,
                        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        padding: theme.sizes.spacing.md,
                        textAlign: "left",
                        color: getColor(theme.colors, "text"),
                        fontWeight: 600,
                        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                      }}
                    >
                      Activity
                    </th>
                    <th
                      style={{
                        padding: theme.sizes.spacing.md,
                        textAlign: "left",
                        color: getColor(theme.colors, "text"),
                        fontWeight: 600,
                        borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                      }}
                    >
                      Context
                    </th>
                    <th
                      style={{
                        padding: theme.sizes.spacing.md,
                        textAlign: "left",
                        color: getColor(theme.colors, "text"),
                        fontWeight: 600,
                      }}
                    >
                      Log Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr
                      key={activity.id}
                      style={{
                        borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
                        backgroundColor:
                          index % 2 === 0
                            ? getColor(theme.colors, "surface")
                            : getColor(theme.colors, "backgroundSecondary"),
                      }}
                    >
                      <td
                        style={{
                          padding: theme.sizes.spacing.md,
                          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                          color: getColor(theme.colors, "textSecondary"),
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {formatTimestamp(activity.timestamp)}
                      </td>
                      <td
                        style={{
                          padding: theme.sizes.spacing.md,
                          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                          color: getColor(theme.colors, "text"),
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: getColor(theme.colors, "info"),
                            color: getColor(theme.colors, "background"),
                            padding: "2px 8px",
                            borderRadius: theme.sizes.borderRadius.sm,
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {activity.activity_id}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: theme.sizes.spacing.md,
                          borderRight: `1px solid ${getColor(theme.colors, "border")}`,
                          color: getColor(theme.colors, "textSecondary"),
                          fontSize: "12px",
                          maxWidth: "300px",
                          wordBreak: "break-word",
                        }}
                      >
                        {formatContext(activity.context)}
                      </td>
                      <td
                        style={{
                          padding: theme.sizes.spacing.md,
                          color: getColor(theme.colors, "textSecondary"),
                          fontSize: "12px",
                          maxWidth: "400px",
                          wordBreak: "break-word",
                        }}
                      >
                        {activity.log || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: theme.sizes.spacing.lg,
                padding: theme.sizes.spacing.md,
                backgroundColor: getColor(theme.colors, "surface"),
                borderRadius: theme.sizes.borderRadius.md,
                border: `1px solid ${getColor(theme.colors, "border")}`,
              }}
            >
              <div
                style={{
                  color: getColor(theme.colors, "textSecondary"),
                  fontSize: "14px",
                }}
              >
                Page {page} • {activities.length} activities shown
              </div>
              <div style={{ display: "flex", gap: theme.sizes.spacing.sm }}>
                <button
                  onClick={handlePreviousPage}
                  disabled={page <= 1}
                  style={{
                    padding: `${theme.sizes.spacing.sm} ${theme.sizes.spacing.md}`,
                    backgroundColor:
                      page <= 1
                        ? getColor(theme.colors, "surfaceHover")
                        : getColor(theme.colors, "primary"),
                    color:
                      page <= 1
                        ? getColor(theme.colors, "textMuted")
                        : getColor(theme.colors, "background"),
                    border: "none",
                    borderRadius: theme.sizes.borderRadius.sm,
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={activities.length < pageSize}
                  style={{
                    padding: `${theme.sizes.spacing.sm} ${theme.sizes.spacing.md}`,
                    backgroundColor:
                      activities.length < pageSize
                        ? getColor(theme.colors, "surfaceHover")
                        : getColor(theme.colors, "primary"),
                    color:
                      activities.length < pageSize
                        ? getColor(theme.colors, "textMuted")
                        : getColor(theme.colors, "background"),
                    border: "none",
                    borderRadius: theme.sizes.borderRadius.sm,
                    cursor:
                      activities.length < pageSize ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserActivityLogsView;
