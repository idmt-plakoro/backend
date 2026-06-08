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

export type SkillCardRow = {
  id: number;
  pokemonId: number | null;
  enSkillName: string | null;
  thSkillName: string | null;
  typeId: number | null;
  damage: number | null;
  enFightingAbility: string | null;
  thFightingAbility: string | null;
};

export type EnergyCostRow = {
  skillCardId: number | null;
  typeId: number | null;
  quantity: number | null;
};

export type SkillEffectRow = {
  skillCardId: number | null;
  effectId: number | null;
  effectName: string | null;
  effectTh: string | null;
  directions: string[] | null;
};

export type AvailableFaceRow = {
  pokemonId: number | null;
  faceTypeId: number | null;
  quantity: number | null;
};

export type FixedFaceRow = {
  pokemonId: number | null;
  faceTypeId: number | null;
  quantity: number | null;
};

export type SkillCardWithDetails = SkillCardRow & {
  energyCosts: EnergyCostRow[];
  effects: SkillEffectRow[];
};

export type PokemonSetFull = PokemonSetRow & {
  skillCards: SkillCardWithDetails[];
  availableFaces: AvailableFaceRow[];
  fixedFaces: FixedFaceRow[];
};
