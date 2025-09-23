import { SAMPLE_STORY_TREE } from "../../data/models/StoryCard";
import { Position } from "../layouts/layoutHelpers";
import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from "../model/entity/abstractEntity";
import { EntitiesContainer } from "../model/entity/entitiesContainer";

export type StoryCardId = EntityId & { readonly kind: "storyCard" };

type StoryCardData = EntityData & {
  title: string;
  description: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
  difficulty?: number;
  imageUrl?: string;
  position?: Position;
};

export type StoryCardDataArgs = EntityDataArgs & {
  title: string;
  description: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
  difficulty?: number;
  imageUrl?: string;
  position?: Position;
};

class StoryCard extends AbstractEntity<StoryCardId, StoryCardData> {
  constructor(args: StoryCardDataArgs) {
    super(args);
  }

  getData(): StoryCardData {
    return this.data;
  }

  getEntityType(): string {
    return "storyCard";
  }

  getTitle(): string {
    return this.data.title;
  }

  getDescription(): string {
    return this.data.description;
  }

  getAuthor(): string | undefined {
    return this.data.author;
  }

  getCreatedAt(): string | undefined {
    return this.data.createdAt;
  }

  getDifficulty(): number | undefined {
    return this.data.difficulty;
  }

  getImageUrl(): string | undefined {
    return this.data.imageUrl;
  }

  getPosition(): Position | undefined {
    return this.data.position;
  }

  setTitle(title: string): StoryCard {
    this.data.title = title;
    return this;
  }

  setDescription(description: string): StoryCard {
    this.data.description = description;
    return this;
  }

  setAuthor(author: string): StoryCard {
    this.data.author = author;
    return this;
  }

  setDifficulty(difficulty: number): StoryCard {
    this.data.difficulty = difficulty;
    return this;
  }

  setImageUrl(imageUrl: string): StoryCard {
    this.data.imageUrl = imageUrl;
    return this;
  }

  setPosition(position: Position): StoryCard {
    this.data.position = position;
    return this;
  }

  static create(args: StoryCardDataArgs): StoryCard {
    return new StoryCard(args);
  }
}

export const createSampleStoryCardEntities = (): EntitiesContainer<
  StoryCardId,
  StoryCard
> => {
  const storyCardEntities = new EntitiesContainer<StoryCardId, StoryCard>();

  // Function to process story tree nodes recursively
  const processNode = (node: any, depth: number = 0, index: number = 0) => {
    // Create x,y coordinates based on depth and index for visualization
    const position: Position = {
      x: depth * 250,
      y: index * 200,
      z: 0,
    };

    const storyCard = new StoryCard({
      id: node.id,
      title: node.title,
      description: node.description,
      tags: ["storycard", `depth-${depth}`],
      createdAt: new Date().toISOString(),
      position: position,
    });

    storyCardEntities.addEntity(storyCard);

    // Process children if they exist
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any, childIndex: number) => {
        processNode(child, depth + 1, childIndex);
      });
    }
  };

  // Start processing from the root node
  processNode(SAMPLE_STORY_TREE);

  console.log(`Created ${storyCardEntities.size()} story card entities`);
  return storyCardEntities;
};

export const loadStoryCardsFromJson = (
  data: any[]
): EntitiesContainer<StoryCardId, StoryCard> => {
  const storyCardEntities = new EntitiesContainer<StoryCardId, StoryCard>();

  for (const obj of data) {
    const storyCard = new StoryCard({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      tags: obj.tags,
      author: obj.author,
      createdAt: obj.createdAt || new Date().toISOString(),
      difficulty: obj.difficulty,
      imageUrl: obj.imageUrl,
      position: obj.position,
    });

    storyCardEntities.addEntity(storyCard);
  }

  return storyCardEntities;
};

export { StoryCard };
export type { StoryCardData };
