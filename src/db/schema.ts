import { pgTable, serial, text, foreignKey, integer, uuid, timestamp, uniqueIndex, check, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const directions = pgEnum("directions", ['Upright', 'FaceUp', 'UpsideDown', 'FaceDown', 'LeftSide', 'RightSide'])


export const faceTypes = pgTable("face_types", {
	id: serial().primaryKey().notNull(),
});

export const types = pgTable("types", {
	id: serial().primaryKey().notNull(),
	enName: text("en_name"),
	thName: text("th_name"),
	typeImage: text("type_image"),
});

export const pokemonSets = pgTable("pokemon_sets", {
	id: serial().primaryKey().notNull(),
	enPokemonName: text("en_pokemon_name"),
	thPokemonName: text("th_pokemon_name"),
	hp: integer().notNull(),
	typeId: integer("type_id").notNull(),
	weaknessTypeId: integer("weakness_type_id").notNull(),
	enDescription: text("en_description"),
	thDescription: text("th_description"),
	pokemonImage: text("pokemon_image"),
}, (table) => [
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [types.id],
			name: "pokemon_sets_type_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.weaknessTypeId],
			foreignColumns: [types.id],
			name: "pokemon_sets_weakness_type_id_fkey"
		}).onDelete("set null"),
]);

export const skillCards = pgTable("skill_cards", {
	id: serial().primaryKey().notNull(),
	pokemonId: integer("pokemon_id").notNull(),
	enSkillName: text("en_skill_name"),
	thSkillName: text("th_skill_name"),
	typeId: integer("type_id").notNull(),
	damage: integer().notNull(),
	enFightingAbility: text("en_fighting_ability"),
	thFightingAbility: text("th_fighting_ability"),
}, (table) => [
	foreignKey({
			columns: [table.pokemonId],
			foreignColumns: [pokemonSets.id],
			name: "skill_cards_pokemon_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [types.id],
			name: "skill_cards_type_id_fkey"
		}).onDelete("cascade"),
]);

export const effects = pgTable("effects", {
	id: serial().primaryKey().notNull(),
	directions: directions().array(),
	thEffect: text("th_effect"),
	enEffect: text("en_effect"),
});

export const dicePresets = pgTable("dice_presets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	pokemonId: integer("pokemon_id").notNull(),
	enPresetName: text("en_preset_name"),
	thPresetName: text("th_preset_name"),
}, (table) => [
	foreignKey({
			columns: [table.pokemonId],
			foreignColumns: [pokemonSets.id],
			name: "dice_presets_pokemon_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	googleId: text("google_id").notNull(),
	email: text().notNull(),
	displayName: text("display_name"),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const savedSlots = pgTable("saved_slots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	slotNumber: integer("slot_number").notNull(),
	slotName: text("slot_name"),
	pokemonId: integer("pokemon_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	uniqueIndex("saved_slots_user_id_slot_number_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.slotNumber.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.pokemonId],
			foreignColumns: [pokemonSets.id],
			name: "saved_slots_pokemon_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_slots_user_id_fkey"
		}).onDelete("cascade"),
	check("saved_slots_slot_number_check", sql`(slot_number >= 1) AND (slot_number <= 5)`),
]);

