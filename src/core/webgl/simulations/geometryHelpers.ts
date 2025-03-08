export const getPositionOnLine = (
  value: number,
  maxValue: number,
  length: number
): number => {
  return (value / maxValue) * length;
};
