import { exportDicePreset } from "../models/dicePresetsModel";
import { dicePresetsRepository } from "../repositories/dicePresetsRepository";

export const dicePresetsService = {
  async getOneByPokemonId(pokemonId: number): Promise<exportDicePreset[]> {
    const presets = await dicePresetsRepository.getOneByPokemonId(pokemonId);
    if (!presets.length) {
      throw new Error("Dice preset not found");
    }

    return presets.map(preset => ({
      dicePresetId: preset.id,
      pokemonId: preset.pokemonId,
      enPresetName: preset.enPresetName,
      thPresetName: preset.thPresetName,
      skillCards: (preset.skills || []).map(id => ({
        skillCardId: id
      })),
      dice1: preset.dice1,
      dice2: preset.dice2,
      dice3: preset.dice3
    }));
  }
}