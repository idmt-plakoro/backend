import { eq } from "drizzle-orm";
import { db } from "../db";
import { dicePresets } from "../db/schema";

export const dicePresetsRepository = {
  async getOneByPokemonId(pokemonId: number) {
    return await db.query.dicePresets.findMany({
      where: eq(dicePresets.pokemonId, pokemonId)
    });
  }
}