import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware";
import { viajeController } from "./viaje.controller";
import { crearViajeSchema } from "./viaje.schema";

export const viajeRouter = Router();

viajeRouter.post("/", validateBody(crearViajeSchema), viajeController.crear);
