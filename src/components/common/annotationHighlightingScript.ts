export interface AnnotationHighlight {
  id: string;
  data: {
    selected_text: string;
    start_position?: number;
    end_position?: number;
    comment?: string;
    secondary_comment?: string;
    tags?: string[];
  };
}

export interface ProcessedHtmlResult {
  html: string;
  highlightsAdded: number;
}

/**
 * Helper function to determine highlight color based on tags
 */
function getHighlightColorForAnnotation(
  tags: string[] | undefined,
  getTagColor?: (tag: string) => string
): string {
  if (!tags || tags.length === 0 || !getTagColor) {
    return "#ffeb3b"; // Default yellow color
  }

  // For now, use the color of the first tag
  // Future enhancement: could implement color blending for multiple tags
  return getTagColor(tags[0]);
}

export const processHtmlWithHighlights = (
  htmlContent: string,
  annotations: AnnotationHighlight[],
  getTagColor?: (tag: string) => string
): ProcessedHtmlResult => {
  console.log("Processing HTML with", annotations.length, "annotations");
  console.log("HTML content length:", htmlContent.length);
  console.log(
    "Annotations:",
    annotations.map((a) => ({
      id: a.id,
      selected_text: a.data.selected_text,
      selected_text_length: a.data.selected_text?.length || 0,
    }))
  );

  // Log the first few characters of each annotation text for debugging
  annotations.forEach((annotation, index) => {
    if (annotation.data.selected_text) {
      console.log(
        `Annotation ${index + 1} text preview: "${annotation.data.selected_text.substring(0, 100)}..."`
      );
    }
  });

  let processedHtml = htmlContent;
  let highlightsAdded = 0;

  // Add selection script to the HTML
  const selectionScript = `
    <script>
      (function() {
        let lastSelection = '';
        
        // Capture selection on mouseup
        document.addEventListener('mouseup', function(e) {
          const selection = window.getSelection();
          if (selection && selection.toString().trim()) {
            lastSelection = selection.toString().trim();
            console.log('Selection captured in iframe:', lastSelection);
          }
        });
        
        // Function to get text position in the document
        function getTextPosition(selection) {
          if (!selection.rangeCount) return null;
          
          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const endContainer = range.endContainer;
          
          // Get the document's text content up to the selection
          const documentText = document.body.textContent || document.body.innerText || '';
          
          // Calculate start position
          let startPos = 0;
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let node;
          while (node = walker.nextNode()) {
            if (node === startContainer) {
              startPos += range.startOffset;
              break;
            }
            startPos += node.textContent.length;
          }
          
          // Calculate end position
          let endPos = 0;
          const endWalker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          while (node = endWalker.nextNode()) {
            if (node === endContainer) {
              endPos += range.endOffset;
              break;
            }
            endPos += node.textContent.length;
          }
          
          return { start: startPos, end: endPos };
        }
        
        // Capture selection on contextmenu
        document.addEventListener('contextmenu', function(e) {
          const selection = window.getSelection();
          if (selection && selection.toString().trim()) {
            const selectedText = selection.toString().trim();
            const position = getTextPosition(selection);
            
            lastSelection = selectedText;
            console.log('Context menu selection in iframe:', selectedText);
            console.log('Selection position:', position);
            
            // Send message to parent
            window.parent.postMessage({
              type: 'iframe-selection',
              selection: selectedText,
              startPosition: position ? position.start : null,
              endPosition: position ? position.end : null,
              x: e.clientX,
              y: e.clientY
            }, '*');
          }
        });
        
        // Expose function to get last selection
        window.getLastSelection = function() {
          return lastSelection;
        };
      })();
    </script>
  `;

  // Insert the script before the closing </head> tag
  if (processedHtml.includes("</head>")) {
    processedHtml = processedHtml.replace(
      "</head>",
      `${selectionScript}</head>`
    );
  } else {
    // If no head tag, add it after the opening body tag
    processedHtml = processedHtml.replace("<body>", `<body>${selectionScript}`);
  }

  // Add highlighting for annotations
  if (annotations.length > 0) {
    annotations.forEach((annotation) => {
      if (annotation.data && annotation.data.selected_text) {
        const searchText = annotation.data.selected_text;
        const annotationId = annotation.id;
        const startPosition = annotation.data.start_position;
        const endPosition = annotation.data.end_position;
        const tags = annotation.data.tags;

        // Determine highlight color based on tags
        const highlightColor = getHighlightColorForAnnotation(tags, getTagColor);

        // Create the highlighted span
        const highlightedSpan = `<span class="annotation-highlight" data-annotation-id="${annotationId}" style="background-color: ${highlightColor}; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;" onclick="window.parent.postMessage({type: 'show-annotation', annotationId: '${annotationId}'}, '*')">${searchText}</span>`;

        console.log(
          `Processing annotation: "${searchText}" at positions ${startPosition}-${endPosition}`
        );

        if (startPosition !== undefined && endPosition !== undefined) {
          // Position-based highlighting
          // We need to find the text nodes and highlight the specific range
          const highlightScript = `
            <script>
              (function() {
                function highlightTextRange(startPos, endPos, annotationId) {
                  const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                  );
                  
                  let currentPos = 0;
                  let node;
                  let startNode = null;
                  let startOffset = 0;
                  let endNode = null;
                  let endOffset = 0;
                  
                  // Find start and end nodes
                  while (node = walker.nextNode()) {
                    const nodeLength = node.textContent.length;
                    
                    if (!startNode && currentPos + nodeLength > startPos) {
                      startNode = node;
                      startOffset = startPos - currentPos;
                    }
                    
                    if (!endNode && currentPos + nodeLength >= endPos) {
                      endNode = node;
                      endOffset = endPos - currentPos;
                      break;
                    }
                    
                    currentPos += nodeLength;
                  }
                  
                  if (startNode && endNode) {
                    const range = document.createRange();
                    range.setStart(startNode, startOffset);
                    range.setEnd(endNode, endOffset);
                    
                    const span = document.createElement('span');
                    span.className = 'annotation-highlight';
                    span.setAttribute('data-annotation-id', annotationId);
                    span.style.cssText = 'background-color: ${highlightColor}; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;';
                    span.onclick = function() {
                      window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');
                    };
                    
                    range.surroundContents(span);
                    return true;
                  }
                  
                  return false;
                }
                
                // Highlight this annotation
                highlightTextRange(${startPosition}, ${endPosition}, '${annotationId}');
              })();
            </script>
          `;

          // Insert the highlighting script
          if (processedHtml.includes("</body>")) {
            processedHtml = processedHtml.replace(
              "</body>",
              `${highlightScript}</body>`
            );
          } else {
            processedHtml = processedHtml.replace(
              "</html>",
              `${highlightScript}</html>`
            );
          }

          highlightsAdded++;
        } else {
          // Fallback to text-based search for backward compatibility
          console.log("No position data available, using fallback text search");
          const normalizedSearchText = searchText.replace(/\s+/g, " ").trim();

          const searchPattern = normalizedSearchText
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            .replace(/\s+/g, "\\s*<[^>]*>\\s*");

          let regex = new RegExp(searchPattern, "gi");
          let matches = processedHtml.match(regex);

          if (!matches || matches.length === 0) {
            const flexibleSearchText = normalizedSearchText
              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
              .replace(/\s+/g, "\\s+");
            regex = new RegExp(flexibleSearchText, "gi");
            matches = processedHtml.match(regex);
          }

          if (matches && matches.length > 0) {
            processedHtml = processedHtml.replace(regex, (match) => {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = match;
              const textContent =
                tempDiv.textContent || tempDiv.innerText || "";
              return match.replace(textContent, highlightedSpan);
            });
            highlightsAdded += matches.length;
          }
        }
      }
    });
  }

  console.log("HTML processing complete, highlights added:", highlightsAdded);
  return { html: processedHtml, highlightsAdded };
};
