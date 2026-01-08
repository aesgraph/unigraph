import { debounce } from "lodash";

export const enableZoomAndPanOnSvg = (element: HTMLDivElement) => {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  const svgElement = element.querySelector("svg");

  if (svgElement) {
    // Reset everything first
    svgElement.style.transform = "";
    element.style.position = "relative";

    // Essential container setup
    element.style.overflow = "hidden";
    element.style.width = "100%";
    element.style.height = "100%";

    // Get the SVG's natural dimensions
    const bbox = svgElement.getBBox();
    const svgWidth = bbox.width;
    const svgHeight = bbox.height;

    // Set viewBox to match natural dimensions
    svgElement.setAttribute(
      "viewBox",
      `${bbox.x} ${bbox.y} ${svgWidth} ${svgHeight}`
    );

    // Function to calculate and apply initial fit
    const fitToView = () => {
      const containerWidth = element.clientWidth;
      const containerHeight = element.clientHeight;

      // Calculate scale to fit
      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;
      scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add a small margin

      // Calculate translations to center
      translateX = (containerWidth - svgWidth * scale) / 2;
      translateY = (containerHeight - svgHeight * scale) / 2;

      // Adjust for viewBox offset
      translateX -= bbox.x * scale;
      translateY -= bbox.y * scale;

      updateTransform();
    };

    // Basic SVG setup
    svgElement.style.position = "absolute";
    svgElement.style.transformOrigin = "0 0";
    svgElement.style.cursor = "grab";

    function updateTransform() {
      svgElement!.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;
    }

    // Initial fit
    fitToView();

    // Add window resize handler for responsive behavior
    const handleResize = debounce(() => {
      fitToView();
    }, 250);

    window.addEventListener("resize", handleResize);

    // Zoom handler
    svgElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Get mouse position relative to SVG
      const relativeX = (mouseX - translateX) / scale;
      const relativeY = (mouseY - translateY) / scale;

      // Update scale with bounds
      const _oldScale = scale;
      scale *= event.deltaY < 0 ? 1.1 : 0.9;
      scale = Math.min(Math.max(0.1, scale), 10);

      // Adjust translation to zoom into mouse position
      translateX = mouseX - relativeX * scale;
      translateY = mouseY - relativeY * scale;

      updateTransform();
    });

    // Pan handlers
    svgElement.addEventListener("mousedown", (event) => {
      event.preventDefault();
      isDragging = true;
      startX = event.clientX - translateX;
      startY = event.clientY - translateY;
      svgElement.style.cursor = "grabbing";
    });

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      event.preventDefault();
      translateX = event.clientX - startX;
      translateY = event.clientY - startY;
      updateTransform();
    };

    const handleMouseUp = () => {
      isDragging = false;
      if (svgElement) {
        svgElement.style.cursor = "grab";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // Touch support
    let lastTouchDistance = 0;

    svgElement.addEventListener("touchstart", (event) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        lastTouchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      } else if (event.touches.length === 1) {
        event.preventDefault();
        isDragging = true;
        startX = event.touches[0].clientX - translateX;
        startY = event.touches[0].clientY - translateY;
      }
    });

    svgElement.addEventListener("touchmove", (event) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastTouchDistance > 0) {
          const delta = currentDistance / lastTouchDistance;
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          const rect = element.getBoundingClientRect();
          const relativeX = (centerX - rect.left - translateX) / scale;
          const relativeY = (centerY - rect.top - translateY) / scale;

          scale *= delta;
          scale = Math.min(Math.max(0.1, scale), 10);

          translateX = centerX - rect.left - relativeX * scale;
          translateY = centerY - rect.top - relativeY * scale;

          updateTransform();
        }
        lastTouchDistance = currentDistance;
      } else if (event.touches.length === 1 && isDragging) {
        event.preventDefault();
        translateX = event.touches[0].clientX - startX;
        translateY = event.touches[0].clientY - startY;
        updateTransform();
      }
    });

    svgElement.addEventListener("touchend", () => {
      isDragging = false;
      lastTouchDistance = 0;
    });

    // Return cleanup function
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }
};

// Example usage:
// saveRenderingConfigToFile(sceneGraph.renderConfig, "renderConfig.json");
// loadRenderingConfigFromFile(file).then(config => {
//   sceneGraph.renderConfig = config;
// });
