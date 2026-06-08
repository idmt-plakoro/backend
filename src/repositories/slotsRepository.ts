import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  savedSlots,
  savedSlotSkills,
  savedSlotFaces,
} from "../db/schema";
import {
  SavedSlotFull,
  SavedSlotRow,
  SavedSlotSkillRow,
  SavedSlotFaceRow,
  CreateSlotBody,
  UpdateSlotBody,
} from "../models/slotsModel";

const buildSavedSlot = (
  slot: SavedSlotRow,
  skills: SavedSlotSkillRow[],
  faces: SavedSlotFaceRow[]
): SavedSlotFull => ({
  ...slot,
  skills,
  faces,
});

export const slotsRepository = {
  async listSlotsByUser(userId: string): Promise<SavedSlotFull[]> {
    const slots = await db
      .select()
      .from(savedSlots)
      .where(eq(savedSlots.userId, userId));

    const slotIds = slots.map((slot) => slot.id);
    if (!slotIds.length) return [];

    const skills = await db
      .select()
      .from(savedSlotSkills)
      .where(eq(savedSlotSkills.savedSlotId, slotIds[0])); // placeholder; will fetch all below

    const faces = await db
      .select()
      .from(savedSlotFaces)
      .where(eq(savedSlotFaces.savedSlotId, slotIds[0])); // placeholder; will fetch all below

    // Drizzle currently may not support inArray from your version cleanly,
    // so if you need all children, fetch per slot or use a second raw query.
    // The safest approach here is to fetch with a filter in code:
    const allSkills = await db.select().from(savedSlotSkills);
    const allFaces = await db.select().from(savedSlotFaces);

    return slots.map((slot) => ({
      ...slot,
      skills: allSkills.filter((skill) => skill.savedSlotId === slot.id),
      faces: allFaces.filter((face) => face.savedSlotId === slot.id),
    }));
  },

  async getSlotByUserAndNumber(
    userId: string,
    slotNumber: number
  ): Promise<SavedSlotFull | null> {
    const [slot] = await db
      .select()
      .from(savedSlots)
      .where(
        eq(savedSlots.userId, userId),
        eq(savedSlots.slotNumber, slotNumber)
      );

    if (!slot) return null;

    const skills = await db
      .select()
      .from(savedSlotSkills)
      .where(eq(savedSlotSkills.savedSlotId, slot.id));

    const faces = await db
      .select()
      .from(savedSlotFaces)
      .where(eq(savedSlotFaces.savedSlotId, slot.id));

    return buildSavedSlot(slot, skills, faces);
  },

  async createSlot(
    userId: string,
    body: CreateSlotBody
  ): Promise<SavedSlotFull> {
    const slotId = randomUUID();

    const newSlot = {
      id: slotId,
      userId,
      slotNumber: body.slotNumber,
      slotName: body.slotName ?? null,
      pokemonId: body.pokemonId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(savedSlots).values(newSlot);

    const skillRows: SavedSlotSkillRow[] = body.skills.map((skillCardId) => ({
      savedSlotId: slotId,
      skillCardId,
    }));

    const faceRows: SavedSlotFaceRow[] = body.faces.map((face) => ({
      savedSlotId: slotId,
      faceTypeId: face.faceTypeId,
      dieNumber: face.dieNumber,
      faceNumber: face.faceNumber,
    }));

    if (skillRows.length) {
      await db.insert(savedSlotSkills).values(...skillRows);
    }

    if (faceRows.length) {
      await db.insert(savedSlotFaces).values(...faceRows);
    }

    return buildSavedSlot(newSlot, skillRows, faceRows);
  },

  async updateSlot(
    userId: string,
    slotNumber: number,
    body: UpdateSlotBody
  ): Promise<SavedSlotFull | null> {
    const existing = await this.getSlotByUserAndNumber(userId, slotNumber);
    if (!existing) return null;

    const updatedSlot = {
      ...(body.slotName === undefined ? { slotName: existing.slotName } : { slotName: body.slotName }),
      ...(body.pokemonId === undefined ? { pokemonId: existing.pokemonId } : { pokemonId: body.pokemonId }),
      updatedAt: new Date().toISOString(),
    };

    await db
      .update(savedSlots)
      .set(updatedSlot)
      .where(
        eq(savedSlots.userId, userId),
        eq(savedSlots.slotNumber, slotNumber)
      );

    if (body.skills) {
      await db
        .delete(savedSlotSkills)
        .where(eq(savedSlotSkills.savedSlotId, existing.id));
      const skillRows: SavedSlotSkillRow[] = body.skills.map((skillCardId) => ({
        savedSlotId: existing.id,
        skillCardId,
      }));
      if (skillRows.length) {
        await db.insert(savedSlotSkills).values(...skillRows);
      }
    }

    if (body.faces) {
      await db
        .delete(savedSlotFaces)
        .where(eq(savedSlotFaces.savedSlotId, existing.id));
      const faceRows: SavedSlotFaceRow[] = body.faces.map((face) => ({
        savedSlotId: existing.id,
        faceTypeId: face.faceTypeId,
        dieNumber: face.dieNumber,
        faceNumber: face.faceNumber,
      }));
      if (faceRows.length) {
        await db.insert(savedSlotFaces).values(...faceRows);
      }
    }

    return this.getSlotByUserAndNumber(userId, slotNumber);
  },

  async deleteSlot(userId: string, slotNumber: number): Promise<boolean> {
    const result = await db
      .delete(savedSlots)
      .where(
        eq(savedSlots.userId, userId),
        eq(savedSlots.slotNumber, slotNumber)
      );

    return result.rows?.length !== 0;
  },
};