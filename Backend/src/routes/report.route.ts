import { Router } from "express";

import { getDailyReportController, createDailyReportController, downloadDailyReportPdf } from "../controllers/report.controller.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import { createDailyReportSchema } from "../validations/report.validation.js";

const router = Router();

router.post("/daily", authenticate, authorize("ADMIN"), validate(createDailyReportSchema), createDailyReportController);

router.get("/daily", authenticate, authorize("ADMIN"), getDailyReportController);

router.get("/daily/:id/pdf", authenticate, authorize("ADMIN"), downloadDailyReportPdf);

export default router;
