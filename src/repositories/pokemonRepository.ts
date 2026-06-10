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
import { PokemonSetFull, PokemonSetRow } from "../models/pokemonModel";

export const pokemonRepository = {
  async listFullPokemonSets(): Promise<PokemonSetFull[]> {
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
        directions: effects.directions,
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
      id: p.id,
      hp: p.hp,
      typeId: p.typeId,
      weaknessTypeId: p.weaknessTypeId,
      pokemonImage: p.pokemonImage,
      // ข้อ 2: จัดกลุ่มภาษาให้ Pokemon
      name: {
        en: p.enPokemonName,
        th: p.thPokemonName,
      },
      description: {
        en: p.enDescription,
        th: p.thDescription,
      },
      skillCards: (skillCardsByPokemon.get(p.id) || []).map((card) => {
        // ข้อ 3: จัดการค่า null (ดึงค่ามาเช็กก่อน)
        const fightingAbility = card.enFightingAbility || card.thFightingAbility 
          ? { en: card.enFightingAbility, th: card.thFightingAbility }
          : undefined; // ถ้าเป็น null ทั้งคู่ จะไม่แนบคีย์นี้ลงไปใน JSON

        return {
          id: card.id,
          typeId: card.typeId,
          damage: card.damage,
          name: {
            en: card.enSkillName,
            th: card.thSkillName,
          },
          ...(fightingAbility && { fightingAbility }), // แนบเฉพาะตอนที่มีค่าเท่านั้น
          // ข้อ 1: เอา skillCardId ออกจาก energyCosts
          energyCosts: (energyCostsBySkillCard.get(card.id) || []).map((cost) => ({
            typeId: cost.typeId,
            quantity: cost.quantity,
          })),
          // ข้อ 1: เอา skillCardId ออกจาก effects
          effects: (effectsBySkillCard.get(card.id) || []).map((eff) => ({
            // id: eff.effectId, // ถ้าไม่เอา effectId ออกจะซ้ำกับ id ของ skillCard ที่อยู่ข้างบน
            ability: {
              en: eff.effectName,
              th: eff.effectTh,
            },
            directions: eff.directions,
          })),
        };
      }),
      // ข้อ 1: เอา pokemonId ออกจาก availableFaces และ fixedFaces
      availableFaces: (availableFacesByPokemon.get(p.id) || []).map((face) => ({
        faceTypeId: face.faceTypeId,
        quantity: face.quantity,
      })),
      fixedFaces: (fixedFacesByPokemon.get(p.id) || []).map((face) => ({
        faceTypeId: face.faceTypeId,
        quantity: face.quantity,
      })),
    }));
  },
  async getPokemonSetById(pokemonId: number): Promise<PokemonSetFull | null> {
    const pokemon = await db.select().from(pokemonSets).where(eq(pokemonSets.id, pokemonId));

    if (!pokemon.length) return null;

    const p = pokemon[0];
    const pokemonIds = [p.id];

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
        directions: effects.directions,
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

    // Group logic (same as before)
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
      const skillCardId = cost.skillCardId;
      if (skillCardId == null) return;
      const list = energyCostsBySkillCard.get(skillCardId) ?? [];
      list.push(cost);
      energyCostsBySkillCard.set(skillCardId, list);
    });

    const effectsBySkillCard = new Map<number, typeof skillEffects>([]);
    skillEffects.forEach((row) => {
      const list = effectsBySkillCard.get(row.skillCardId) ?? [];
      list.push(row);
      effectsBySkillCard.set(row.skillCardId, list);
    });

    const availableFacesByPokemon = new Map<number, typeof availableFaces>([]);
    availableFaces.forEach((face) => {
      const pokemonId = face.pokemonId;
      if (pokemonId == null) return;
      const list = availableFacesByPokemon.get(pokemonId) ?? [];
      list.push(face);
      availableFacesByPokemon.set(pokemonId, list);
    });

    const fixedFacesByPokemon = new Map<number, typeof fixedFaces>([]);
    fixedFaces.forEach((face) => {
      const pokemonId = face.pokemonId;
      if (pokemonId == null) return;
      const list = fixedFacesByPokemon.get(pokemonId) ?? [];
      list.push(face);
      fixedFacesByPokemon.set(pokemonId, list);
    });

    return {
      id: p.id,
      hp: p.hp,
      typeId: p.typeId,
      weaknessTypeId: p.weaknessTypeId,
      pokemonImage: p.pokemonImage,
      name: {
        en: p.enPokemonName,
        th: p.thPokemonName,
      },
      description: {
        en: p.enDescription,
        th: p.thDescription,
      },
      skillCards: (skillCardsByPokemon.get(p.id) || []).map((card) => {
        const ability = card.enFightingAbility || card.thFightingAbility 
          ? { en: card.enFightingAbility, th: card.thFightingAbility }
          : undefined;

        return {
          id: card.id,
          typeId: card.typeId,
          damage: card.damage,
          name: {
            en: card.enSkillName,
            th: card.thSkillName,
          },
          ...(ability && { fightingAbility: ability }),
          energyCosts: (energyCostsBySkillCard.get(card.id) || []).map((cost) => ({
            typeId: cost.typeId,
            quantity: cost.quantity,
          })),
          effects: (effectsBySkillCard.get(card.id) || []).map((eff) => ({
            // id: eff.effectId, // ถ้าไม่เอา effectId ออกจะซ้ำกับ id ของ skillCard ที่อยู่ข้างบน
            ability: {
              en: eff.effectName,
              th: eff.effectTh,
            },
            directions: eff.directions,
          })),
        };
      }),
      availableFaces: (availableFacesByPokemon.get(p.id) || []).map((face) => ({
        faceTypeId: face.faceTypeId,
        quantity: face.quantity,
      })),
      fixedFaces: (fixedFacesByPokemon.get(p.id) || []).map((face) => ({
        faceTypeId: face.faceTypeId,
        quantity: face.quantity,
      })),
    };
  },
  async listPokemonSets(): Promise<PokemonSetRow[]> {
    const pokemon = await db
      .select()
      .from(pokemonSets);
    return pokemon;
  }
};