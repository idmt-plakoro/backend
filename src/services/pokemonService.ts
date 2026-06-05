import { pokemonRepository } from "../repositories/pokemonRepository";

export const pokemonService = {
  listFullPokemonSets() {
    return pokemonRepository.listFullPokemonSets();
  },
  getPokemonSetById(pokemonId: number) {
    return pokemonRepository.getPokemonSetById(pokemonId);
  },
  listPokemonSets() {
    return pokemonRepository.listPokemonSets();
  }
};