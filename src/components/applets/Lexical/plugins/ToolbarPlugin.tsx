import { getColor, useTheme } from "@aesgraph/app-shell";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType, $wrapNodes } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Download,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  ListOrdered,
  List as ListUl,
  Quote,
  Redo,
  Save,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import React from "react";

interface ToolbarPluginProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const ToolbarPlugin: React.FC<ToolbarPluginProps> = ({
  onSave,
  onExport,
}) => {
  const [editor] = useLexicalComposerContext();
  const { theme } = useTheme();

  // Helper function to determine text color based on background luminance
  const getTextColor = () => {
    const backgroundColor = getColor(theme.colors, "surface");
    const getLuminance = (color: string): number => {
      const rgbaMatch = color.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
      );
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch.map(Number);
        return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
      }
      const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (hexMatch) {
        const r = parseInt(hexMatch[1], 16);
        const g = parseInt(hexMatch[2], 16);
        const b = parseInt(hexMatch[3], 16);
        return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
      }
      return 0;
    };
    const luminance = getLuminance(backgroundColor);
    return luminance < 0.1 ? "#ffffff" : getColor(theme.colors, "text");
  };

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  };

  const formatCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  const formatAlignLeft = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
  };

  const formatAlignCenter = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
  };

  const formatAlignRight = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
  };

  const formatAlignJustify = () => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
  };

  const insertOrderedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const insertUnorderedList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const undo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const redo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div
      className="toolbar"
      style={{
        backgroundColor: getColor(theme.colors, "surface"),
        borderBottom: `1px solid ${getColor(theme.colors, "border")}`,
      }}
    >
      <div className="toolbar-left">
        <button
          onClick={undo}
          className="toolbar-item"
          title="Undo"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Undo size={16} />
        </button>
        <button
          onClick={redo}
          className="toolbar-item"
          title="Redo"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Redo size={16} />
        </button>
        <div
          className="divider"
          style={{
            backgroundColor: getColor(theme.colors, "border"),
          }}
        />
        <button
          onClick={() => formatHeading("h1")}
          className="toolbar-item"
          title="Heading 1"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => formatHeading("h2")}
          className="toolbar-item"
          title="Heading 2"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => formatHeading("h3")}
          className="toolbar-item"
          title="Heading 3"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Heading3 size={16} />
        </button>
        <button
          onClick={formatParagraph}
          className="toolbar-item"
          title="Paragraph"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <span>¶</span>
        </button>
        <div
          className="divider"
          style={{
            backgroundColor: getColor(theme.colors, "border"),
          }}
        />
        <button
          onClick={formatBold}
          className="toolbar-item"
          title="Bold"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={formatItalic}
          className="toolbar-item"
          title="Italic"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Italic size={16} />
        </button>
        <button
          onClick={formatUnderline}
          className="toolbar-item"
          title="Underline"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Underline size={16} />
        </button>
        <button
          onClick={formatStrikethrough}
          className="toolbar-item"
          title="Strikethrough"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={formatCode}
          className="toolbar-item"
          title="Code"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Code size={16} />
        </button>
        <div
          className="divider"
          style={{
            backgroundColor: getColor(theme.colors, "border"),
          }}
        />
        <button
          onClick={insertOrderedList}
          className="toolbar-item"
          title="Ordered List"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={insertUnorderedList}
          className="toolbar-item"
          title="Bulleted List"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <ListUl size={16} />
        </button>
        <button
          onClick={formatQuote}
          className="toolbar-item"
          title="Quote"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Quote size={16} />
        </button>
        <div
          className="divider"
          style={{
            backgroundColor: getColor(theme.colors, "border"),
          }}
        />
        <button
          onClick={formatAlignLeft}
          className="toolbar-item"
          title="Align Left"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={formatAlignCenter}
          className="toolbar-item"
          title="Align Center"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={formatAlignRight}
          className="toolbar-item"
          title="Align Right"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={formatAlignJustify}
          className="toolbar-item"
          title="Justify"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <AlignJustify size={16} />
        </button>
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-right">
        <button
          onClick={onSave}
          className="toolbar-item"
          title="Save document"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Save size={16} />
        </button>
        <button
          onClick={onExport}
          className="toolbar-item"
          title="Export as Markdown"
          style={{
            color: getTextColor(),
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};
