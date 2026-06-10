import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { savedSlots } from "../db/schema";
import { SavedSlot, CreateSlotBody, UpdateSlotBody } from "../models/slotsModel";

export const slotsRepository = {
  async listSlotsByUser(userId: string): Promise<SavedSlot[]> {
    return await db
      .select()
      .from(savedSlots)
      .where(eq(savedSlots.userId, userId));
  },

  async getSlotByUserAndNumber(
    userId: string,
    slotNumber: number
  ): Promise<SavedSlot | null> {
    const [slot] = await db
      .select()
      .from(savedSlots)
      .where(and(eq(savedSlots.userId, userId), eq(savedSlots.slotNumber, slotNumber)));

    return slot ?? null;
  },

  async createSlot(userId: string, body: CreateSlotBody): Promise<SavedSlot> {
    const slotId = randomUUID();
    const now = new Date();
    const newSlot: SavedSlot = {
      id: slotId,
      userId,
      slotNumber: body.slotNumber,
      slotName: body.slotName ?? null,
      pokemonId: body.pokemonId,
      dice1: body.dice1,
      dice2: body.dice2,
      dice3: body.dice3,
      skills: body.skills ?? [],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(savedSlots).values(newSlot);
    return newSlot;
  },

  async updateSlot(
    userId: string,
    slotNumber: number,
    body: UpdateSlotBody
  ): Promise<SavedSlot | null> {
    const existing = await this.getSlotByUserAndNumber(userId, slotNumber);
    if (!existing) return null;

    const updatedSlot = {
      slotName: body.slotName === undefined ? existing.slotName : body.slotName,
      pokemonId: body.pokemonId === undefined ? existing.pokemonId : body.pokemonId,
      dice1: body.dice1 === undefined ? existing.dice1 : body.dice1,
      dice2: body.dice2 === undefined ? existing.dice2 : body.dice2,
      dice3: body.dice3 === undefined ? existing.dice3 : body.dice3,
      skills: body.skills === undefined ? existing.skills : body.skills,
      updatedAt: new Date(),
    };

    await db
      .update(savedSlots)
      .set(updatedSlot)
      .where(and(eq(savedSlots.userId, userId), eq(savedSlots.slotNumber, slotNumber)));

    return {
      ...existing,
      ...updatedSlot,
    };
  },

  async deleteSlot(userId: string, slotNumber: number): Promise<boolean> {
    const deleted = await db
      .delete(savedSlots)
      .where(and(eq(savedSlots.userId, userId), eq(savedSlots.slotNumber, slotNumber)))
      .returning({ id: savedSlots.id });

    return deleted.length !== 0;
  },
};
