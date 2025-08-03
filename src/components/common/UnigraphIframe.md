# UnigraphIframe Component

A React component for embedding HTML elements into markdown files, specifically designed for interactive diagrams and documentation structures.

## Features

- **Interactive Controls**: Refresh, fullscreen, and external link buttons
- **Loading States**: Customizable loading messages and spinners
- **Error Handling**: Graceful error states with retry functionality
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Support**: Automatic dark mode detection
- **Resizable**: Optional resize functionality
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Customizable**: Extensive styling and configuration options

## Basic Usage

```tsx
import UnigraphIframe from "../components/common/UnigraphIframe";

<UnigraphIframe
  src="/docs-structure.html"
  title="Documentation Structure"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
/>;
```

## Props

| Prop              | Type                                            | Default                            | Description                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `src`             | `string`                                        | -                                  | The URL to embed in the iframe         |
| `title`           | `string`                                        | -                                  | Title for accessibility and display    |
| `width`           | `string \| number`                              | `"100%"`                           | Width of the iframe                    |
| `height`          | `string \| number`                              | `"400px"`                          | Height of the iframe                   |
| `resizable`       | `boolean`                                       | `false`                            | Whether the iframe should be resizable |
| `showControls`    | `boolean`                                       | `true`                             | Whether to show control buttons        |
| `className`       | `string`                                        | `""`                               | Custom CSS class name                  |
| `style`           | `React.CSSProperties`                           | `{}`                               | Custom styles                          |
| `onLoad`          | `() => void`                                    | -                                  | Callback when iframe loads             |
| `onError`         | `(error: Event) => void`                        | -                                  | Callback when iframe fails to load     |
| `showLoading`     | `boolean`                                       | `true`                             | Whether to show loading state          |
| `loadingMessage`  | `string`                                        | `"Loading interactive content..."` | Custom loading message                 |
| `allowFullscreen` | `boolean`                                       | `true`                             | Whether to allow fullscreen mode       |
| `iframeProps`     | `React.IframeHTMLAttributes<HTMLIFrameElement>` | `{}`                               | Additional iframe attributes           |

## Examples

### Interactive Documentation Structure

```tsx
<UnigraphIframe
  src="/docs-structure.html"
  title="Unigraph Documentation Structure"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
  onLoad={() => console.log("Documentation loaded")}
  onError={(error) => console.error("Failed to load:", error)}
  loadingMessage="Loading documentation structure..."
  allowFullscreen={true}
/>
```

### Interactive Diagram with Custom Styling

```tsx
<UnigraphIframe
  src="/interactive-diagram.html"
  title="Interactive Diagram"
  width={800}
  height={400}
  showControls={true}
  resizable={false}
  style={{
    border: "2px solid #1976d2",
    borderRadius: "12px",
  }}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
  }}
/>
```

### Minimal Configuration

```tsx
<UnigraphIframe
  src="/simple-content.html"
  title="Simple Content"
  width="100%"
  height={300}
  showControls={false}
  showLoading={false}
/>
```

## Event Handlers

The component provides several event handlers for different interactions:

```tsx
<UnigraphIframe
  src="/example.html"
  title="Example"
  onLoad={() => console.log("Content loaded")}
  onError={(error) => console.error("Load failed:", error)}
/>
```

## Styling

The component includes built-in CSS with support for:

- **Hover Effects**: Subtle shadows and transitions
- **Dark Mode**: Automatic dark mode detection
- **Responsive Design**: Mobile-friendly controls
- **Loading Animations**: Smooth spinning animations
- **Error States**: Clear error messaging

### Custom Styling

You can override default styles using the `style` prop:

```tsx
<UnigraphIframe
  src="/example.html"
  title="Example"
  style={{
    border: "3px solid #ff6b6b",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
  }}
/>
```

## Security Considerations

When embedding content from external sources, consider using the `iframeProps` prop to set appropriate sandbox attributes:

```tsx
<UnigraphIframe
  src="/external-content.html"
  title="External Content"
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
    referrerPolicy: "no-referrer",
  }}
/>
```

## Accessibility

The component includes proper accessibility features:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: All controls are keyboard accessible
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Descriptive titles and messages

## Browser Support

The component supports all modern browsers and includes fallbacks for older browsers:

- **Fullscreen API**: Graceful degradation for browsers without fullscreen support
- **CSS Grid/Flexbox**: Fallbacks for older browsers
- **ES6+ Features**: Transpiled for broader compatibility

## Performance

The component is optimized for performance:

- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Content loads only when needed
- **Efficient Event Handling**: Debounced resize and scroll events
- **Minimal DOM Manipulation**: Uses React's virtual DOM efficiently
