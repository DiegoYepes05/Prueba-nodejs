import { prisma } from "../../lib/prisma";
import { CrearConductorInput } from "./conductor.schema";

export const conductorRepository = {
  crear(data: CrearConductorInput) {
    return prisma.conductor.create({ data });
  },

  buscarPorId(id: string) {
    return prisma.conductor.findUnique({
      where: { id },
      include: { viajes: { select: { aTiempo: true } } },
    });
  },

  buscarPorCedula(cedula: string) {
    return prisma.conductor.findUnique({ where: { cedula } });
  },

  existePorId(id: string) {
    return prisma.conductor.findUnique({ where: { id }, select: { id: true } });
  },

  listarConViajes() {
    return prisma.conductor.findMany({
      include: { viajes: { select: { aTiempo: true } } },
      orderBy: { createdAt: "asc" },
    });
  },
};
