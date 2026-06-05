import { pokemonRepository } from "../repositories/pokemonRepository";

export const pokemonService = {
  listFullPokemonSets() {
    return pokemonRepository.listFullPokemonSets();
  },
};