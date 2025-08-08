export interface StoryNode {
  id: string;
  title: string;
  description: string;
  markdownFile?: string;
  markdownContent?: string;
  children?: StoryNode[];
}
