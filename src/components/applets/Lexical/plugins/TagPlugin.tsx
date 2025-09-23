import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";

// RegExp to find hashtags in text
const HASHTAG_REGEX = /(^|\s)(#[a-zA-Z0-9_-]+)/g;

interface TagPluginProps {
  onTagsChange?: (tags: string[]) => void;
}

export function TagPlugin({ onTagsChange }: TagPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // Function to extract hashtags from text
    const extractTags = (text: string): string[] => {
      const matches = text.match(HASHTAG_REGEX);
      if (!matches) return [];

      // Clean up the hashtags (remove spaces, get unique values)
      const extractedTags = matches
        .map((match) => match.trim())
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => tag.substring(1)) // Remove the # character
        .filter((tag, index, self) => self.indexOf(tag) === index); // Get unique tags

      return extractedTags;
    };

    // Register listener for text changes
    const removeTextListener = editor.registerTextContentListener(
      (textContent) => {
        const newTags = extractTags(textContent);
        if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
          setTags(newTags);
          onTagsChange?.(newTags);
        }
      }
    );

    // Clean up
    return () => {
      removeTextListener();
    };
  }, [editor, tags, onTagsChange]);

  return null;
}
