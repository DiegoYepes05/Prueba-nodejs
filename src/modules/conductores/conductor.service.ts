import { conflict, notFound } from "../../errors/AppError";
import { calcularDesglose } from "../../score/score";
import { conductorRepository } from "./conductor.repository";
import { CrearConductorInput } from "./conductor.schema";

function aRespuestaConPuntaje(conductor: {
  id: string;
  nombre: string;
  cedula: string;
  ciudad: string;
  createdAt: Date;
  viajes: { aTiempo: boolean }[];
}) {
  const { viajes, ...datos } = conductor;
  const desglose = calcularDesglose(viajes);
  return { ...datos, ...desglose };
}

export const conductorService = {
  async crear(input: CrearConductorInput) {
    const existente = await conductorRepository.buscarPorCedula(input.cedula);
    if (existente) {
      throw conflict("Ya existe un conductor registrado con esa cédula");
    }
    return conductorRepository.crear(input);
  },

  async obtenerPorId(id: string) {
    const conductor = await conductorRepository.buscarPorId(id);
    if (!conductor) {
      throw notFound("Conductor no encontrado");
    }
    return aRespuestaConPuntaje(conductor);
  },

  async listar() {
    const conductores = await conductorRepository.listarConViajes();
    return conductores
      .map(aRespuestaConPuntaje)
      .sort((a, b) => b.puntaje - a.puntaje);
  },
};
