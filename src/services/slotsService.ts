import { slotsRepository } from "../repositories/slotsRepository";
import { pokemonRepository } from "../repositories/pokemonRepository";
import { CreateSlotBody, UpdateSlotBody } from "../models/slotsModel";


async function validateSlotBody(
  body: CreateSlotBody
) {
  const pokemon =
  await pokemonRepository.getPokemonSetById(
      body.pokemonId
    );

  if (!pokemon) {
    throw new Error("Pokemon not found");
  }

  if (body.skills.length > 5) {
    throw new Error("Limit 5 skills");
  }

  /* Dice Validation */

  (['dice1', 'dice2', 'dice3'] as const).forEach((dice) => {
    if (body[dice].length !== 6) {
      throw new Error(`${dice} must have 6 faces`);
    }
  });

  //This point means the first 2 faces of each dice are for fixed faces,
  //and the rest 4 faces are for available faces. 
  
  const requestFixed = [
    ...body.dice1.slice(0, 2),
    ...body.dice2.slice(0, 2),
    ...body.dice3.slice(0, 2),
  ];

  const requestAvailable = [
    ...body.dice1.slice(2),
    ...body.dice2.slice(2),
    ...body.dice3.slice(2),
  ];

  const pokemonFixedFaces =
    pokemon.fixedFaces.flatMap(face =>
      Array(face.quantity ?? 0).fill(face.faceTypeId)
    );

  const pokemonAvailableFaces =
    pokemon.availableFaces.flatMap(face =>
      Array(face.quantity ?? 0).fill(face.faceTypeId)
    );

  requestFixed.sort((a, b) => a - b);
  pokemonFixedFaces.sort((a, b) => a - b);

  if (
    requestFixed.toString() !==
    pokemonFixedFaces.toString()
  ) {
    throw new Error(
      "Fixed faces is Invalid. Must contain exactly the fixed faces of the pokemon"
    );
  }

  const counts = new Map<number, number>();

  for (const id of pokemonAvailableFaces) {
    counts.set(
      id,
      (counts.get(id) ?? 0) + 1
    );
  }

  for (const id of requestAvailable) {
    const remain =
      counts.get(id) ?? 0;

    if (remain <= 0) {
      throw new Error(
        `Face ${id} unavailable or exceeded the limit in ${pokemon.name.en}`
      );
    }

    counts.set(id, remain - 1);
  }

  /* Skill Validation */

  const allowedSkills = new Set(pokemon.skillCards.map(skill => skill.id));
  
  for (const skillId of body.skills) {
    if (!allowedSkills.has(skillId)) {
      throw new Error(
        `Skill ${skillId} is invalid in ${pokemon.name.en}`
      );
    }
  }
  body.skills = [...new Set(body.skills)];
  
  return pokemon;
}

export const slotsService = {
  listSlotsByUser(userId: string) {
    return slotsRepository.listSlotsByUser(userId);
  },

  getSlotByUserAndNumber(userId: string, slotNumber: number) {
    return slotsRepository.getSlotByUserAndNumber(userId, slotNumber);
  },

  async createSlot(userId: string, body: CreateSlotBody) {
    await validateSlotBody(body);
    return slotsRepository.createSlot(userId, body);
  },

  async updateSlot(userId: string, slotNumber: number, body: UpdateSlotBody) {
    const currentSlot =
    await slotsRepository.getSlotByUserAndNumber(
      userId,
      slotNumber
    );

  if (!currentSlot) {
    throw new Error("Slot not found");
  }

  const mergedBody: CreateSlotBody = {
    slotNumber: currentSlot.slotNumber,
    slotName:
      body.slotName ??
      currentSlot.slotName ??
      undefined,

    pokemonId:
      body.pokemonId ??
      currentSlot.pokemonId,

    skills:
      body.skills ??
      currentSlot.skills ??
      [],

    dice1:
      body.dice1 ??
      currentSlot.dice1,

    dice2:
      body.dice2 ??
      currentSlot.dice2,

    dice3:
      body.dice3 ??
      currentSlot.dice3,
  };

  await validateSlotBody(mergedBody);
  body.skills = [...new Set(mergedBody.skills)];
    return slotsRepository.updateSlot(userId, slotNumber, body);
  },

  deleteSlot(userId: string, slotNumber: number) {
    return slotsRepository.deleteSlot(userId, slotNumber);
  },
};