export const skillCardEffects = pgTable("skill_card_effects", {
	skillCardId: integer("skill_card_id").notNull(),
	effectId: integer("effect_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.effectId],
			foreignColumns: [effects.id],
			name: "skill_card_effects_effect_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skillCardId],
			foreignColumns: [skillCards.id],
			name: "skill_card_effects_skill_card_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.effectId, table.skillCardId], name: "skill_card_effects_pkey"}),
]);

export const dicePresetSkills = pgTable("dice_preset_skills", {
	presetId: uuid("preset_id").notNull(),
	skillCardId: integer("skill_card_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.presetId],
			foreignColumns: [dicePresets.id],
			name: "dice_preset_skills_preset_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skillCardId],
			foreignColumns: [skillCards.id],
			name: "dice_preset_skills_skill_card_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.presetId, table.skillCardId], name: "dice_preset_skills_pkey"}),
]);

export const savedSlotSkills = pgTable("saved_slot_skills", {
	savedSlotId: uuid("saved_slot_id").notNull(),
	skillCardId: integer("skill_card_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.savedSlotId],
			foreignColumns: [savedSlots.id],
			name: "saved_slot_skills_saved_slot_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.skillCardId],
			foreignColumns: [skillCards.id],
			name: "saved_slot_skills_skill_card_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.savedSlotId, table.skillCardId], name: "saved_slot_skills_pkey"}),
]);

export const faceTypeElements = pgTable("face_type_elements", {
	faceTypeId: integer("face_type_id").notNull(),
	typeId: integer("type_id").notNull(),
	quantity: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faceTypeId],
			foreignColumns: [faceTypes.id],
			name: "face_type_elements_face_type_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [types.id],
			name: "face_type_elements_type_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.faceTypeId, table.typeId], name: "face_type_elements_pkey"}),
]);

export const pokemonFixedFaces = pgTable("pokemon_fixed_faces", {
	pokemonId: integer("pokemon_id").notNull(),
	faceTypeId: integer("face_type_id").notNull(),
	quantity: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faceTypeId],
			foreignColumns: [faceTypes.id],
			name: "pokemon_fixed_faces_face_type_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.pokemonId],
			foreignColumns: [pokemonSets.id],
			name: "pokemon_fixed_faces_pokemon_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.faceTypeId, table.pokemonId], name: "pokemon_fixed_faces_pkey"}),
]);

export const pokemonAvailableFaces = pgTable("pokemon_available_faces", {
	pokemonId: integer("pokemon_id").notNull(),
	faceTypeId: integer("face_type_id").notNull(),
	quantity: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faceTypeId],
			foreignColumns: [faceTypes.id],
			name: "pokemon_available_faces_face_type_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.pokemonId],
			foreignColumns: [pokemonSets.id],
			name: "pokemon_available_faces_pokemon_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.faceTypeId, table.pokemonId], name: "pokemon_available_faces_pkey"}),
]);

export const skillCardEnergyCosts = pgTable("skill_card_energy_costs", {
	skillCardId: integer("skill_card_id").notNull(),
	typeId: integer("type_id").notNull(),
	quantity: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.skillCardId],
			foreignColumns: [skillCards.id],
			name: "skill_card_energy_costs_skill_card_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.typeId],
			foreignColumns: [types.id],
			name: "skill_card_energy_costs_type_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.skillCardId, table.typeId], name: "skill_card_energy_costs_pkey"}),
]);

export const dicePresetFaces = pgTable("dice_preset_faces", {
	presetId: uuid("preset_id").notNull(),
	faceTypeId: integer("face_type_id").notNull(),
	dieNumber: integer("die_number").notNull(),
	faceNumber: integer("face_number").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faceTypeId],
			foreignColumns: [faceTypes.id],
			name: "dice_preset_faces_face_type_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.presetId],
			foreignColumns: [dicePresets.id],
			name: "dice_preset_faces_preset_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.dieNumber, table.faceNumber, table.presetId], name: "dice_preset_faces_pkey"}),
	check("dice_preset_faces_die_number_check", sql`(die_number >= 1) AND (die_number <= 3)`),
	check("dice_preset_faces_face_number_check", sql`(face_number >= 1) AND (face_number <= 6)`),
]);

export const savedSlotFaces = pgTable("saved_slot_faces", {
	savedSlotId: uuid("saved_slot_id").notNull(),
	faceTypeId: integer("face_type_id").notNull(),
	dieNumber: integer("die_number").notNull(),
	faceNumber: integer("face_number").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.faceTypeId],
			foreignColumns: [faceTypes.id],
			name: "saved_slot_faces_face_type_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.savedSlotId],
			foreignColumns: [savedSlots.id],
			name: "saved_slot_faces_saved_slot_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.dieNumber, table.faceNumber, table.savedSlotId], name: "saved_slot_faces_pkey"}),
	check("saved_slot_faces_die_number_check", sql`(die_number >= 1) AND (die_number <= 3)`),
	check("saved_slot_faces_face_number_check", sql`(face_number >= 1) AND (face_number <= 6)`),
]);
