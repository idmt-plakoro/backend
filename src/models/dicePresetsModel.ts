// type Face = {
//   faceTypeId: number;
// }

type SkillCard = {
  skillCardId: number;
}

export type exportDicePreset = {
  dicePresetId: string;
  pokemonId: number;
  enPresetName: string | null;
  thPresetName: string | null;
  skillCards: SkillCard[] | null;
  dice1: number[];
  dice2: number[];
  dice3: number[];
}