import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "jwt_secret_key",
    })
  )
  .macro({
    requireAuth: {
      async resolve({ cookie: { session }, jwt, status }) {
        const token = session.value as string | undefined;
        if (!token) {
          return status(401, { error: "Authentication required: no token provided" });
        }
        const profile = await jwt.verify(token).catch(() => null);

        if (!profile) {
          return status(401, { error: "Authentication session expired or invalid" });
        }

        return {
          id: profile.id as string,
          email: profile.email as string,
        };
      }
    }
  })