import { Router } from "express";

import { loginUser } from "../controllers/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import { loginSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), loginUser);

export default router;
