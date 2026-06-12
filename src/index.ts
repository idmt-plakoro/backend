import { Elysia } from "elysia";
import { db } from "./db";
import { typesController } from "./controllers/typesController";
import { authPlugin } from "./plugins/auth";
import { cors } from "@elysiajs/cors";
import { usersController } from "./controllers/usersController";
import { googleAuthPlugin } from "./auth/google";
import { faceTypesController } from "./controllers/faceTypesController";
import { pokemonController } from "./controllers/pokemonController";
import { slotsController } from "./controllers/slotsController";
import { dicePresetsController } from "./controllers/dicePresetsController";
import { openapi, fromTypes } from "@elysiajs/openapi";
import { writeFileSync } from "fs";

export const app = new Elysia()
  .decorate("db", db) // Decorate the app with the database instance
  .use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000", // Allow requests from the frontend URL
    credentials: true, // Allow cookies to be sent with requests
  }))
  // .use(swagger({
  //   provider: 'scalar'
  // }))
  .use(
    openapi({
      path: '/openapi',
      references: fromTypes(),
      documentation: {
        openapi: "3.1.0",
        info: {
          title: "Elysia Documentation",
          version: "1.0.0"
        }
      }
    })
  )
  .use(authPlugin) // Use the authentication plugin
  .use(googleAuthPlugin)
  .use(typesController)
  .use(usersController)
  .use(faceTypesController)
  .use(pokemonController)
  .use(slotsController)
  .use(dicePresetsController)
  .get("/", () => "Hello Elysia").listen(3000);

if (process.env.NODE_ENV !== "production") {
  setTimeout(async () => {
    try {
      const response = await fetch('http://localhost:3000/openapi/json')
      const schema = await response.json()
      writeFileSync('./openapi.json', JSON.stringify(schema, null, 2))
      console.log("📝 Generated openapi.json")
    } catch (error) {
      console.error("Failed to generate openapi.json:", error)
    }
  }, 1000);
}
