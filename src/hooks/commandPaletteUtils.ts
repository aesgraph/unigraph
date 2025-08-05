import { Command } from "./useCommandPalette";

// Returns true if all words in the query are present (in any order) in the command's title or description
export function commandMatchesQueryUnordered(
  command: Command,
  query: string
): boolean {
  if (!query.trim()) return true;
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = (
    command.title +
    " " +
    (command.description || "")
  ).toLowerCase();
  return queryWords.every((word) => text.includes(word));
}

// Returns the number of matched words (for sorting/tiebreaking)
export function getCommandMatchScore(command: Command, query: string): number {
  if (!query.trim()) return 0;
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const text = (
    command.title +
    " " +
    (command.description || "")
  ).toLowerCase();
  return queryWords.filter((word) => text.includes(word)).length;
}
