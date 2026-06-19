import { Router } from "express";
import { conductorRouter } from "./modules/conductores/conductor.routes";
import { viajeRouter } from "./modules/viajes/viaje.routes";

export const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/conductores", conductorRouter);
router.use("/viajes", viajeRouter);
