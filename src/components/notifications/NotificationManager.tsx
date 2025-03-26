import { X } from "lucide-react";
import React from "react";
import useNotificationStore from "../../store/notificationStore";
import "./Notifications.css";

const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationManager;
