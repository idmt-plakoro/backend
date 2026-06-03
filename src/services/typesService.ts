import { typesRepository } from "../repositories/typesRepository";

export const typesService = {
	listAll() {
		return typesRepository.listAll();
	},
	listNames() {
		return typesRepository.listNames();
	},
};