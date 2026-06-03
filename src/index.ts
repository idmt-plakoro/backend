import { Elysia } from "elysia";
import { db } from "./db";
import { typesController } from "./controllers/typesController";

const app = new Elysia()
  .decorate("db", db) // Decorate the app with the database instance
  .use(typesController)
  .get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
