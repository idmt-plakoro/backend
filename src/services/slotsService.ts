import { slotsRepository } from "../repositories/slotsRepository";
import { CreateSlotBody, UpdateSlotBody } from "../models/slotsModel";

export const slotsService = {
  listSlotsByUser(userId: string) {
    return slotsRepository.listSlotsByUser(userId);
  },

  getSlotByUserAndNumber(userId: string, slotNumber: number) {
    return slotsRepository.getSlotByUserAndNumber(userId, slotNumber);
  },

  createSlot(userId: string, body: CreateSlotBody) {
    return slotsRepository.createSlot(userId, body);
  },

  updateSlot(userId: string, slotNumber: number, body: UpdateSlotBody) {
    return slotsRepository.updateSlot(userId, slotNumber, body);
  },

  deleteSlot(userId: string, slotNumber: number) {
    return slotsRepository.deleteSlot(userId, slotNumber);
  },
};