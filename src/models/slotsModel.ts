export type SavedSlotRow = {
  id: string;
  userId: string;
  slotNumber: number;
  slotName: string | null;
  pokemonId: number;
  createdAt: string;
  updatedAt: string;
};

export type SavedSlotSkillRow = {
  savedSlotId: string;
  skillCardId: number;
};

export type SavedSlotFaceRow = {
  savedSlotId: string;
  faceTypeId: number;
  dieNumber: number;
  faceNumber: number;
};

export type SavedSlotFull = SavedSlotRow & {
  skills: SavedSlotSkillRow[];
  faces: SavedSlotFaceRow[];
};

export type CreateSlotBody = {
  slotNumber: number;
  slotName?: string;
  pokemonId: number;
  skills: number[];
  faces: Array<{
    faceTypeId: number;
    dieNumber: number;
    faceNumber: number;
  }>;
};

export type UpdateSlotBody = {
  slotName?: string;
  pokemonId?: number;
  skills?: number[];
  faces?: Array<{
    faceTypeId: number;
    dieNumber: number;
    faceNumber: number;
  }>;
};