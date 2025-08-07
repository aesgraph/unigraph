// Note: This file uses its own implementation instead of the utility functions
// to provide better control over the highlighting process within iframe contexts
//
// Enhanced with improved text node mapping and highlighting using best practices:
// ✅ Uses TreeWalker for efficient text node traversal
// ✅ Builds comprehensive text index mapping
// ✅ Supports both position-based and text-based highlighting
// ✅ Handles complex HTML structures (tables, links, nested elements)
// ✅ Includes fuzzy matching for better text finding
// ✅ Robust error handling and fallback mechanisms
// ✅ Optimized for cross-browser compatibility

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
  annotationScripts: string[];
}

/**
 * Generate the enhanced selection script as a function
 */
function generateSelectionScript(): string {
  return `
    <script>
      (function() {
        let lastSelection = '';
        let lastSelectionRange = null;
        
        // Enhanced selection capture with position tracking
        function captureSelectionWithPosition() {
          const selection = window.getSelection();
          if (!selection || !selection.toString().trim()) return null;
          
          const selectedText = selection.toString().trim();
          const range = selection.getRangeAt(0);
          
          console.log('Capturing selection:', {
            text: selectedText,
            startContainer: range.startContainer.nodeName,
            endContainer: range.endContainer.nodeName,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            rangeContent: range.toString()
          });
          
          // Calculate position in document text
          const position = calculateTextPosition(range);
          console.log('Calculated position:', position);
          
          return {
            text: selectedText,
            range: range,
            position: position
          };
        }
        
        // Calculate text position using TreeWalker - Enhanced for multi-element selections
        function calculateTextPosition(range) {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                const parent = node.parentElement;
                // Improved visibility check
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                // Check computed style for better visibility detection
                const style = window.getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                  return NodeFilter.FILTER_REJECT;
                }
                
                if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                
                const tagName = parent.tagName.toLowerCase();
                if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                  return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
              },
            }
          );
          
          let currentPos = 0;
          let startPos = null;
          let endPos = null;
          let node;
          
          // Build a complete map of text nodes and their positions
          const textNodeMap = [];
          while (node = walker.nextNode()) {
            const nodeLength = node.textContent.length;
            textNodeMap.push({
              node: node,
              start: currentPos,
              end: currentPos + nodeLength
            });
            currentPos += nodeLength;
          }
          
          // Find start and end positions for the range
          for (let i = 0; i < textNodeMap.length; i++) {
            const mapItem = textNodeMap[i];
            
            // Check if this is the start container
            if (mapItem.node === range.startContainer) {
              startPos = mapItem.start + range.startOffset;
            }
            
            // Check if this is the end container
            if (mapItem.node === range.endContainer) {
              endPos = mapItem.start + range.endOffset;
              break; // Found both start and end
            }
            
            // Handle case where start and end are the same node
            if (mapItem.node === range.startContainer && mapItem.node === range.endContainer) {
              startPos = mapItem.start + range.startOffset;
              endPos = mapItem.start + range.endOffset;
              break;
            }
          }
          
          // Fallback: if we couldn't find exact positions, calculate based on range content
          if (startPos === null || endPos === null) {
            console.warn('Could not calculate exact positions, using fallback method');
            
            // Try to find the range content in the full text
            const rangeText = range.toString();
            if (rangeText) {
              // Rebuild full text to search in
              let fullText = '';
              for (let i = 0; i < textNodeMap.length; i++) {
                fullText += textNodeMap[i].node.textContent;
              }
              
              const normalizedRangeText = rangeText.replace(/\\s+/g, ' ').trim();
              const normalizedFullText = fullText.replace(/\\s+/g, ' ');
              const foundIndex = normalizedFullText.indexOf(normalizedRangeText);
              
              if (foundIndex !== -1) {
                startPos = foundIndex;
                endPos = foundIndex + normalizedRangeText.length;
              }
            }
          }
          
          return startPos !== null && endPos !== null ? {
            start: startPos,
            end: endPos,
            rangeText: range.toString(),
            success: true
          } : null;
        }
        
        // Capture selection on mouseup
        document.addEventListener('mouseup', function(e) {
          const selectionData = captureSelectionWithPosition();
          if (selectionData) {
            lastSelection = selectionData.text;
            lastSelectionRange = selectionData.range;
            console.log('Enhanced selection captured:', selectionData);
          }
        });
        
        // Capture selection on contextmenu
        document.addEventListener('contextmenu', function(e) {
          const selectionData = captureSelectionWithPosition();
          if (selectionData) {
            lastSelection = selectionData.text;
            lastSelectionRange = selectionData.range;
            
            // Send message to parent with position data
            window.parent.postMessage({
              type: 'iframe-selection',
              selection: selectionData.text,
              startPosition: selectionData.position ? selectionData.position.start : null,
              endPosition: selectionData.position ? selectionData.position.end : null,
              x: e.clientX,
              y: e.clientY
            }, '*');
          }
        });
        
        // Expose functions for external use
        window.getLastSelection = function() {
          return lastSelection;
        };
        
        window.getLastSelectionRange = function() {
          return lastSelectionRange;
        };
        
        // Helper function to calculate text similarity (simple Levenshtein-based)
        function calculateSimilarity(str1, str2) {
          if (str1 === str2) return 1.0;
          if (str1.length === 0 || str2.length === 0) return 0.0;
          
          const matrix = [];
          for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
          }
          for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
          }
          
          for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
              if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
              } else {
                matrix[i][j] = Math.min(
                  matrix[i - 1][j - 1] + 1,
                  matrix[i][j - 1] + 1,
                  matrix[i - 1][j] + 1
                );
              }
            }
          }
          
          const maxLength = Math.max(str1.length, str2.length);
          return (maxLength - matrix[str2.length][str1.length]) / maxLength;
        }
        
        // Helper function to get all visible text nodes
        function getVisibleTextNodes(root) {
          root = root || document.body;
          const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: function(node) {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                // Check if element is actually visible
                const style = window.getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                  return NodeFilter.FILTER_REJECT;
                }
                
                if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                
                const tagName = parent.tagName.toLowerCase();
                if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                  return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
              },
            }
          );
          
          const textNodes = [];
          while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
          }
          return textNodes;
        }
        
        // Helper function to build text index map
        function buildTextIndexMap(root) {
          const textNodes = getVisibleTextNodes(root);
          const map = [];
          let fullText = '';
          let offset = 0;
          
          for (let i = 0; i < textNodes.length; i++) {
            const node = textNodes[i];
            const text = node.textContent;
            const start = offset;
            const end = start + text.length;
            
            fullText += text;
            map.push({ 
              node: node, 
              start: start, 
              end: end,
              nodeIndex: i
            });
            
            offset = end;
          }
          
          return { fullText: fullText, map: map };
        }
        
        // Enhanced function to highlight text range across multiple nodes
        function highlightTextRange(startIndex, endIndex, map, annotationId, highlightClass, highlightStyle) {
          const ranges = [];
          
          // Find all nodes that overlap with the target range
          for (let i = 0; i < map.length; i++) {
            const mapItem = map[i];
            const node = mapItem.node;
            const start = mapItem.start;
            const end = mapItem.end;
            
            // Skip nodes that don't overlap
            if (end <= startIndex || start >= endIndex) continue;
            
            const overlapStart = Math.max(start, startIndex);
            const overlapEnd = Math.min(end, endIndex);
            
            const nodeStartOffset = overlapStart - start;
            const nodeEndOffset = overlapEnd - start;
            
            ranges.push({
              node: node,
              startOffset: nodeStartOffset,
              endOffset: nodeEndOffset,
              globalStart: overlapStart,
              globalEnd: overlapEnd
            });
          }
          
          // Sort ranges by document position to avoid conflicts
          ranges.sort(function(a, b) {
            const position = a.node.compareDocumentPosition(b.node);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return a.startOffset - b.startOffset;
          });
          
          let highlightedRanges = 0;
          
          // Apply highlights in reverse order to avoid offset issues
          for (let i = ranges.length - 1; i >= 0; i--) {
            const range = ranges[i];
            
            try {
              // Verify the node is still in the document
              if (!document.contains(range.node)) continue;
              
              const domRange = document.createRange();
              domRange.setStart(range.node, range.startOffset);
              domRange.setEnd(range.node, range.endOffset);
              
              // Only proceed if the range has content
              const rangeContent = domRange.toString().trim();
              if (rangeContent) {
                try {
                  // Try the standard surroundContents approach first
                  const span = document.createElement('mark');
                  span.className = highlightClass;
                  span.setAttribute('data-annotation-id', annotationId);
                  span.style.cssText = highlightStyle;
                  span.onclick = function() {
                    window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');
                  };
                  
                  domRange.surroundContents(span);
                  highlightedRanges++;
                } catch (surroundError) {
                  // surroundContents failed, use manual text splitting approach
                  console.log('surroundContents failed, using text splitting approach:', surroundError);
                  
                  const text = range.node.textContent;
                  if (text && range.startOffset < text.length && range.endOffset <= text.length) {
                    const beforeText = text.substring(0, range.startOffset);
                    const highlightText = text.substring(range.startOffset, range.endOffset);
                    const afterText = text.substring(range.endOffset);
                    
                    if (highlightText.trim()) {
                      const parent = range.node.parentNode;
                      const span = document.createElement('mark');
                      span.className = highlightClass;
                      span.setAttribute('data-annotation-id', annotationId);
                      span.style.cssText = highlightStyle;
                      span.textContent = highlightText;
                      span.onclick = function() {
                        window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');
                      };
                      
                      // Create text nodes for before and after
                      const fragment = document.createDocumentFragment();
                      
                      if (beforeText) {
                        fragment.appendChild(document.createTextNode(beforeText));
                      }
                      fragment.appendChild(span);
                      if (afterText) {
                        fragment.appendChild(document.createTextNode(afterText));
                      }
                      
                      // Replace the original text node
                      parent.replaceChild(fragment, range.node);
                      highlightedRanges++;
                    }
                  }
                }
              }
            } catch (error) {
              console.warn('Failed to apply highlight range:', error);
              // Try an even more aggressive fallback for cross-element content
              try {
                const text = range.node.textContent;
                if (text && range.startOffset < text.length && range.endOffset <= text.length) {
                  const beforeText = text.substring(0, range.startOffset);
                  const highlightText = text.substring(range.startOffset, range.endOffset);
                  const afterText = text.substring(range.endOffset);
                  
                  if (highlightText.trim()) {
                    const parent = range.node.parentNode;
                    if (parent) {
                      // Create the highlight span
                      const span = document.createElement('mark');
                      span.className = highlightClass;
                      span.setAttribute('data-annotation-id', annotationId);
                      span.style.cssText = highlightStyle;
                      span.textContent = highlightText;
                      span.onclick = function() {
                        window.parent.postMessage({type: 'show-annotation', annotationId: annotationId}, '*');
                      };
                      
                      // Insert new nodes in order
                      if (beforeText) {
                        const beforeNode = document.createTextNode(beforeText);
                        parent.insertBefore(beforeNode, range.node);
                      }
                      parent.insertBefore(span, range.node);
                      if (afterText) {
                        const afterNode = document.createTextNode(afterText);
                        parent.insertBefore(afterNode, range.node);
                      }
                      
                      // Remove the original node
                      parent.removeChild(range.node);
                      highlightedRanges++;
                    }
                  }
                }
              } catch (fallbackError) {
                console.warn('All highlighting approaches failed:', fallbackError);
              }
            }
          }
          
          return highlightedRanges;
        }

        // Enhanced annotation highlighting function
        window.highlightAnnotation = function(annotationId, searchText, options) {
          const highlightClass = options.highlightClass || 'annotation-highlight';
          const highlightStyle = options.highlightStyle || 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;';
          
          try {
            // Remove existing highlights for this annotation
            const existingHighlights = document.querySelectorAll('.' + highlightClass + '[data-annotation-id="' + annotationId + '"]');
            existingHighlights.forEach(function(highlight) {
              const parent = highlight.parentNode;
              if (parent) {
                parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
                parent.normalize();
              }
            });
            
            // Build comprehensive text index map
            const { fullText, map } = buildTextIndexMap();
            
            // Normalize text for better matching
            const normalizedSearchText = searchText.replace(/\\s+/g, ' ').trim();
            const normalizedFullText = fullText.replace(/\\s+/g, ' ');
            
            if (!normalizedSearchText) {
              console.log('Empty search text for annotation:', annotationId);
              return false;
            }
            
            // Find matches using improved search with cross-element support
            const matches = [];
            
            // Try exact match first
            let searchIndex = normalizedFullText.indexOf(normalizedSearchText);
            while (searchIndex !== -1) {
              matches.push({
                startIndex: searchIndex,
                endIndex: searchIndex + normalizedSearchText.length,
                text: normalizedFullText.substring(searchIndex, searchIndex + normalizedSearchText.length),
                type: 'exact'
              });
              searchIndex = normalizedFullText.indexOf(normalizedSearchText, searchIndex + 1);
            }
            
            // If no exact matches, try case-insensitive regex with word boundaries
            if (matches.length === 0) {
              try {
                // Escape regex special characters
                const specialChars = ['\\\\', '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']'];
                let escapedSearchText = normalizedSearchText;
                for (let i = 0; i < specialChars.length; i++) {
                  const char = specialChars[i];
                  escapedSearchText = escapedSearchText.split(char).join('\\\\' + char);
                }
                
                // Try multiple regex patterns for better matching
                const patterns = [
                  new RegExp(escapedSearchText, 'gi'), // Exact escaped match
                  new RegExp(escapedSearchText.replace(/\\s+/g, '\\\\s+'), 'gi'), // Allow flexible whitespace
                ];
                
                for (let p = 0; p < patterns.length; p++) {
                  const searchRegex = patterns[p];
                  let match;
                  while ((match = searchRegex.exec(normalizedFullText)) !== null) {
                    // Check if this match overlaps with existing matches
                    const hasOverlap = matches.some(existingMatch => 
                      match.index < existingMatch.endIndex && match.index + match[0].length > existingMatch.startIndex
                    );
                    
                    if (!hasOverlap) {
                      matches.push({
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        text: match[0],
                        type: 'regex',
                        pattern: p
                      });
                    }
                    
                    // Prevent infinite loop on zero-length matches
                    if (match[0].length === 0) {
                      searchRegex.lastIndex++;
                    }
                  }
                  
                  // If we found matches with this pattern, don't try more complex ones
                  if (matches.length > 0) break;
                }
              } catch (regexError) {
                console.warn('Regex search failed, trying word-based search:', regexError);
                
                // Enhanced fallback: word-based search with cross-element support
                const searchWords = normalizedSearchText.split(/\\s+/).filter(word => word.length > 0);
                if (searchWords.length > 0) {
                  // Try to find sequences of words that might be split across elements
                  for (let wordStart = 0; wordStart < searchWords.length; wordStart++) {
                    const firstWord = searchWords[wordStart];
                    let wordIndex = normalizedFullText.indexOf(firstWord);
                    
                    while (wordIndex !== -1) {
                      // Try to match the full phrase starting from this word
                      let potentialEndIndex = wordIndex + firstWord.length;
                      let matchedWords = 1;
                      
                      // Try to match subsequent words with flexible spacing
                      for (let nextWordIdx = wordStart + 1; nextWordIdx < searchWords.length; nextWordIdx++) {
                        const nextWord = searchWords[nextWordIdx];
                        
                        // Look for the next word within a reasonable distance (allowing for markup)
                        const maxGap = 50; // Allow up to 50 characters between words (for markup)
                        const searchStart = potentialEndIndex;
                        const searchEnd = Math.min(searchStart + maxGap, normalizedFullText.length);
                        const searchSegment = normalizedFullText.substring(searchStart, searchEnd);
                        
                        const nextWordPos = searchSegment.indexOf(nextWord);
                        if (nextWordPos !== -1) {
                          potentialEndIndex = searchStart + nextWordPos + nextWord.length;
                          matchedWords++;
                        } else {
                          break; // Couldn't find the next word
                        }
                      }
                      
                      // If we matched most of the words, consider it a fuzzy match
                      if (matchedWords >= Math.max(1, Math.floor(searchWords.length * 0.7))) {
                        const potentialMatch = normalizedFullText.substring(wordIndex, potentialEndIndex);
                        const similarity = calculateSimilarity(potentialMatch.replace(/\\s+/g, ' '), normalizedSearchText);
                        
                        if (similarity > 0.6) { // Lower threshold for cross-element matches
                          matches.push({
                            startIndex: wordIndex,
                            endIndex: potentialEndIndex,
                            text: potentialMatch,
                            type: 'fuzzy-cross-element',
                            similarity: similarity,
                            matchedWords: matchedWords,
                            totalWords: searchWords.length
                          });
                        }
                      }
                      
                      wordIndex = normalizedFullText.indexOf(firstWord, wordIndex + 1);
                    }
                  }
                }
              }
            }
            
            if (matches.length === 0) {
              console.log('No matches found for annotation:', annotationId, 'Search text:', normalizedSearchText);
              console.log('Full text preview (first 200 chars):', normalizedFullText.substring(0, 200) + '...');
              console.log('Full text preview (last 200 chars):', '...' + normalizedFullText.substring(Math.max(0, normalizedFullText.length - 200)));
              console.log('Search text details:', {
                originalText: searchText,
                normalizedText: normalizedSearchText,
                textLength: normalizedSearchText.length,
                fullTextLength: normalizedFullText.length
              });
              return false;
            }
            
            console.log('Found', matches.length, 'matches for annotation:', annotationId);
            console.log('Match details:', matches.map(m => ({
              type: m.type,
              startIndex: m.startIndex,
              endIndex: m.endIndex,
              text: m.text.substring(0, 50) + (m.text.length > 50 ? '...' : ''),
              similarity: m.similarity
            })));
            
            // Apply highlights using the enhanced highlighting function
            let totalHighlights = 0;
            for (let i = 0; i < matches.length; i++) {
              const match = matches[i];
              const highlighted = highlightTextRange(
                match.startIndex, 
                match.endIndex, 
                map, 
                annotationId, 
                highlightClass, 
                highlightStyle
              );
              totalHighlights += highlighted;
            }
            
            console.log('Applied', totalHighlights, 'highlight ranges for annotation', annotationId);
            return totalHighlights > 0;
          } catch (error) {
            console.error('Error highlighting annotation:', error);
            return false;
          }
        };
        
        // Position-based highlighting function for when we have exact positions
        window.highlightAnnotationByPosition = function(annotationId, startPosition, endPosition, options) {
          const highlightClass = options.highlightClass || 'annotation-highlight';
          const highlightStyle = options.highlightStyle || 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;';
          
          try {
            // Remove existing highlights for this annotation
            const existingHighlights = document.querySelectorAll('.' + highlightClass + '[data-annotation-id="' + annotationId + '"]');
            existingHighlights.forEach(function(highlight) {
              const parent = highlight.parentNode;
              if (parent) {
                parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
                parent.normalize();
              }
            });
            
            // Build text index map
            const { fullText, map } = buildTextIndexMap();
            
            // Validate positions
            if (startPosition < 0 || endPosition > fullText.length || startPosition >= endPosition) {
              console.warn('Invalid positions for annotation:', annotationId, 'start:', startPosition, 'end:', endPosition, 'text length:', fullText.length);
              console.log('Position details:', {
                startPosition,
                endPosition,
                fullTextLength: fullText.length,
                isStartValid: startPosition >= 0,
                isEndValid: endPosition <= fullText.length,
                isRangeValid: startPosition < endPosition,
                expectedText: fullText.substring(startPosition, endPosition)
              });
              return false;
            }
            
            console.log('Position-based highlighting for annotation:', annotationId, {
              startPosition,
              endPosition,
              fullTextLength: fullText.length,
              expectedText: fullText.substring(startPosition, Math.min(endPosition, startPosition + 100))
            });
            
            // Apply highlight using position data
            const highlightedRanges = highlightTextRange(
              startPosition, 
              endPosition, 
              map, 
              annotationId, 
              highlightClass, 
              highlightStyle
            );
            
            console.log('Applied', highlightedRanges, 'position-based highlight ranges for annotation', annotationId);
            return highlightedRanges > 0;
          } catch (error) {
            console.error('Error in position-based highlighting:', error);
            return false;
          }
        };
        
        // Remove highlights function
        window.removeAnnotationHighlights = function(annotationId) {
          const highlights = document.querySelectorAll('.annotation-highlight[data-annotation-id="' + annotationId + '"]');
          highlights.forEach(function(highlight) {
            const parent = highlight.parentNode;
            if (parent) {
              parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
              parent.normalize();
            }
          });
        };
        
        // Utility function to get text content preview for debugging
        window.getTextContentPreview = function(maxLength) {
          maxLength = maxLength || 500;
          const { fullText } = buildTextIndexMap();
          return {
            length: fullText.length,
            preview: fullText.substring(0, maxLength) + (fullText.length > maxLength ? '...' : ''),
            wordCount: fullText.split(/\\s+/).length
          };
        };
        
        // Utility function to find text position
        window.findTextPosition = function(searchText) {
          const { fullText } = buildTextIndexMap();
          const normalizedSearch = searchText.replace(/\\s+/g, ' ').trim();
          const normalizedFull = fullText.replace(/\\s+/g, ' ');
          
          const position = normalizedFull.indexOf(normalizedSearch);
          return {
            found: position !== -1,
            startPosition: position,
            endPosition: position + normalizedSearch.length,
            context: position !== -1 ? 
              normalizedFull.substring(Math.max(0, position - 50), position + normalizedSearch.length + 50) : 
              null
          };
        };

      })();
    </script>
  `;
}

