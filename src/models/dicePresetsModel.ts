type Face = {
  faceTypeId: number;
}

type SkillCard = {
  skillCardId: number;
}

export type exportDicePreset = {
  dicePresetId: string;
  pokemonId: number;
  enPresetName: string | null;
  thPresetName: string | null;
  skillCards: SkillCard[] | null;
  dice1: Face[];
  dice2: Face[];
  dice3: Face[];
}