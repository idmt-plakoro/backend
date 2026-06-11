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
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(t.Object({
          dicePresetId: t.String(),
          pokemonId: t.Number(),
          enPresetName: t.Union([t.String(), t.Null()]),
          thPresetName: t.Union([t.String(), t.Null()]),
          skillCards: t.Union([
            t.Null(),
            t.Array(t.Object({
              skillCardId: t.Number()
            }))
          ]),
          dice1: t.Array(t.Object({ faceTypeId: t.Number() })),
          dice2: t.Array(t.Object({ faceTypeId: t.Number() })),
          dice3: t.Array(t.Object({ faceTypeId: t.Number() }))
        }))
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })