export type SavedSlot = {
  id: string;
  userId: string;
  slotNumber: number;
  slotName: string | null;
  pokemonId: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  dice1: number[];
  dice2: number[];
  dice3: number[];
  skills: number[] | null;
};

export type CreateSlotBody = {
  slotNumber: number;
  slotName?: string;
  pokemonId: number;
  skills: number[];
  dice1: number[];
  dice2: number[];
  dice3: number[];
};

export type UpdateSlotBody = {
  slotName?: string;
  pokemonId?: number;
  skills?: number[];
  dice1?: number[];
  dice2?: number[];
  dice3?: number[];
};