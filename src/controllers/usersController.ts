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

const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?& South\/\/=]*)$/;

const exportUserSchema = t.Object({
  email: t.Optional(t.Union([t.String(), t.Null()])),
  displayName: t.Optional(t.Union([t.String(), t.Null()])),
  avatarUrl: t.Optional(t.Union([t.String(), t.Null()])),
  createdAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  updatedAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()]))
});

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
      
      const publicUser = {
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt?.toISOString() || null,
        updatedAt: user.updatedAt?.toISOString() || null,
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
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: exportUserSchema
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
  .put("auth/account", async ({ set, id, email, body }) => {
    try {
      const updatedUser = await usersService.updateUser(id, body.displayName, body.avatarUrl);
      const publicUser = {
        email: updatedUser?.email || null,
        displayName: updatedUser?.displayName || null,
        avatarUrl: updatedUser?.avatarUrl || null,
        createdAt: updatedUser?.createdAt?.toISOString() || null,
        updatedAt: updatedUser?.updatedAt?.toISOString() || null,
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
      avatarUrl: t.Optional(t.String({
        pattern: urlRegex.source,
        error: "Invalid URL format for avatarUrl"
      })),
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: exportUserSchema
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  });