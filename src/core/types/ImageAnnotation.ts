import { demo_SceneGraph_ArtCollection } from '../../data/graphs/Gallery_Demos/demo_SceneGraph_ArtCollection';
import { Position } from '../layouts/layoutHelpers';
import {
  AbstractEntity,
  EntityData,
  EntityDataArgs,
  EntityId,
} from '../model/entity/abstractEntity';
import { EntitiesContainer } from '../model/entity/entitiesContainer';
import { ImageBoxData } from './ImageBoxData';

export type ImageAnnotationId = EntityId & { readonly kind: 'imageAnnotation' };

type ImageAnnotationData = EntityData & {
  imageUrl: string;
  topLeft: Position;
  bottomRight: Position;
  description: string;
};

export type ImageAnnotationDataArgs = EntityDataArgs & {
  id: string | ImageAnnotationId;
  imageUrl: string;
  topLeft: Position;
  bottomRight: Position;
};

class ImageAnnotation extends AbstractEntity<
  ImageAnnotationId,
  ImageAnnotationData
> {
  constructor(id: ImageAnnotationId | string, args: ImageAnnotationDataArgs) {
    super(args.id as ImageAnnotationId, args);
  }

  getData(): ImageAnnotationData {
    return this.data;
  }

  getEntityType(): string {
    return 'imageAnnotation';
  }

  static create(
    id: ImageAnnotationId | string,
    args: ImageAnnotationDataArgs
  ): ImageAnnotation {
    return new ImageAnnotation(id, args);
  }
}

export const IMAGE_ANNOTATION_ENTITIES = (): EntitiesContainer<
  ImageAnnotationId,
  ImageAnnotation
> => {
  const imageAnnotationEntities = new EntitiesContainer<
    ImageAnnotationId,
    ImageAnnotation
  >();
  const artCollection = demo_SceneGraph_ArtCollection();
  for (const imageBox of artCollection.getNodes()) {
    const imageAnnotation = new ImageAnnotation(imageBox.getId(), {
      id: imageBox.getId(),
      imageUrl: imageBox.getAllUserData().imageUrl,
      topLeft: imageBox.getAllUserData().topLeft,
      bottomRight: imageBox.getAllUserData().bottomRight,
      // description: data.description,
    });
    imageAnnotationEntities.addEntity(imageAnnotation);
  }
  // imageAnnotationEntities.addEntities(loadFromJson(imageBoxes256));
  console.log(`Loading ${imageAnnotationEntities.size()} image annotations`);
  return imageAnnotationEntities;
};

export const loadFromJson = (data: ImageBoxData[]) => {
  const imageAnnotationEntities = new EntitiesContainer<
    ImageAnnotationId,
    ImageAnnotation
  >();
  for (const obj of Object.values(data)) {
    const imageAnnotation = new ImageAnnotation(obj.id, {
      id: obj.id,
      imageUrl: obj.imageUrl,
      topLeft: obj.topLeft,
      bottomRight: obj.bottomRight,
      description: obj.description,
    });
    imageAnnotationEntities.addEntity(imageAnnotation);
  }
  return imageAnnotationEntities;
};

export { ImageAnnotation, ImageAnnotationData };
