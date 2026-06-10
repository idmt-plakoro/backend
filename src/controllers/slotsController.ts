import { Elysia } from "elysia";
import { authPlugin } from "../plugins/auth";
import { slotsService } from "../services/slotsService";
import { CreateSlotBody, UpdateSlotBody } from "../models/slotsModel";

declare module "elysia" {
  export interface ElysiaApp {
    id: string;
    email: string;
  }
}

const handleError = (set: { status?: number | string }, error: unknown) => {
  set.status = 500;
  console.error("Error in slotsController:", error);
  return { success: false, message: "Internal server error" };
};

export const slotsController = new Elysia({ prefix: "/api/slots" })
  .use(authPlugin)
  .get("/", async ({ set, id }) => {
    try {
      const slots = await slotsService.listSlotsByUser(id);
      return { success: true, data: slots };
    } catch (error) {
      return handleError(set, error);
    }
  }, { requireAuth: true })

  .get("/:slotNumber", async ({ set, params, id }) => {
    try {
      const slotNumber = Number(params.slotNumber);
      if (Number.isNaN(slotNumber)) {
        set.status = 400;
        return { success: false, message: "Invalid slot number" };
      }

      const slot = await slotsService.getSlotByUserAndNumber(id, slotNumber);
      if (!slot) {
        set.status = 404;
        return { success: false, message: "Slot not found" };
      }

      return { success: true, data: slot };
    } catch (error) {
      return handleError(set, error);
    }
  }, { requireAuth: true })

  .post("/", async ({ set, body, id }) => {
    try {
      const data = body as CreateSlotBody;
      const slot = await slotsService.createSlot(id, data);
      set.status = 201;
      return { success: true, data: slot };
    } catch (error) {
      return handleError(set, error);
    }
  }, { requireAuth: true })

  .put("/:slotNumber", async ({ set, params, body, id }) => {
    try {
      const slotNumber = Number(params.slotNumber);
      if (Number.isNaN(slotNumber)) {
        set.status = 400;
        return { success: false, message: "Invalid slot number" };
      }

      const data = body as UpdateSlotBody;
      const slot = await slotsService.updateSlot(id, slotNumber, data);
      if (!slot) {
        set.status = 404;
        return { success: false, message: "Slot not found" };
      }

      return { success: true, data: slot };
    } catch (error) {
      return handleError(set, error);
    }
  }, { requireAuth: true })

  .delete("/:slotNumber", async ({ set, params, id }) => {
    try {
      const slotNumber = Number(params.slotNumber);
      if (Number.isNaN(slotNumber)) {
        set.status = 400;
        return { success: false, message: "Invalid slot number" };
      }

      const deleted = await slotsService.deleteSlot(id, slotNumber);
      if (!deleted) {
        set.status = 404;
        return { success: false, message: "Slot not found" };
      }

      return { success: true, message: "Slot deleted" };
    } catch (error) {
      return handleError(set, error);
    }
  }, { requireAuth: true });