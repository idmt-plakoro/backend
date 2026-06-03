import { db } from "../db";
import { types } from "../db/schema";
import { TypeName, TypeSummary } from "../models/typesModel";

export const typesRepository = {
	async listAll(): Promise<TypeSummary[]> {
		return db
			.select({
				id: types.id,
				enName: types.enName,
				thName: types.thName,
				typeImage: types.typeImage,
			})
			.from(types);
	},
	async listNames(): Promise<TypeName[]> {
		return db
			.select({
				enName: types.enName,
				thName: types.thName,
			})
			.from(types);
	},
};