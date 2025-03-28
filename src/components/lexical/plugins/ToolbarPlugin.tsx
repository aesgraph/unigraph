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
    <div className="toolbar">
      <div className="toolbar-left">
        <button onClick={undo} className="toolbar-item" title="Undo">
          <Undo size={16} />
        </button>
        <button onClick={redo} className="toolbar-item" title="Redo">
          <Redo size={16} />
        </button>
        <div className="divider" />
        <button
          onClick={() => formatHeading("h1")}
          className="toolbar-item"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => formatHeading("h2")}
          className="toolbar-item"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => formatHeading("h3")}
          className="toolbar-item"
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>
        <button
          onClick={formatParagraph}
          className="toolbar-item"
          title="Paragraph"
        >
          <span>¶</span>
        </button>
        <div className="divider" />
        <button onClick={formatBold} className="toolbar-item" title="Bold">
          <Bold size={16} />
        </button>
        <button onClick={formatItalic} className="toolbar-item" title="Italic">
          <Italic size={16} />
        </button>
        <button
          onClick={formatUnderline}
          className="toolbar-item"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button
          onClick={formatStrikethrough}
          className="toolbar-item"
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button onClick={formatCode} className="toolbar-item" title="Code">
          <Code size={16} />
        </button>
        <div className="divider" />
        <button
          onClick={insertOrderedList}
          className="toolbar-item"
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={insertUnorderedList}
          className="toolbar-item"
          title="Bulleted List"
        >
          <ListUl size={16} />
        </button>
        <button onClick={formatQuote} className="toolbar-item" title="Quote">
          <Quote size={16} />
        </button>
        <div className="divider" />
        <button
          onClick={formatAlignLeft}
          className="toolbar-item"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={formatAlignCenter}
          className="toolbar-item"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={formatAlignRight}
          className="toolbar-item"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          onClick={formatAlignJustify}
          className="toolbar-item"
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>
      </div>
      <div className="toolbar-spacer" />
      <div className="toolbar-right">
        <button onClick={onSave} className="toolbar-item" title="Save document">
          <Save size={16} />
        </button>
        <button
          onClick={onExport}
          className="toolbar-item"
          title="Export as Markdown"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};
