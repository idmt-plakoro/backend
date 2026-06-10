import Elysia, { t } from "elysia";
import { dicePresetsService } from "../services/dicePresetsService";

const handleError = (set: { status?: number | string }, error: unknown) => {
  set.status = 500;

  console.error("Error in dicePresetsController:", error);

  return {
    success: false,
    message: "Internal server error",
  };
};

export const dicePresetsController = new Elysia({ prefix: "/api" })
  .get("/presets/:pokemonId", async ({ set, params }) => {
    try {
      const dicePreset = await dicePresetsService.getOneByPokemonId(params.pokemonId);
        
      set.status = 200;      
      return {
        success: true,
        data: dicePreset
      };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    params: t.Object({
      pokemonId: t.Number({
        error: "part param pokemonId is required and must be a number"
      })
    })
  })