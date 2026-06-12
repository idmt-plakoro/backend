import { Elysia, t } from "elysia";
import { typesService } from "../services/typesService";

const handleError = (set: { status?: number | string }, error: unknown) => {
  set.status = 500;

  console.error("Error in typesController:", error);

  return {
    success: false,
    message: "Internal server error",
  };
};

export const typesController = new Elysia({ prefix: "/api/example" })
  .get("/types", async ({ set }) => {
    try {
      const types = await typesService.listAll();

      set.status = 200;

      return {
        success: true,
        data: types,
      };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(t.Object({
          id: t.Number(),
          enName: t.Optional(t.Union([t.String(), t.Null()])),
          thName: t.Optional(t.Union([t.String(), t.Null()])),
          typeImage: t.Optional(t.Union([t.String(), t.Null()]))
        }))
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })
  .get("/types-name", async ({ set }) => {
    try {
      const types = await typesService.listNames();

      set.status = 200;

      return {
        success: true,
        data: types,
      };
    } catch (error: unknown) {
      return handleError(set, error);
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(t.Object({
          enName: t.Optional(t.Union([t.String(), t.Null()])),
          thName: t.Optional(t.Union([t.String(), t.Null()]))
        }))
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  });