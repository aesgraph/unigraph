/**
 * Debug utility to test cross-element annotation highlighting
 * 
 * This file provides functions to test and debug cross-element highlighting issues.
 */

// Extend window interface for our custom functions
declare global {
  interface Window {
    highlightAnnotation?: (id: string, text: string, options: any) => boolean;
    highlightAnnotationByPosition?: (id: string, start: number, end: number, options: any) => boolean;
    getTextContentPreview?: (length?: number) => { length: number; preview: string; wordCount: number };
    findTextPosition?: (text: string) => { found: boolean; startPosition: number; endPosition: number; context: string | null };
    debugAnnotationHighlighting?: () => void;
    testSpecificHighlight?: (text: string, usePosition?: boolean, start?: number, end?: number) => string;
    cleanupTestHighlights?: () => void;
  }
}

export function debugAnnotationHighlighting() {
  console.log('=== Annotation Highlighting Debug ===');
  
  // Test 1: Check if highlighting functions are available
  console.log('1. Function availability:');
  console.log('  - highlightAnnotation:', typeof window.highlightAnnotation);
  console.log('  - highlightAnnotationByPosition:', typeof window.highlightAnnotationByPosition);
  console.log('  - getTextContentPreview:', typeof window.getTextContentPreview);
  console.log('  - findTextPosition:', typeof window.findTextPosition);
  
  // Test 2: Get text content preview
  if (typeof window.getTextContentPreview === 'function') {
    console.log('2. Text content preview:');
    const preview = window.getTextContentPreview(500);
    console.log('  - Full text length:', preview.length);
    console.log('  - Word count:', preview.wordCount);
    console.log('  - Preview:', preview.preview.substring(0, 200));
  }
  
  // Test 3: Test cross-element text finding
  if (typeof window.findTextPosition === 'function') {
    console.log('3. Cross-element text position tests:');
    
    const testCases = [
      'text with a hyperlink',  // Should span text -> link
      'hyperlink in the',       // Should span link -> text
      'some text with a hyperlink in the middle', // Full span
      'bold text and italic',   // Span bold -> text -> italic
      'Cell 1 with some',       // Span across table cells
    ];
    
    testCases.forEach((text, index) => {
      const result = window.findTextPosition?.(text);
      console.log(`  Test ${index + 1} - "${text}":`, result);
    });
  }
  
  // Test 4: Manual highlighting test
  console.log('4. Manual highlighting tests:');
  
  if (typeof window.highlightAnnotation === 'function') {
    const testText = 'text with a hyperlink';
    const testId = 'debug-test-' + Date.now();
    
    console.log(`  Testing highlight for: "${testText}"`);
    const result = window.highlightAnnotation(testId, testText, {
      highlightClass: 'debug-highlight',
      highlightStyle: 'background-color: #ff9999; border: 2px solid red; padding: 2px;'
    });
    
    console.log('  Highlighting result:', result);
    
    // Check if highlights were actually added
    setTimeout(() => {
      const highlights = document.querySelectorAll('.debug-highlight');
      console.log('  Highlights found in DOM:', highlights.length);
      highlights.forEach((highlight, index) => {
        console.log(`    Highlight ${index + 1}:`, {
          text: highlight.textContent,
          className: highlight.className,
          tagName: highlight.tagName,
          parentElement: highlight.parentElement?.tagName
        });
      });
    }, 100);
  }
  
  // Test 5: Check DOM structure for common cross-element scenarios
  console.log('5. DOM structure analysis:');
  
  const links = document.querySelectorAll('a');
  const boldElements = document.querySelectorAll('strong, b');
  const italicElements = document.querySelectorAll('em, i');
  const spans = document.querySelectorAll('span');
  
  console.log('  - Links found:', links.length);
  console.log('  - Bold elements:', boldElements.length);
  console.log('  - Italic elements:', italicElements.length);
  console.log('  - Span elements:', spans.length);
  
  // Check text content around these elements
  links.forEach((link, index) => {
    const parent = link.parentElement;
    if (parent) {
      console.log(`    Link ${index + 1} context:`, {
        linkText: link.textContent,
        parentText: parent.textContent?.substring(0, 100),
        previousSibling: link.previousSibling?.textContent?.trim(),
        nextSibling: link.nextSibling?.textContent?.trim()
      });
    }
  });
}

/**
 * Test specific annotation highlighting with detailed logging
 */
export function testSpecificHighlight(searchText: string, usePosition = false, startPos?: number, endPos?: number) {
  console.log(`=== Testing Specific Highlight: "${searchText}" ===`);
  
  const annotationId = 'test-' + Date.now();
  let result = false;
  
  if (usePosition && typeof startPos === 'number' && typeof endPos === 'number') {
    console.log('Using position-based highlighting:', { startPos, endPos });
    if (typeof window.highlightAnnotationByPosition === 'function') {
      result = window.highlightAnnotationByPosition(annotationId, startPos, endPos, {
        highlightClass: 'test-position-highlight',
        highlightStyle: 'background-color: #99ff99; border: 2px solid green; padding: 2px;'
      });
    }
  } else {
    console.log('Using text-based highlighting');
    if (typeof window.highlightAnnotation === 'function') {
      result = window.highlightAnnotation(annotationId, searchText, {
        highlightClass: 'test-text-highlight',
        highlightStyle: 'background-color: #9999ff; border: 2px solid blue; padding: 2px;'
      });
    }
  }
  
  console.log('Highlighting result:', result);
  
  // Check results
  setTimeout(() => {
    const highlights = document.querySelectorAll(`[data-annotation-id="${annotationId}"]`);
    console.log('Highlights created:', highlights.length);
    
    highlights.forEach((highlight, index) => {
      console.log(`  Highlight ${index + 1}:`, {
        text: highlight.textContent,
        className: highlight.className,
        position: {
          offsetTop: (highlight as HTMLElement).offsetTop,
          offsetLeft: (highlight as HTMLElement).offsetLeft,
          offsetWidth: (highlight as HTMLElement).offsetWidth,
          offsetHeight: (highlight as HTMLElement).offsetHeight
        }
      });
    });
  }, 100);
  
  return annotationId;
}

/**
 * Clean up test highlights
 */
export function cleanupTestHighlights() {
  const testHighlights = document.querySelectorAll('.debug-highlight, .test-position-highlight, .test-text-highlight');
  console.log('Cleaning up', testHighlights.length, 'test highlights');
  
  testHighlights.forEach(highlight => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
      parent.normalize();
    }
  });
}

// Expose functions globally for browser console access
if (typeof window !== 'undefined') {
  window.debugAnnotationHighlighting = debugAnnotationHighlighting;
  window.testSpecificHighlight = testSpecificHighlight;
  window.cleanupTestHighlights = cleanupTestHighlights;
}

/**
 * Usage instructions:
 * 
 * In the browser console:
 * 1. debugAnnotationHighlighting() - Run comprehensive debug
 * 2. testSpecificHighlight('text with a hyperlink') - Test specific text
 * 3. testSpecificHighlight('text', true, 10, 20) - Test with positions
 * 4. cleanupTestHighlights() - Remove test highlights
 */
