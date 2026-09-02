import { Router } from "express";

import { getDashboard } from "../controllers/dasboard.controller.js";

import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), getDashboard);
export default router;
