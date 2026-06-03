import { Elysia } from "elysia";
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
  });