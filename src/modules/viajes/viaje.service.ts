import { notFound } from "../../errors/AppError";
import { conductorRepository } from "../conductores/conductor.repository";
import { viajeRepository } from "./viaje.repository";
import { CrearViajeInput } from "./viaje.schema";

export const viajeService = {
  async crear(input: CrearViajeInput) {
    const conductor = await conductorRepository.existePorId(input.conductorId);
    if (!conductor) {
      throw notFound("El conductor indicado no existe");
    }
    return viajeRepository.crear(input);
  },
};
