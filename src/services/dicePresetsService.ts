import { exportDicePreset } from "../models/dicePresetsModel";
import { dicePresetsRepository } from "../repositories/dicePresetsRepository";

export const dicePresetsService = {
  async getOneByPokemonId(pokemonId: number): Promise<exportDicePreset[]> {
    const presets = await dicePresetsRepository.getOneByPokemonId(pokemonId);
    if (!presets.length) {
      throw new Error("Dice preset not found");
    }

    return presets.map((preset) => {
      const dice = Array.from(
        preset.dicePresetFaces
          .reduce(
            (acc, row) => {
              const die = acc.get(row.dieNumber) ?? {
                diceNumber: row.dieNumber,
                faces: []
              };

              die.faces.push({
                faceNumber: row.faceNumber,
                faceTypeId: row.faceTypeId
              });

              acc.set(row.dieNumber, die);
              return acc;
            },
            new Map<
              number,
              { diceNumber: number; faces: { faceNumber: number; faceTypeId: number }[] }
            >()
          )
          .values()
      );

      return {
        dicePresetId: preset.id,
        pokemonId: preset.pokemonId,
        enPresetName: preset.enPresetName,
        thPresetName: preset.thPresetName,
        SkillCards: preset.dicePresetSkills.map((skill) => ({
          skillCardId: skill.skillCardId
        })),
        dice
      };
    });
  }
}