import { db } from "../db";
import { FaceTypeWithElements } from "../models/faceTypesModel";

export const faceTypesRepository = {
  async listAllWithElements(): Promise<FaceTypeWithElements[]> {
    return db.query.faceTypes.findMany({
      with: {
        faceTypeElements: {
          with: { type: true }
        }
      }
    });
  }
}