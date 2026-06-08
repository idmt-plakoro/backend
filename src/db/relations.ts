import { relations } from "drizzle-orm/relations";
import { types, pokemonSets, skillCards, dicePresets, savedSlots, users, effects, skillCardEffects, faceTypes, faceTypeElements, pokemonFixedFaces, pokemonAvailableFaces, skillCardEnergyCosts } from "./schema";

export const pokemonSetsRelations = relations(pokemonSets, ({one, many}) => ({
	type_typeId: one(types, {
		fields: [pokemonSets.typeId],
		references: [types.id],
		relationName: "pokemonSets_typeId_types_id"
	}),
	type_weaknessTypeId: one(types, {
		fields: [pokemonSets.weaknessTypeId],
		references: [types.id],
		relationName: "pokemonSets_weaknessTypeId_types_id"
	}),
	skillCards: many(skillCards),
	dicePresets: many(dicePresets),
	savedSlots: many(savedSlots),
	pokemonFixedFaces: many(pokemonFixedFaces),
	pokemonAvailableFaces: many(pokemonAvailableFaces),
}));

export const typesRelations = relations(types, ({many}) => ({
	pokemonSets_typeId: many(pokemonSets, {
		relationName: "pokemonSets_typeId_types_id"
	}),
	pokemonSets_weaknessTypeId: many(pokemonSets, {
		relationName: "pokemonSets_weaknessTypeId_types_id"
	}),
	skillCards: many(skillCards),
	faceTypeElements: many(faceTypeElements),
	skillCardEnergyCosts: many(skillCardEnergyCosts),
}));

export const skillCardsRelations = relations(skillCards, ({one, many}) => ({
	pokemonSet: one(pokemonSets, {
		fields: [skillCards.pokemonId],
		references: [pokemonSets.id]
	}),
	type: one(types, {
		fields: [skillCards.typeId],
		references: [types.id]
	}),
	skillCardEffects: many(skillCardEffects),
	skillCardEnergyCosts: many(skillCardEnergyCosts),
}));

export const dicePresetsRelations = relations(dicePresets, ({one}) => ({
	pokemonSet: one(pokemonSets, {
		fields: [dicePresets.pokemonId],
		references: [pokemonSets.id]
	}),
}));

export const savedSlotsRelations = relations(savedSlots, ({one}) => ({
	pokemonSet: one(pokemonSets, {
		fields: [savedSlots.pokemonId],
		references: [pokemonSets.id]
	}),
	user: one(users, {
		fields: [savedSlots.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	savedSlots: many(savedSlots),
}));

export const skillCardEffectsRelations = relations(skillCardEffects, ({one}) => ({
	effect: one(effects, {
		fields: [skillCardEffects.effectId],
		references: [effects.id]
	}),
	skillCard: one(skillCards, {
		fields: [skillCardEffects.skillCardId],
		references: [skillCards.id]
	}),
}));

export const effectsRelations = relations(effects, ({many}) => ({
	skillCardEffects: many(skillCardEffects),
}));

export const faceTypeElementsRelations = relations(faceTypeElements, ({one}) => ({
	faceType: one(faceTypes, {
		fields: [faceTypeElements.faceTypeId],
		references: [faceTypes.id]
	}),
	type: one(types, {
		fields: [faceTypeElements.typeId],
		references: [types.id]
	}),
}));

export const faceTypesRelations = relations(faceTypes, ({many}) => ({
	faceTypeElements: many(faceTypeElements),
	pokemonFixedFaces: many(pokemonFixedFaces),
	pokemonAvailableFaces: many(pokemonAvailableFaces),
}));

export const pokemonFixedFacesRelations = relations(pokemonFixedFaces, ({one}) => ({
	faceType: one(faceTypes, {
		fields: [pokemonFixedFaces.faceTypeId],
		references: [faceTypes.id]
	}),
	pokemonSet: one(pokemonSets, {
		fields: [pokemonFixedFaces.pokemonId],
		references: [pokemonSets.id]
	}),
}));

export const pokemonAvailableFacesRelations = relations(pokemonAvailableFaces, ({one}) => ({
	faceType: one(faceTypes, {
		fields: [pokemonAvailableFaces.faceTypeId],
		references: [faceTypes.id]
	}),
	pokemonSet: one(pokemonSets, {
		fields: [pokemonAvailableFaces.pokemonId],
		references: [pokemonSets.id]
	}),
}));

export const skillCardEnergyCostsRelations = relations(skillCardEnergyCosts, ({one}) => ({
	skillCard: one(skillCards, {
		fields: [skillCardEnergyCosts.skillCardId],
		references: [skillCards.id]
	}),
	type: one(types, {
		fields: [skillCardEnergyCosts.typeId],
		references: [types.id]
	}),
}));