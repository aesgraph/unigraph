import { Position } from "../layouts/layoutHelpers";
import {
  GetBottomRight,
  GetTopLeft,
  SelectionBoxGroup,
} from "../webgl/selectionArea";
import { WebUrlResourceId } from "./ResourceId";

export type ImageBoxData = {
  id: string;
  type: string;
  label: string;
  description: string;
  tags?: string[];
  imageUrl: string;
  topLeft: Position;
  bottomRight: Position;
  imageSource?: any; // raw data
  annotations?: Annotation[];
};

export interface Annotation {
  id: string;
  label: string;
  description: string;
  date?: string;
  tags?: string[];
  urls?: WebUrlResourceId[];
}

export const fromSelectionArea = (
  selectionArea: SelectionBoxGroup,
  imageName: string,
  description: string
): ImageBoxData => {
  return {
    id: selectionArea.userData.uuid,
    label: selectionArea.userData.uuid,
    imageUrl: imageName,
    topLeft: GetTopLeft(selectionArea),
    bottomRight: GetBottomRight(selectionArea),
    type: "ImageBox",
    description: description,
  };
};

// export const toSelectionArea = (data: ImageBoxData): SelectionBoxGroup => {
//     const group = new SelectionBoxGroup();
//     group.userData = {
//         uuid: data.id,
//         box: group,
//     };
//     return group;
//     };
