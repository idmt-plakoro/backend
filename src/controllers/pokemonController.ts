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
  })
  .get("/:pokemonId", async ({ params, set }) => {
  try {
    const pokemonId = parseInt(params.pokemonId as string, 10);
    
    if (isNaN(pokemonId)) {
      set.status = 400;
      return { success: false, message: "Invalid pokemonId" };
    }

    const data = await pokemonService.getPokemonSetById(pokemonId);
    
    if (!data) {
      set.status = 404;
      return { success: false, message: "Pokemon not found" };
    }

    set.status = 200;
    return { success: true, data };
  } catch (error) {
    set.status = 500;
    return { success: false, message: "Internal server error" };
  }
  })
  .get("/list", async ({ set }) => {
    try {
      const data = await pokemonService.listPokemonSets();
      set.status = 200;
      return { success: true, data };
    } catch (error) {
      set.status = 500;
      return { success: false, message: "Internal server error" };
    }
  });