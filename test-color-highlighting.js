// Test script to verify color highlighting is working
const testAnnotations = [
  {
    id: 'test-1',
    data: {
      selected_text: 'sample text',
      tags: ['important'],
    }
  },
  {
    id: 'test-2', 
    data: {
      selected_text: 'another text',
      tags: ['research'],
    }
  }
];

// Mock tag color function
function mockGetTagColor(tag) {
  const colors = {
    'important': '#ff6b6b',
    'research': '#4ecdc4',
    'default': '#ffeb3b'
  };
  return colors[tag] || colors.default;
}

// Test HTML content
const testHtml = `
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
  <p>This is sample text for testing.</p>
  <p>Here is another text to highlight.</p>
</body>
</html>
`;

// Import the function (this would be done in actual test environment)
// import { processHtmlWithHighlights } from './src/components/common/enhancedAnnotationHighlighting.ts';

console.log('Test annotations:', testAnnotations);
console.log('Mock colors:');
testAnnotations.forEach(ann => {
  const tags = ann.data.tags || [];
  if (tags.length > 0) {
    console.log(`  ${tags[0]}: ${mockGetTagColor(tags[0])}`);
  }
});
