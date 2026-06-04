export type TypeSummary = {
  id: number;
  enName: string | null;
  thName: string | null;
  typeImage: string | null;
};

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