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
      // Don't trigger hotkeys when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const pressedKey = event.key.toLowerCase();

      for (const hotkey of hotkeys) {
        const keyMatches = hotkey.key.toLowerCase() === pressedKey;
        console.log("Hotkey debug:", {
          pressedKey,
          hotkeyKey: hotkey.key.toLowerCase(),
          keyMatches,
          ctrlKey: { expected: hotkey.ctrlKey, actual: event.ctrlKey },
          metaKey: { expected: hotkey.metaKey, actual: event.metaKey },
          shiftKey: { expected: hotkey.shiftKey, actual: event.shiftKey },
          altKey: { expected: hotkey.altKey, actual: event.altKey },
        });
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
