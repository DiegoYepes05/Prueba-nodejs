import { NextFunction, Request, Response } from "express";
import { conductorService } from "./conductor.service";

export const conductorController = {
  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const conductor = await conductorService.crear(req.body);
      res.status(201).json(conductor);
    } catch (err) {
      next(err);
    }
  },

  async obtenerPorId(req: Request, res: Response, next: NextFunction) {
    try {
      const conductor = await conductorService.obtenerPorId(req.params.id);
      res.status(200).json(conductor);
    } catch (err) {
      next(err);
    }
  },

  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const conductores = await conductorService.listar();
      res.status(200).json(conductores);
    } catch (err) {
      next(err);
    }
  },
};
