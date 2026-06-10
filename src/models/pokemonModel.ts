export type PokemonSetRow = {
  id: number;
  enPokemonName: string | null;
  thPokemonName: string | null;
  hp: number | null;
  typeId: number | null;
  weaknessTypeId: number | null;
  enDescription: string | null;
  thDescription: string | null;
  pokemonImage: string | null;
};

export type LocalizedString = {
  en: string | null;
  th: string | null;
};

export type SkillCard = {
  id: number;
  name: LocalizedString;
  typeId: number | null;
  damage: number | null;
  fightingAbility?: LocalizedString;
  energyCosts: SkillEnergyCost[];
  effects: SkillEffect[];
};


export type DiceFace = {
    faceTypeId: number | null;
    quantity: number | null;
  };

export type SkillEffect = {
  // id: number | null;
  ability: LocalizedString;
  directions: string[] | null;
};

export type SkillEnergyCost = {
  typeId: number | null;
  quantity: number | null;
};


export type PokemonSetFull = {
  id: number;
  name: LocalizedString;
  hp: number | null;
  typeId: number | null;
  weaknessTypeId  : number | null;
  description: LocalizedString;
  pokemonImage: string | null;
  skillCards: SkillCard[];
  availableFaces: DiceFace[];
  fixedFaces: DiceFace[];
};
