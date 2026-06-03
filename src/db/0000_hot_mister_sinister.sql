-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."directions" AS ENUM('stand', 'lie_on_your_back', 'upside_down', 'lie_face_down', 'lie_on_your_left_side', 'lie_on_your_right_side');--> statement-breakpoint
CREATE TABLE "face_types" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "types" (
	"id" serial PRIMARY KEY NOT NULL,
	"en_name" text,
	"th_name" text,
	"type_image" text
);
--> statement-breakpoint
CREATE TABLE "pokemon_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"en_pokemon_name" text,
	"th_pokemon_name" text,
	"hp" integer,
	"type_id" integer,
	"weakness_type_id" integer,
	"en_description" text,
	"th_description" text,
	"pokemon_image" text
);
--> statement-breakpoint
CREATE TABLE "skill_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"pokemon_id" integer,
	"en_skill_name" text,
	"th_skill_name" text,
	"type_id" integer,
	"damage" integer,
	"en_fighting_ability" text,
	"th_fighting_ability" text
);
--> statement-breakpoint
CREATE TABLE "effects" (
	"id" serial PRIMARY KEY NOT NULL,
	"directions" "directions"[],
	"th_effect" text,
	"en_effect" text
);
--> statement-breakpoint
CREATE TABLE "dice_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pokemon_id" integer,
	"en_preset_name" text,
	"th_preset_name" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" text,
	"email" text,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"slot_number" integer NOT NULL,
	"slot_name" text,
	"pokemon_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saved_slots_slot_number_check" CHECK ((slot_number >= 1) AND (slot_number <= 5))
);
--> statement-breakpoint
CREATE TABLE "face_type_elements" (
	"face_type_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	CONSTRAINT "face_type_elements_pkey" PRIMARY KEY("face_type_id","type_id")
);
--> statement-breakpoint
CREATE TABLE "skill_card_effects" (
	"skill_card_id" integer NOT NULL,
	"effect_id" integer NOT NULL,
	CONSTRAINT "skill_card_effects_pkey" PRIMARY KEY("effect_id","skill_card_id")
);
--> statement-breakpoint
CREATE TABLE "dice_preset_skills" (
	"preset_id" uuid NOT NULL,
	"skill_card_id" integer NOT NULL,
	CONSTRAINT "dice_preset_skills_pkey" PRIMARY KEY("preset_id","skill_card_id")
);
--> statement-breakpoint
CREATE TABLE "saved_slot_skills" (
	"saved_slot_id" uuid NOT NULL,
	"skill_card_id" integer NOT NULL,
	CONSTRAINT "saved_slot_skills_pkey" PRIMARY KEY("saved_slot_id","skill_card_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_fixed_faces" (
	"pokemon_id" integer NOT NULL,
	"face_type_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "pokemon_fixed_faces_pkey" PRIMARY KEY("face_type_id","pokemon_id")
);
--> statement-breakpoint
CREATE TABLE "pokemon_available_faces" (
	"pokemon_id" integer NOT NULL,
	"face_type_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "pokemon_available_faces_pkey" PRIMARY KEY("face_type_id","pokemon_id")
);
--> statement-breakpoint
CREATE TABLE "skill_card_energy_costs" (
	"skill_card_id" integer NOT NULL,
	"type_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "skill_card_energy_costs_pkey" PRIMARY KEY("skill_card_id","type_id")
);
--> statement-breakpoint
CREATE TABLE "dice_preset_faces" (
	"preset_id" uuid NOT NULL,
	"face_type_id" integer,
	"die_number" integer NOT NULL,
	"face_number" integer NOT NULL,
	CONSTRAINT "dice_preset_faces_pkey" PRIMARY KEY("die_number","face_number","preset_id"),
	CONSTRAINT "dice_preset_faces_die_number_check" CHECK ((die_number >= 1) AND (die_number <= 3)),
	CONSTRAINT "dice_preset_faces_face_number_check" CHECK ((face_number >= 1) AND (face_number <= 6))
);
--> statement-breakpoint
CREATE TABLE "saved_slot_faces" (
	"saved_slot_id" uuid NOT NULL,
	"face_type_id" integer,
	"die_number" integer NOT NULL,
	"face_number" integer NOT NULL,
	CONSTRAINT "saved_slot_faces_pkey" PRIMARY KEY("die_number","face_number","saved_slot_id"),
	CONSTRAINT "saved_slot_faces_die_number_check" CHECK ((die_number >= 1) AND (die_number <= 3)),
	CONSTRAINT "saved_slot_faces_face_number_check" CHECK ((face_number >= 1) AND (face_number <= 6))
);
--> statement-breakpoint
ALTER TABLE "pokemon_sets" ADD CONSTRAINT "pokemon_sets_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_sets" ADD CONSTRAINT "pokemon_sets_weakness_type_id_fkey" FOREIGN KEY ("weakness_type_id") REFERENCES "public"."types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_cards" ADD CONSTRAINT "skill_cards_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_cards" ADD CONSTRAINT "skill_cards_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_presets" ADD CONSTRAINT "dice_presets_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slots" ADD CONSTRAINT "saved_slots_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slots" ADD CONSTRAINT "saved_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "face_type_elements" ADD CONSTRAINT "face_type_elements_face_type_id_fkey" FOREIGN KEY ("face_type_id") REFERENCES "public"."face_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "face_type_elements" ADD CONSTRAINT "face_type_elements_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_card_effects" ADD CONSTRAINT "skill_card_effects_effect_id_fkey" FOREIGN KEY ("effect_id") REFERENCES "public"."effects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_card_effects" ADD CONSTRAINT "skill_card_effects_skill_card_id_fkey" FOREIGN KEY ("skill_card_id") REFERENCES "public"."skill_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_preset_skills" ADD CONSTRAINT "dice_preset_skills_preset_id_fkey" FOREIGN KEY ("preset_id") REFERENCES "public"."dice_presets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_preset_skills" ADD CONSTRAINT "dice_preset_skills_skill_card_id_fkey" FOREIGN KEY ("skill_card_id") REFERENCES "public"."skill_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slot_skills" ADD CONSTRAINT "saved_slot_skills_saved_slot_id_fkey" FOREIGN KEY ("saved_slot_id") REFERENCES "public"."saved_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slot_skills" ADD CONSTRAINT "saved_slot_skills_skill_card_id_fkey" FOREIGN KEY ("skill_card_id") REFERENCES "public"."skill_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_fixed_faces" ADD CONSTRAINT "pokemon_fixed_faces_face_type_id_fkey" FOREIGN KEY ("face_type_id") REFERENCES "public"."face_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_fixed_faces" ADD CONSTRAINT "pokemon_fixed_faces_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_available_faces" ADD CONSTRAINT "pokemon_available_faces_face_type_id_fkey" FOREIGN KEY ("face_type_id") REFERENCES "public"."face_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pokemon_available_faces" ADD CONSTRAINT "pokemon_available_faces_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "public"."pokemon_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_card_energy_costs" ADD CONSTRAINT "skill_card_energy_costs_skill_card_id_fkey" FOREIGN KEY ("skill_card_id") REFERENCES "public"."skill_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_card_energy_costs" ADD CONSTRAINT "skill_card_energy_costs_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_preset_faces" ADD CONSTRAINT "dice_preset_faces_face_type_id_fkey" FOREIGN KEY ("face_type_id") REFERENCES "public"."face_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dice_preset_faces" ADD CONSTRAINT "dice_preset_faces_preset_id_fkey" FOREIGN KEY ("preset_id") REFERENCES "public"."dice_presets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slot_faces" ADD CONSTRAINT "saved_slot_faces_face_type_id_fkey" FOREIGN KEY ("face_type_id") REFERENCES "public"."face_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_slot_faces" ADD CONSTRAINT "saved_slot_faces_saved_slot_id_fkey" FOREIGN KEY ("saved_slot_id") REFERENCES "public"."saved_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "saved_slots_user_id_slot_number_idx" ON "saved_slots" USING btree ("user_id" int4_ops,"slot_number" int4_ops);
*/