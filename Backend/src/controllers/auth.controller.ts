import type { Request, Response } from "express";

import { login } from "../services/auth.service.js";

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username dan password wajib diisi",
      });
    }

    const result = await login(username, password);

    return res.status(200).json({
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: error instanceof Error ? error.message : "Login gagal",
    });
  }
}
