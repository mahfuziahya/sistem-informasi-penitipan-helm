import { Router } from "express";

import { getRacks, addRack, changeRackStatus, removeRack } from "../controllers/rack.controller.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

import { createRackSchema, updateRackStatusSchema } from "../validations/rack.validation.js";

import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "OFFICER"), getRacks);

router.post("/", authenticate, authorize("ADMIN"), validate(createRackSchema), addRack);

router.patch("/:id/status", authenticate, authorize("ADMIN"), validate(updateRackStatusSchema), changeRackStatus);

router.delete("/:id", authenticate, authorize("ADMIN"), removeRack);
export default router;
