import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode } from "lexical";
import type { JSX } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { useTagStore } from "../../../../store/tagStore";
import { $createTagNode, $isTagNode } from "../nodes/TagNode";

// Simplified regex for :: tag matching
const TagMentionsRegex = /(^|\s|\()(::([a-zA-Z0-9_-]*))$/;

// At most, 8 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 8;

const tagsCache = new Map();

// Tag lookup service that uses the tag store
const tagLookupService = {
  search(string: string, callback: (results: Array<string>) => void): void {
    try {
      // Get all tags from the tag store
      const { getAllTags, initializeTagColors, getTagColor } =
        useTagStore.getState();
      let allTags = getAllTags();

      console.log("TagAutocompletePlugin: Available tags:", allTags);
      if (allTags.length > 0) {
        console.log("TagAutocompletePlugin: Sample tag colors:");
        allTags.slice(0, 3).forEach((tag) => {
          const color = getTagColor(tag);
          console.log(`  ${tag}: ${color}`);
        });
      }

      // If no tags are available, initialize with some sample tags
      if (allTags.length === 0) {
        console.log(
          "TagAutocompletePlugin: No tags in store, initializing sample tags"
        );

        const sampleTags = [
          "project",
          "task",
          "idea",
          "note",
          "important",
          "urgent",
          "review",
          "complete",
          "in-progress",
          "blocked",
          "research",
          "meeting",
          "follow-up",
          "bug",
          "feature",
        ];

        // Initialize the tag store with sample tags and colors
        initializeTagColors(sampleTags);

        // Also set some specific colors for testing
        sampleTags.forEach((tag, index) => {
          const hue = (index * 25) % 360; // Spread colors around the hue wheel
          const color = `hsl(${hue}, 70%, 60%)`;
          const { setTagColor } = useTagStore.getState();
          setTagColor(tag, color);
        });

        allTags = sampleTags;
      }

      // Filter tags based on search string
      const results = allTags.filter((tag) =>
        tag.toLowerCase().includes(string.toLowerCase())
      );

      console.log("TagAutocompletePlugin: Searching for tags:", {
        searchString: string,
        allTags,
        results,
      });

      callback(results);
    } catch (error) {
      console.log(
        "TagAutocompletePlugin: Error accessing tag store, using fallback tags"
      );

      // Fallback tags for testing when tag store is not available
      const fallbackTags = [
        "project",
        "task",
        "idea",
        "note",
        "important",
        "urgent",
        "review",
        "complete",
        "in-progress",
        "blocked",
      ];

      const results = fallbackTags.filter((tag) =>
        tag.toLowerCase().includes(string.toLowerCase())
      );

      console.log("TagAutocompletePlugin: Using fallback tags:", {
        searchString: string,
        fallbackTags,
        results,
      });

      callback(results);
    }
  },
};

function useTagLookupService(tagString: string | null) {
  const [results, setResults] = useState<Array<string>>([]);

  useEffect(() => {
    const cachedResults = tagsCache.get(tagString);

    if (tagString == null) {
      setResults([]);
      return;
    }

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    tagsCache.set(tagString, null);
    tagLookupService.search(tagString, (newResults) => {
      tagsCache.set(tagString, newResults);
      setResults(newResults);
    });
  }, [tagString]);

  return results;
}

function checkForTagMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  const match = TagMentionsRegex.exec(text);

  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];
    const fullMatch = match[2]; // The full ::tag part
    const matchingString = match[3]; // Just the tag part after ::

    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: fullMatch,
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForTagMentions(text, 1);
}

class TagTypeaheadOption extends MenuOption {
  name: string;
  color: string;

  constructor(name: string, color: string) {
    super(name);
    this.name = name;
    this.color = color;
  }
}

// React is required for JSX elements in this component
function TagTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: TagTypeaheadOption;
}) {
  // React is used implicitly for JSX
  return React.createElement(
    "li",
    {
      key: option.key,
      tabIndex: -1,
      ref: option.setRefElement,
      role: "option",
      "aria-selected": isSelected,
      id: "tag-typeahead-item-" + index,
      onMouseEnter: onMouseEnter,
      onClick: onClick,
      className: `tag-mentions-menu-item ${isSelected ? "selected" : ""}`,
    },
    [
      React.createElement("span", {
        key: "color",
        className: "tag-color-indicator",
        style: { backgroundColor: option.color },
      }),
      React.createElement(
        "span",
        {
          key: "text",
          className: "tag-mentions-menu-item-text",
        },
        option.name
      ),
    ]
  );
}

export default function TagAutocompletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const { getTagColor } = useTagStore();

  const [queryString, setQueryString] = useState<string | null>(null);

  const results = useTagLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    return results
      .map((result) => {
        const color = getTagColor(result);
        return new TagTypeaheadOption(result, color);
      })
      .slice(0, SUGGESTION_LIST_LENGTH_LIMIT);
  }, [results, getTagColor]);

  const onSelectOption = useCallback(
    (
      selectedOption: TagTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        // Replace the ::<tag> with a colored tag node
        if (nodeToReplace) {
          console.log(
            "TagAutocompletePlugin: Creating tag node for:",
            selectedOption.name
          );

          try {
            const tagNode = $createTagNode(selectedOption.name);
            console.log("TagAutocompletePlugin: Created tag node:", tagNode);
            console.log(
              "TagAutocompletePlugin: Is tag node?",
              $isTagNode(tagNode)
            );
            console.log(
              "TagAutocompletePlugin: Tag node type:",
              tagNode.getType()
            );
            console.log(
              "TagAutocompletePlugin: Node to replace:",
              nodeToReplace
            );
            console.log(
              "TagAutocompletePlugin: Node to replace type:",
              nodeToReplace.getType()
            );

            // Replace the node
            console.log("TagAutocompletePlugin: Attempting to replace node");
            nodeToReplace.replace(tagNode);
            console.log("TagAutocompletePlugin: Successfully replaced node");

            // Check if replacement worked
            console.log(
              "TagAutocompletePlugin: After replacement, tag node parent:",
              tagNode.getParent()
            );

            tagNode.select();
          } catch (error) {
            console.error(
              "TagAutocompletePlugin: Error creating or replacing tag node:",
              error
            );

            // Fallback: create a simple text node
            console.log("TagAutocompletePlugin: Falling back to text node");
            const textNode = new TextNode(selectedOption.name);
            nodeToReplace.replace(textNode);
            textNode.select();
          }
        }
        closeMenu();
      });
    },
    [editor]
  );

  const checkForTagMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<TagTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTagMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <div className="tag-mentions-menu">
                <ul className="tag-mentions-menu-list">
                  {options.map((option, i: number) => (
                    <TagTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i);
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
