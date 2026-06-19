import { z } from "zod";

const aTiempoSchema = z.preprocess((valor) => {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "string") {
    const v = valor.trim().toLowerCase();
    if (["si", "sí", "true", "1"].includes(v)) return true;
    if (["no", "false", "0"].includes(v)) return false;
  }
  return valor;
}, z.boolean({ message: "aTiempo debe ser booleano (true/false o sí/no)" }));

const MAX_INT_PG = 2_147_483_647;

export const crearViajeSchema = z.object({
  origen: z.string().trim().min(1, "El origen es obligatorio").max(120),
  destino: z.string().trim().min(1, "El destino es obligatorio").max(120),
  valorFlete: z
    .number({ message: "El valor del flete debe ser numérico" })
    .int("El valor del flete debe ser un entero (COP sin decimales)")
    .positive("El valor del flete debe ser mayor a 0")
    .max(MAX_INT_PG, "El valor del flete excede el máximo permitido"),
  aTiempo: aTiempoSchema,
  conductorId: z.string().uuid("conductorId debe ser un UUID válido"),
});

export type CrearViajeInput = z.infer<typeof crearViajeSchema>;
