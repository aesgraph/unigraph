import { create } from "zustand";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  groupId?: string; // Add optional group ID
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2);

    set((state) => {
      let notifications = [...state.notifications];

      // If notification has a groupId, remove any existing notifications in that group
      if (notification.groupId) {
        notifications = notifications.filter(
          (n) => n.groupId !== notification.groupId
        );
      }

      return {
        notifications: [...notifications, { ...notification, id }],
      };
    });

    // Auto remove after duration
    setTimeout(() => {
      useNotificationStore.getState().removeNotification(id);
    }, notification.duration || 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

// Example usage helper
export const addNotification = (notification: Omit<Notification, "id">) => {
  useNotificationStore.getState().addNotification(notification);
};

export const addGroupedNotification = (
  message: string,
  type: NotificationType,
  groupId: string,
  duration?: number
) => {
  useNotificationStore.getState().addNotification({
    message,
    type,
    groupId,
    duration,
  });
};

export default useNotificationStore;
