import { Elysia } from "elysia";
import { db } from "./db";
import { typesController } from "./controllers/typesController";
import { authPlugin } from "./plugins/auth";
import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { usersController } from "./controllers/usersController";
import { googleAuthPlugin } from "./auth/google";
import { faceTypesController } from "./controllers/faceTypesController";
import { pokemonController } from "./controllers/pokemonController";
import { slotsController } from "./controllers/slotsController";
import { dicePresetsController } from "./controllers/dicePresetsController";

const app = new Elysia()
  .decorate("db", db) // Decorate the app with the database instance
  .use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow requests from the frontend URL
    credentials: true, // Allow cookies to be sent with requests
  }))
  .use(swagger())
  .use(authPlugin) // Use the authentication plugin
  .use(googleAuthPlugin)
  .use(typesController)
  .use(usersController)
  .use(faceTypesController)
  .use(pokemonController)
  .use(slotsController)
  .use(dicePresetsController)
  .get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
