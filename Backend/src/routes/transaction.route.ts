import { Router } from "express";
import { checkIn, getTicket, checkout, searchByPlate, getTransactions } from "../controllers/transaction.controller.js";

import { checkInSchema } from "../validations/transaction.validation.js";

import { validate } from "../middleware/validate.middleware.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";
const router = Router();
router.post("/check-in", authenticate, authorize("ADMIN", "OFFICER"), validate(checkInSchema), checkIn);
router.get("/ticket/:token", getTicket);

router.post("/:id/checkout", authenticate, authorize("ADMIN", "OFFICER"), checkout);

router.get("/search", authenticate, authorize("ADMIN", "OFFICER"), searchByPlate);

router.get("/", authenticate, authorize("ADMIN"), getTransactions);

export default router;
