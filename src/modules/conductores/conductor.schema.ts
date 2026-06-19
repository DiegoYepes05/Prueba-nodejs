import { z } from "zod";

export const crearConductorSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  cedula: z
    .string()
    .trim()
    .min(1, "La cédula es obligatoria")
    .regex(/^\d+$/, "La cédula debe contener solo dígitos"),
  ciudad: z.string().trim().min(1, "La ciudad es obligatoria").max(120),
});

export type CrearConductorInput = z.infer<typeof crearConductorSchema>;
