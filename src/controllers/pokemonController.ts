import { Elysia } from "elysia";
import { pokemonService } from "../services/pokemonService";

export const pokemonController = new Elysia({ prefix: "/api/pokemon" })
  .get("/", async ({ set }) => {
    try {
      const data = await pokemonService.listFullPokemonSets();
      set.status = 200;
      return { success: true, data };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  });