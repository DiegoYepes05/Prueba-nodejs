import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { badRequest } from "../errors/AppError";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const detalles = result.error.issues.map((issue) => ({
        campo: issue.path.join(".") || "(raíz)",
        mensaje: issue.message,
      }));
      return next(badRequest("Datos de entrada inválidos", detalles));
    }

    req.body = result.data;
    next();
  };
}
