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

// export type SkillCardRow = {
//   id: number;
//   pokemonId: number | null;
//   enSkillName: string | null;
//   thSkillName: string | null;
//   typeId: number | null;
//   damage: number | null;
//   enFightingAbility: string | null;
//   thFightingAbility: string | null;
// };

// export type EnergyCostRow = {
//   skillCardId: number | null;
//   typeId: number | null;
//   quantity: number | null;
// };

// export type SkillEffectRow = {
//   skillCardId: number | null;
//   effectId: number | null;
//   effectName: string | null;
//   effectTh: string | null;
//   directions: string[] | null;
// };

// export type AvailableFaceRow = {
//   pokemonId: number | null;
//   faceTypeId: number | null;
//   quantity: number | null;
// };

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

// export type SkillCardWithDetails = SkillCardRow & {
//   energyCosts: EnergyCostRow[];
//   effects: SkillEffectRow[];
// };

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
