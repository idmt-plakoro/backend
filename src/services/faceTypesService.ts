import { exportFaceType } from "../models/faceTypesModel";
import { faceTypesRepository } from "../repositories/faceTypesRepository";

export const faceTypesService = {
  async listAllWithElements() {
    const result = await faceTypesRepository.listAllWithElements();

    if (!result || result.length === 0) {
      throw new Error("Face types not found");
    }

    const faceTypes: exportFaceType[] = result.map((faceType) => ({
      faceTypesId: faceType.id,
      types: faceType.faceTypeElements.flatMap((element) => {
        const typeData = {
          id: element.type.id,
          enName: element.type.enName,
          thName: element.type.thName,
          typeImage: element.type.typeImage,
        };
        const quantity = element.quantity ?? 1;

        return Array.from({ length: quantity }, () => ({ ...typeData }));
      })
    }));

    return faceTypes;
  }
}