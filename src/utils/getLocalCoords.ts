export function getLocalCoords(
  event: MouseEvent | React.MouseEvent,
  container: HTMLElement
) {
  const rect = container.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
