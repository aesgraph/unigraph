import { X } from "lucide-react";
import React, { useEffect } from "react";
import styles from "./EntitiesContainerDialog.module.css";
import EntitiesContainerDisplayCard, {
  EntitiesContainerDisplayCardProps,
} from "./EntitiesContainerDisplayCard";

export interface EntitiesContainerDialogProps
  extends EntitiesContainerDisplayCardProps {
  isOpen: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
}

const EntitiesContainerDialog: React.FC<EntitiesContainerDialogProps> = ({
  isOpen,
  onClose,
  showCloseButton = true,
  onCancel,
  ...displayCardProps
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle cancel with both onCancel and onClose
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.dialog}>
        {showCloseButton && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        )}
        <EntitiesContainerDisplayCard
          {...displayCardProps}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EntitiesContainerDialog;
