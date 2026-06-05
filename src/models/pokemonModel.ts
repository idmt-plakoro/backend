export type pokemon = {
	id: number;
	enPokemonName: string | null;
	thPokemonName: string | null;
    hp: number;
    typeId: number;
    weaknessId: number;
    enDescription: string | null;
    thDescription: string | null;
	pokemonImage: string | null;
};


export type pokemonSet = {
    id: number;
	enPokemonName: string | null;
	thPokemonName: string | null;
}
