type Face = {
  faceNumber: number;
  faceTypeId: number;
}
type Die = {
  diceNumber: number;
  faces: Face[];
}

type SkillCard = {
  skillCardId: number;
}

export type exportDicePreset = {
  dicePresetId: string;
  pokemonId: number;
  enPresetName: string | null;
  thPresetName: string | null;
  SkillCards: SkillCard[];
  dice: Die[];
}