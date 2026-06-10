import Elysia from "elysia";
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
  });