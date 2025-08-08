/**
 * Test HTML file to demonstrate cross-element annotation highlighting
 * 
 * This file can be used to test how well the enhanced annotation highlighting
 * handles selections that span across different HTML elements.
 */

const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Cross-Element Annotation Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
    }
    .highlight {
      background-color: yellow;
      padding: 2px;
    }
    a {
      color: blue;
      text-decoration: underline;
    }
    .container {
      margin: 20px 0;
      padding: 10px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <h1>Test Cases for Cross-Element Highlighting</h1>
  
  <div class="container">
    <h2>Test Case 1: Text with Link</h2>
    <p>This is some text with a <a href="#link">hyperlink in the middle</a> of the sentence.</p>
    <!-- Test selection: "text with a hyperlink in" (spans normal text, link, and normal text) -->
  </div>
  
  <div class="container">
    <h2>Test Case 2: Bold and Italic Text</h2>
    <p>Here we have <strong>bold text</strong> and <em>italic text</em> mixed together.</p>
    <!-- Test selection: "bold text and italic" (spans strong, normal, and em elements) -->
  </div>
  
  <div class="container">
    <h2>Test Case 3: Nested Elements</h2>
    <p>This paragraph has <span>nested <strong>bold text</strong> inside</span> a span element.</p>
    <!-- Test selection: "nested bold text inside" (spans multiple nested elements) -->
  </div>
  
  <div class="container">
    <h2>Test Case 4: Table Content</h2>
    <table border="1">
      <tr>
        <td>Cell 1 with</td>
        <td>some text in <a href="#test">cell 2</a></td>
      </tr>
    </table>
    <!-- Test selection: "with some text in cell" (spans across table cells) -->
  </div>
  
  <div class="container">
    <h2>Test Case 5: Multiple Lines</h2>
    <p>This is the first line<br>
    and this is the <strong>second line</strong><br>
    with some more text.</p>
    <!-- Test selection: "first line and this is the second" (spans across line breaks) -->
  </div>
  
  <script>
    // Add some debugging to see what's happening
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Test page loaded');
      
      // Test the highlighting functions if they're available
      setTimeout(() => {
        if (typeof window.getTextContentPreview === 'function') {
          const preview = window.getTextContentPreview();
          console.log('Text content preview:', preview);
        }
        
        if (typeof window.findTextPosition === 'function') {
          // Test finding various text snippets
          const testTexts = [
            'text with a hyperlink in',
            'bold text and italic',
            'nested bold text inside',
            'with some text in cell',
            'first line and this is the second'
          ];
          
          testTexts.forEach(text => {
            const result = window.findTextPosition(text);
            console.log(\`Position for "\${text}":, result);
          });
        }
      }, 1000);
    });
    
    // Test manual highlighting
    function testHighlight(text, annotationId) {
      if (typeof window.highlightAnnotation === 'function') {
        const result = window.highlightAnnotation(annotationId, text, {
          highlightClass: 'test-highlight',
          highlightStyle: 'background-color: #ffeb3b; border: 1px solid #orange; padding: 1px;'
        });
        console.log(\`Highlighting result for "\${text}": \${result});
        return result;
      }
      return false;
    }
    
    // Expose test function globally
    window.testHighlight = testHighlight;
  </script>
</body>
</html>
`;

/**
 * Usage instructions:
 * 
 * 1. Load this HTML in the HtmlPageViewer
 * 2. Try selecting text that spans across different elements
 * 3. Create annotations for each test case
 * 4. Verify that the highlights appear correctly
 * 
 * You can also test manually in the browser console:
 * - testHighlight('text with a hyperlink in', 'test-1')
 * - testHighlight('bold text and italic', 'test-2')
 * - etc.
 */

export { testHtml };
