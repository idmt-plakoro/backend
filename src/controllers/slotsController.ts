import { Elysia, t } from "elysia";
import { authPlugin } from "../plugins/auth";
import { slotsService } from "../services/slotsService";
import { CreateSlotBody, UpdateSlotBody } from "../models/slotsModel";

declare module "elysia" {
  export interface ElysiaApp {
    id: string;
    email: string;
  }
}

const slotSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  slotNumber: t.Number(),
  slotName: t.Optional(t.Union([t.String(), t.Null()])),
  pokemonId: t.Number(),
  createdAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  updatedAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
  dice1: t.Array(t.Number()),
  dice2: t.Array(t.Number()),
  dice3: t.Array(t.Number()),
  skills: t.Optional(t.Union([t.Array(t.Number()), t.Null()]))
});

const serializeSlot = (slot: any) => {
  if (!slot) return slot;
  return {
    ...slot,
    createdAt: slot.createdAt instanceof Date ? slot.createdAt.toISOString() : slot.createdAt,
    updatedAt: slot.updatedAt instanceof Date ? slot.updatedAt.toISOString() : slot.updatedAt,
  };
};

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
      return { success: true, data: slots.map(serializeSlot) };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true,
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: t.Array(slotSchema)
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })

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

      return { success: true, data: serializeSlot(slot) };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true,
    params: t.Object({
      slotNumber: t.String()
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: slotSchema
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String()
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

  .post("/", async ({ set, body, id }) => {
    try {
      const data = body as CreateSlotBody;
      const slot = await slotsService.createSlot(id, data);
      set.status = 201;
      return { success: true, data: serializeSlot(slot) };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true,
    body: t.Object({
      slotNumber: t.Number(),
      slotName: t.Optional(t.String()),
      pokemonId: t.Number(),
      skills: t.Array(t.Number()),
      dice1: t.Array(t.Number()),
      dice2: t.Array(t.Number()),
      dice3: t.Array(t.Number())
    }),
    response: {
      201: t.Object({
        success: t.Boolean(),
        data: slotSchema
      }),
      500: t.Object({
        success: t.Boolean(),
        message: t.String()
      })
    }
  })

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

      return { success: true, data: serializeSlot(slot) };
    } catch (error) {
      return handleError(set, error);
    }
  }, {
    requireAuth: true,
    params: t.Object({
      slotNumber: t.String()
    }),
    body: t.Object({
      slotName: t.Optional(t.String()),
      pokemonId: t.Optional(t.Number()),
      skills: t.Optional(t.Array(t.Number())),
      dice1: t.Optional(t.Array(t.Number())),
      dice2: t.Optional(t.Array(t.Number())),
      dice3: t.Optional(t.Array(t.Number()))
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        data: slotSchema
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String()
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
  }, {
    requireAuth: true,
    params: t.Object({
      slotNumber: t.String()
    }),
    response: {
      200: t.Object({
        success: t.Boolean(),
        message: t.String()
      }),
      400: t.Object({
        success: t.Boolean(),
        message: t.String()
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
  });