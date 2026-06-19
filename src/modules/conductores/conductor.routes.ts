import { Router } from "express";
import { validateBody } from "../../middlewares/validate.middleware";
import { conductorController } from "./conductor.controller";
import { crearConductorSchema } from "./conductor.schema";

export const conductorRouter = Router();

conductorRouter.post("/", validateBody(crearConductorSchema), conductorController.crear);
conductorRouter.get("/", conductorController.listar);
conductorRouter.get("/:id", conductorController.obtenerPorId);
