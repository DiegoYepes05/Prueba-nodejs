export class AppError extends Error {
  public readonly statusCode: number;
  public readonly detalles?: unknown;

  constructor(statusCode: number, message: string, detalles?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

export const notFound = (mensaje: string) => new AppError(404, mensaje);
export const conflict = (mensaje: string) => new AppError(409, mensaje);
export const badRequest = (mensaje: string, detalles?: unknown) =>
  new AppError(400, mensaje, detalles);
