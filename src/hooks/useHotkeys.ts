import { useEffect } from "react";

export interface HotkeyAction {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

export const useHotkeys = (hotkeys: HotkeyAction[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input fields or editors
      const target = event.target as Element;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        // Check for contentEditable elements (Monaco Editor uses these)
        (target as HTMLElement).isContentEditable ||
        // Check if we're inside Monaco Editor specifically
        target.closest(".monaco-editor") ||
        target.closest('[class*="monaco"]') ||
        // Check for any contentEditable ancestors
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }

      const pressedKey = event.key.toLowerCase();

      for (const hotkey of hotkeys) {
        const keyMatches = hotkey.key.toLowerCase() === pressedKey;
        const ctrlMatches =
          hotkey.ctrlKey === undefined
            ? !event.ctrlKey
            : hotkey.ctrlKey === event.ctrlKey;
        const metaMatches =
          hotkey.metaKey === undefined
            ? !event.metaKey
            : hotkey.metaKey === event.metaKey;
        const shiftMatches =
          hotkey.shiftKey === undefined
            ? !event.shiftKey
            : hotkey.shiftKey === event.shiftKey;
        const altMatches =
          hotkey.altKey === undefined
            ? !event.altKey
            : hotkey.altKey === event.altKey;

        if (
          keyMatches &&
          ctrlMatches &&
          metaMatches &&
          shiftMatches &&
          altMatches
        ) {
          event.preventDefault();
          hotkey.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeys]);
};

// Helper function to create hotkey actions
export const createHotkey = (
  key: string,
  action: () => void,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    description?: string;
  } = {}
): HotkeyAction => ({
  key,
  action,
  ...options,
});

// Platform-aware hotkey helpers
export const isMac = () => navigator.platform.toLowerCase().includes("mac");

export const cmdOrCtrl = (
  action: () => void,
  key: string,
  options: Omit<HotkeyAction, "key" | "action" | "metaKey" | "ctrlKey"> = {}
) => {
  if (isMac()) {
    return createHotkey(key, action, { metaKey: true, ...options });
  } else {
    return createHotkey(key, action, { ctrlKey: true, ...options });
  }
};
