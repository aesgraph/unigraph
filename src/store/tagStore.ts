import { create } from "zustand";

export interface TagInfo {
  color: string;
  description: string;
  usageCount: number;
  isDescriptionUserSet?: boolean; // Track if user manually set the description
}

interface TagStore {
  tagColors: Map<string, string>;
  tagMetadata: Map<string, TagInfo>;

  // Actions
  setTagColor: (tag: string, color: string) => void;
  setTagMetadata: (tag: string, metadata: TagInfo) => void;
  getTagColor: (tag: string) => string;
  getTagMetadata: (tag: string) => TagInfo | undefined;
  getAllTags: () => string[];
  generateTagColor: (tag: string) => string;
  initializeTagColors: (tags: string[]) => void;
  clearTags: () => void;
}

export const useTagStore = create<TagStore>((set, get) => ({
  tagColors: new Map(),
  tagMetadata: new Map(),

  setTagColor: (tag: string, color: string) => {
    set((state) => {
      const newTagColors = new Map(state.tagColors);
      newTagColors.set(tag, color);
      return { tagColors: newTagColors };
    });
  },

  setTagMetadata: (tag: string, metadata: TagInfo) => {
    console.log("setTagMetadata called:", tag, metadata);
    set((state) => {
      const newTagMetadata = new Map(state.tagMetadata);
      newTagMetadata.set(tag, metadata);
      console.log("Updated tagMetadata map:", newTagMetadata);
      return { tagMetadata: newTagMetadata };
    });
  },

  getTagColor: (tag: string) => {
    const state = get();
    const existingColor = state.tagColors.get(tag);
    if (existingColor) {
      return existingColor;
    }
    // Generate color without storing it to avoid infinite loops
    const hash = tag.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  },

  getTagMetadata: (tag: string) => {
    const state = get();
    const metadata = state.tagMetadata.get(tag);
    console.log("getTagMetadata called:", tag, "returning:", metadata);
    return metadata;
  },

  getAllTags: () => {
    const state = get();
    // Get all tags from both tagColors and tagMetadata maps
    const allTags = new Set<string>();

    // Add tags from tagColors
    state.tagColors.forEach((_, tag) => allTags.add(tag));

    // Add tags from tagMetadata
    state.tagMetadata.forEach((_, tag) => allTags.add(tag));

    return Array.from(allTags);
  },

  generateTagColor: (tag: string) => {
    // Generate a consistent color for each tag using hash function
    const hash = tag.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const hue = Math.abs(hash) % 360;
    const color = `hsl(${hue}, 70%, 60%)`;

    // Store the generated color
    get().setTagColor(tag, color);
    return color;
  },

  // Initialize tag colors for a list of tags (used in ResourceManagerView)
  initializeTagColors: (tags: string[]) => {
    const state = get();
    tags.forEach((tag) => {
      if (!state.tagColors.has(tag)) {
        const hash = tag.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        const hue = Math.abs(hash) % 360;
        const color = `hsl(${hue}, 70%, 60%)`;
        state.setTagColor(tag, color);
      }
    });
  },

  clearTags: () => {
    set({ tagColors: new Map(), tagMetadata: new Map() });
  },
}));
