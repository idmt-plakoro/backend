import { Elysia, t } from "elysia";
import { pokemonService } from "../services/pokemonService";

// Shared schemas
const localizedStringSchema = t.Object({
  en: t.Union([t.String(), t.Null()]),
  th: t.Union([t.String(), t.Null()])
});

const pokemonSetFullSchema = t.Object({
  id: t.Number(),
  name: localizedStringSchema,
  hp: t.Union([t.Number(), t.Null()]),
  typeId: t.Union([t.Number(), t.Null()]),
  weaknessTypeId: t.Union([t.Number(), t.Null()]),
  description: localizedStringSchema,
  pokemonImage: t.Union([t.String(), t.Null()]),
  skillCards: t.Array(t.Object({
    id: t.Number(),
    name: localizedStringSchema,
    typeId: t.Union([t.Number(), t.Null()]),
    damage: t.Union([t.Number(), t.Null()]),
    fightingAbility: t.Optional(localizedStringSchema),
    energyCosts: t.Array(t.Object({
      typeId: t.Union([t.Number(), t.Null()]),
      quantity: t.Union([t.Number(), t.Null()])
    })),
    effects: t.Array(t.Object({
      ability: localizedStringSchema,
      directions: t.Union([t.Array(t.String()), t.Null()])
    }))
  })),
  availableFaces: t.Array(t.Object({
    faceTypeId: t.Union([t.Number(), t.Null()]),
    quantity: t.Union([t.Number(), t.Null()])
  })),
  fixedFaces: t.Array(t.Object({
    faceTypeId: t.Union([t.Number(), t.Null()]),
    quantity: t.Union([t.Number(), t.Null()])
  }))
});

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
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(pokemonSetFullSchema)
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
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
  }, {
    params: t.Object({
      pokemonId: t.String()
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: pokemonSetFullSchema
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String()
      }),
      404: t.Object({
        success: t.Boolean(),
        message: t.String()
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
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
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(t.Object({
          id: t.Number(),
          enPokemonName: t.Union([t.String(), t.Null()]),
          thPokemonName: t.Union([t.String(), t.Null()]),
          hp: t.Union([t.Number(), t.Null()]),
          typeId: t.Union([t.Number(), t.Null()]),
          weaknessTypeId: t.Union([t.Number(), t.Null()]),
          enDescription: t.Union([t.String(), t.Null()]),
          thDescription: t.Union([t.String(), t.Null()]),
          pokemonImage: t.Union([t.String(), t.Null()])
        }))
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  });