import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", 
  out: "./src/db", 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});