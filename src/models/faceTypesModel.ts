import { TypeSummary } from "./typesModel";

export type FaceTypeElement = {
  faceTypeId: number;
  typeId: number;
  type: TypeSummary;
  quantity: number;
};

export type FaceTypeWithElements = {
  id: number;
  faceTypeElements: FaceTypeElement[];
};

export type exportFaceType = {
  faceTypesId: number;
  types: TypeSummary[];
};