import { Elysia, t } from "elysia";
import { usersService } from "../services/usersService";
import { authPlugin } from "../plugins/auth";
import { exportUser } from "../models/usersModel";

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
      
      const publicUser: exportUser = {
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      set.status = 200;
      return {
        success: true,
        data: publicUser,
      };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true
  })
  .put("auth/account", async ({ set, id, email, body }) => {
    try {
      const updatedUser = await usersService.updateUser(id, body.displayName, body.avatarUrl);
      const publicUser: exportUser = {
        email: updatedUser?.email || null,
        displayName: updatedUser?.displayName || null,
        avatarUrl: updatedUser?.avatarUrl || null,
        createdAt: updatedUser?.createdAt || null,
        updatedAt: updatedUser?.updatedAt || null,
      };

      set.status = 200;
      return {
        success: true,
        data: publicUser,
      };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true,
    body: t.Object({
      displayName: t.Optional(t.String()),
      avatarUrl: t.Optional(t.String()),
    })
  });