import { prisma } from "../../lib/prisma";
import { CrearViajeInput } from "./viaje.schema";

export const viajeRepository = {
  crear(data: CrearViajeInput) {
    return prisma.viaje.create({ data });
  },
};
