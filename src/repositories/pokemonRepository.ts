import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  pokemonSets,
  skillCards,
  skillCardEnergyCosts,
  skillCardEffects,
  effects,
  pokemonAvailableFaces,
  pokemonFixedFaces,
} from "../db/schema";

export const pokemonRepository = {
  async listFullPokemonSets() {
    const pokemon = await db
      .select()
      .from(pokemonSets);

    const pokemonIds = pokemon.map((p) => p.id);

    if (!pokemonIds.length) return [];

    const skillCardsRows = await db
      .select()
      .from(skillCards)
      .where(inArray(skillCards.pokemonId, pokemonIds));

    const skillCardIds = skillCardsRows.map((card) => card.id);

    const energyCosts = await db
      .select()
      .from(skillCardEnergyCosts)
      .where(inArray(skillCardEnergyCosts.skillCardId, skillCardIds));

    const skillEffects = await db
      .select({
        skillCardId: skillCardEffects.skillCardId,
        effectId: skillCardEffects.effectId,
        effectName: effects.enEffect,
        effectTh: effects.thEffect,
      })
      .from(skillCardEffects)
      .leftJoin(effects, eq(skillCardEffects.effectId, effects.id))
      .where(inArray(skillCardEffects.skillCardId, skillCardIds));

    const availableFaces = await db
      .select()
      .from(pokemonAvailableFaces)
      .where(inArray(pokemonAvailableFaces.pokemonId, pokemonIds));

    const fixedFaces = await db
      .select()
      .from(pokemonFixedFaces)
      .where(inArray(pokemonFixedFaces.pokemonId, pokemonIds));

    const skillCardsByPokemon = new Map<number, typeof skillCardsRows>([]);
    skillCardsRows.forEach((card) => {
      const pokemonId = card.pokemonId;
      if (pokemonId == null) return;
      const list = skillCardsByPokemon.get(pokemonId) ?? [];
      list.push(card);
      skillCardsByPokemon.set(pokemonId, list);
    });

    const energyCostsBySkillCard = new Map<number, typeof energyCosts>([]);
    energyCosts.forEach((cost) => {
      const list = energyCostsBySkillCard.get(cost.skillCardId) ?? [];
      list.push(cost);
      energyCostsBySkillCard.set(cost.skillCardId, list);
    });

    const effectsBySkillCard = new Map<number, typeof skillEffects>([]);
    skillEffects.forEach((row) => {
      const list = effectsBySkillCard.get(row.skillCardId) ?? [];
      list.push(row);
      effectsBySkillCard.set(row.skillCardId, list);
    });

    const availableFacesByPokemon = new Map<number, typeof availableFaces>([]);
    availableFaces.forEach((face) => {
      const list = availableFacesByPokemon.get(face.pokemonId) ?? [];
      list.push(face);
      availableFacesByPokemon.set(face.pokemonId, list);
    });

    const fixedFacesByPokemon = new Map<number, typeof fixedFaces>([]);
    fixedFaces.forEach((face) => {
      const list = fixedFacesByPokemon.get(face.pokemonId) ?? [];
      list.push(face);
      fixedFacesByPokemon.set(face.pokemonId, list);
    });

    return pokemon.map((p) => ({
      ...p,
      skillCards: (skillCardsByPokemon.get(p.id) || []).map((card) => ({
        ...card,
        energyCosts: energyCostsBySkillCard.get(card.id) || [],
        effects: effectsBySkillCard.get(card.id) || [],
      })),
      availableFaces: availableFacesByPokemon.get(p.id) || [],
      fixedFaces: fixedFacesByPokemon.get(p.id) || [],
    }));
  },
};