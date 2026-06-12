import Elysia, { t } from "elysia";
import { faceTypesService } from "../services/faceTypesService";
import { exportFaceType } from "../models/faceTypesModel";

const handleError = (set: { status?: number | string }, error: unknown) => {
  set.status = 500;

  console.error("Error in faceTypesController:", error);

  return {
    success: false,
    message: "Internal server error",
  };
};

export const faceTypesController = new Elysia({ prefix: "/api/face-types" })
  .get("/", async ({ set }) => {
    try {
      const faceTypes: exportFaceType[] = await faceTypesService.listAllWithElements();

      set.status = 200;

      return {
        success: true,
        data: faceTypes,
      };
    } catch (error: unknown) {
      set.status = 500;
      return handleError(set, error);
    }
  }, {
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(t.Object({
          faceTypesId: t.Number(),
          types: t.Array(t.Object({
            id: t.Number(),
            enName: t.Optional(t.Union([t.String(), t.Null()])),
            thName: t.Optional(t.Union([t.String(), t.Null()])),
            typeImage: t.Optional(t.Union([t.String(), t.Null()]))
          }))
        }))
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  });