import { Elysia } from "elysia";
import { usersService } from "../services/usersService";
import { authPlugin } from "../plugins/auth";

declare module "elysia" {
  export interface ElysiaApp {
    id: string;
    email: string;
  }
}

const handleError = (set: { status?: number | string }, error: unknown) => {
  set.status = 500;

  console.error("Error in usersController:", error);

  return {
    success: false,
    message: "Internal server error",
  };
};

export const usersController = new Elysia()
  .use(authPlugin)
  .get("auth/account", async ({ set, id, email }) => {
    try {
      const user = await usersService.findUserById(id);
      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: "User not found",
        };
      }

      set.status = 200;
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true
  })