/**
 * Generate annotation highlighting script
 */
function generateAnnotationScript(
  annotationId: string,
  searchText: string,
  startPosition?: number,
  endPosition?: number
): string {
  const escapedSearchText = searchText.replace(/'/g, "\\'");

  // Use position-based highlighting if positions are available
  if (startPosition !== undefined && endPosition !== undefined) {
    return `
      <script>
        (function() {
          function attemptPositionHighlight() {
            if (typeof window.highlightAnnotationByPosition === 'function') {
              try {
                const result = window.highlightAnnotationByPosition('${annotationId}', ${startPosition}, ${endPosition}, {
                  highlightClass: 'annotation-highlight',
                  highlightStyle: 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;'
                });
                console.log('Position-based highlighting result for ${annotationId}:', result);
                
                // If position-based highlighting fails, fall back to text search
                if (!result && typeof window.highlightAnnotation === 'function') {
                  console.log('Position-based highlighting failed, falling back to text search for ${annotationId}');
                  const fallbackResult = window.highlightAnnotation('${annotationId}', '${escapedSearchText}', {
                    highlightClass: 'annotation-highlight',
                    highlightStyle: 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;'
                  });
                  console.log('Fallback highlighting result for ${annotationId}:', fallbackResult);
                }
              } catch (error) {
                console.error('Error in position-based highlighting for ${annotationId}:', error);
                // Try text-based fallback
                if (typeof window.highlightAnnotation === 'function') {
                  try {
                    window.highlightAnnotation('${annotationId}', '${escapedSearchText}', {
                      highlightClass: 'annotation-highlight',
                      highlightStyle: 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;'
                    });
                  } catch (fallbackError) {
                    console.error('Fallback highlighting also failed for ${annotationId}:', fallbackError);
                  }
                }
              }
            } else {
              setTimeout(attemptPositionHighlight, 100);
            }
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attemptPositionHighlight);
          } else {
            attemptPositionHighlight();
          }
        })();
      </script>
    `;
  } else {
    // Fallback to text-based highlighting
    return `
      <script>
        (function() {
          function attemptHighlight() {
            if (typeof window.highlightAnnotation === 'function') {
              try {
                const result = window.highlightAnnotation('${annotationId}', '${escapedSearchText}', {
                  highlightClass: 'annotation-highlight',
                  highlightStyle: 'background-color: #ffeb3b; cursor: pointer; border-radius: 2px; padding: 1px 2px; transition: background-color 0.2s ease;'
                });
                console.log('Text-based highlighting result for ${annotationId}:', result);
              } catch (error) {
                console.error('Error highlighting annotation ${annotationId}:', error);
              }
            } else {
              setTimeout(attemptHighlight, 100);
            }
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attemptHighlight);
          } else {
            attemptHighlight();
          }
        })();
      </script>
    `;
  }
}

/**
 * Enhanced annotation highlighting that uses advanced text selection matching
 * This provides much better accuracy when dealing with complex HTML markup
 */
export const processHtmlWithEnhancedHighlights = (
  htmlContent: string,
  annotations: AnnotationHighlight[]
): ProcessedHtmlResult => {
  console.log(
    "Processing HTML with enhanced highlighting for",
    annotations.length,
    "annotations"
  );
  console.log("HTML content length:", htmlContent.length);
  console.log("HTML structure check:", {
    hasHead: htmlContent.includes("<head>"),
    hasHeadClose: htmlContent.includes("</head>"),
    hasBody: htmlContent.includes("<body>"),
    hasBodyClose: htmlContent.includes("</body>"),
    hasHtml: htmlContent.includes("<html>"),
    htmlPreview: htmlContent.substring(0, 300),
  });

  let processedHtml = htmlContent;
  let highlightsAdded = 0;
  const annotationScripts: string[] = [];

  // Add enhanced selection script to the HTML
  const selectionScript = generateSelectionScript();
  console.log("Generated selection script length:", selectionScript.length);
  console.log("Selection script preview:", selectionScript.substring(0, 200));

  // Insert the script before the closing </head> tag
  if (processedHtml.includes("</head>")) {
    processedHtml = processedHtml.replace(
      "</head>",
      `${selectionScript}</head>`
    );
    console.log("Inserted selection script before </head>");
  } else if (processedHtml.includes("<body>")) {
    // If no head tag, add it after the opening body tag
    processedHtml = processedHtml.replace("<body>", `<body>${selectionScript}`);
    console.log("Inserted selection script after <body>");
  } else {
    // Fallback: add at the beginning
    processedHtml = selectionScript + processedHtml;
    console.log("Inserted selection script at beginning");
  }

  // Add highlighting for annotations
  if (annotations.length > 0) {
    annotations.forEach((annotation) => {
      if (annotation.data && annotation.data.selected_text) {
        const searchText = annotation.data.selected_text;
        const annotationId = annotation.id;
        const startPosition = annotation.data.start_position;
        const endPosition = annotation.data.end_position;

        console.log(
          `Processing annotation: "${searchText}" at positions ${startPosition}-${endPosition}`
        );

        if (startPosition !== undefined && endPosition !== undefined) {
          // Use position-based highlighting with enhanced accuracy
          const highlightScript = generateAnnotationScript(
            annotationId,
            searchText,
            startPosition,
            endPosition
          );
          console.log(
            "Generated annotation script for",
            annotationId,
            "length:",
            highlightScript.length
          );

          // Insert the highlighting script
          if (processedHtml.includes("</body>")) {
            processedHtml = processedHtml.replace(
              "</body>",
              `${highlightScript}</body>`
            );
            console.log("Inserted annotation script before </body>");
          } else if (processedHtml.includes("</html>")) {
            processedHtml = processedHtml.replace(
              "</html>",
              `${highlightScript}</html>`
            );
            console.log("Inserted annotation script before </html>");
          } else {
            // Fallback: add at the end
            processedHtml = processedHtml + highlightScript;
            console.log("Appended annotation script at end");
          }

          annotationScripts.push(highlightScript);
          highlightsAdded++;
        } else {
          // Fallback to text-based search with enhanced matching
          console.log("No position data available, using enhanced text search");

          const highlightScript = generateAnnotationScript(
            annotationId,
            searchText
          );
          console.log(
            "Generated fallback annotation script for",
            annotationId,
            "length:",
            highlightScript.length
          );

          // Insert the highlighting script
          if (processedHtml.includes("</body>")) {
            processedHtml = processedHtml.replace(
              "</body>",
              `${highlightScript}</body>`
            );
            console.log("Inserted fallback annotation script before </body>");
          } else if (processedHtml.includes("</html>")) {
            processedHtml = processedHtml.replace(
              "</html>",
              `${highlightScript}</html>`
            );
            console.log("Inserted fallback annotation script before </html>");
          } else {
            // Fallback: add at the end
            processedHtml = processedHtml + highlightScript;
            console.log("Appended fallback annotation script at end");
          }

          annotationScripts.push(highlightScript);
          highlightsAdded++;
        }
      }
    });
  }

  console.log(
    "Enhanced HTML processing complete, highlights added:",
    highlightsAdded
  );
  return {
    html: processedHtml,
    highlightsAdded,
    annotationScripts,
  };
};

/**
 * Legacy function for backward compatibility
 * This maintains the same interface as the original processHtmlWithHighlights
 */
export const processHtmlWithHighlights = (
  htmlContent: string,
  annotations: AnnotationHighlight[]
): ProcessedHtmlResult => {
  return processHtmlWithEnhancedHighlights(htmlContent, annotations);
};
