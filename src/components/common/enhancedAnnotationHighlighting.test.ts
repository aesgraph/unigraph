/**
 * Test file to demonstrate the enhanced annotation highlighting capabilities
 * 
 * This showcases the improved features:
 * - Better text node mapping with TreeWalker
 * - Position-based highlighting for precise matching
 * - Fuzzy text search as fallback
 * - Support for complex HTML structures
 */

import { processHtmlWithEnhancedHighlights, AnnotationHighlight } from './enhancedAnnotationHighlighting';

describe('Enhanced Annotation Highlighting', () => {
  // Sample HTML with complex structure
  const complexHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Document</title>
    </head>
    <body>
      <h1>Main Title</h1>
      <p>This is a <strong>sample paragraph</strong> with some text.</p>
      <table>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2 with <a href="#">link text</a></td>
        </tr>
      </table>
      <div>
        <span>Nested content</span> with more text.
      </div>
    </body>
    </html>
  `;

  it('should handle position-based highlighting', () => {
    const annotations: AnnotationHighlight[] = [
      {
        id: 'test-1',
        data: {
          selected_text: 'sample paragraph',
          start_position: 25,
          end_position: 40,
          comment: 'Test annotation'
        }
      }
    ];

    const result = processHtmlWithEnhancedHighlights(complexHtml, annotations);
    
    expect(result.highlightsAdded).toBe(1);
    expect(result.html).toContain('highlightAnnotationByPosition');
    expect(result.html).toContain('data-annotation-id="test-1"');
  });

  it('should handle text-based highlighting as fallback', () => {
    const annotations: AnnotationHighlight[] = [
      {
        id: 'test-2',
        data: {
          selected_text: 'link text',
          comment: 'Test annotation without positions'
        }
      }
    ];

    const result = processHtmlWithEnhancedHighlights(complexHtml, annotations);
    
    expect(result.highlightsAdded).toBe(1);
    expect(result.html).toContain('highlightAnnotation');
    expect(result.annotationScripts).toHaveLength(1);
  });

  it('should include debugging utilities', () => {
    const result = processHtmlWithEnhancedHighlights(complexHtml, []);
    
    expect(result.html).toContain('getTextContentPreview');
    expect(result.html).toContain('findTextPosition');
    expect(result.html).toContain('buildTextIndexMap');
  });

  it('should handle empty annotations gracefully', () => {
    const result = processHtmlWithEnhancedHighlights(complexHtml, []);
    
    expect(result.highlightsAdded).toBe(0);
    expect(result.annotationScripts).toHaveLength(0);
    expect(result.html).toContain('getVisibleTextNodes'); // Should still include utility functions
  });

  it('should process multiple annotations', () => {
    const annotations: AnnotationHighlight[] = [
      {
        id: 'test-3',
        data: {
          selected_text: 'Main Title',
          start_position: 0,
          end_position: 10
        }
      },
      {
        id: 'test-4',
        data: {
          selected_text: 'Nested content'
        }
      }
    ];

    const result = processHtmlWithEnhancedHighlights(complexHtml, annotations);
    
    expect(result.highlightsAdded).toBe(2);
    expect(result.annotationScripts).toHaveLength(2);
  });
});

/**
 * Example usage for browser environment:
 * 
 * // In the browser, you can now use these enhanced functions:
 * 
 * // Get text content preview
 * window.getTextContentPreview(1000);
 * 
 * // Find exact position of text
 * window.findTextPosition("some text to find");
 * 
 * // Highlight by position (most accurate)
 * window.highlightAnnotationByPosition('ann-1', 100, 120, {
 *   highlightClass: 'my-highlight',
 *   highlightStyle: 'background: yellow;'
 * });
 * 
 * // Highlight by text search (fallback)
 * window.highlightAnnotation('ann-2', 'search text', {
 *   highlightClass: 'my-highlight',
 *   highlightStyle: 'background: yellow;'
 * });
 * 
 * // Remove highlights
 * window.removeAnnotationHighlights('ann-1');
 */
