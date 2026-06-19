import { NextFunction, Request, Response } from "express";
import { viajeService } from "./viaje.service";

export const viajeController = {
  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const viaje = await viajeService.crear(req.body);
      res.status(201).json(viaje);
    } catch (err) {
      next(err);
    }
  },
};
