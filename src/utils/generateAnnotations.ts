import { v4 as uuidv4 } from "uuid";
import { ImageBoxData } from "../core/types/ImageBoxData";

interface Annotation {
  id: string;
  label: string;
  description: string;
  imageBoxId: string;
  references: string[];
}

const randomLabels = [
  "Annotation A",
  "Annotation B",
  "Annotation C",
  "Annotation D",
  "Annotation E",
];

const randomDescriptions = [
  "This is a description for annotation A.",
  "This is a description for annotation B.",
  "This is a description for annotation C.",
  "This is a description for annotation D.",
  "This is a description for annotation E.",
];

export const generateRandomAnnotations = (
  imageBoxes: ImageBoxData[]
): Annotation[] => {
  const annotations: Annotation[] = [];

  imageBoxes.forEach((box) => {
    const annotationCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 annotations per image box

    for (let i = 0; i < annotationCount; i++) {
      const randomLabel =
        randomLabels[Math.floor(Math.random() * randomLabels.length)];
      const randomDescription =
        randomDescriptions[
          Math.floor(Math.random() * randomDescriptions.length)
        ];

      annotations.push({
        id: uuidv4(),
        label: randomLabel,
        description: randomDescription,
        imageBoxId: box.id,
        references: [
          imageBoxes[Math.floor(Math.random() * imageBoxes.length)].id,
        ],
      });
    }
  });

  return annotations;
};
