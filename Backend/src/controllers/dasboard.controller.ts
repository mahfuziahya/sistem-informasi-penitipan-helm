import type { Request, Response } from "express";

import { getDashboardData } from "../services/dasboard.service.js";

export async function getDashboard(req: Request, res: Response) {
  try {
    const dashboard = await getDashboardData();

    return res.status(200).json({
      message: "Dashboard berhasil diambil",
      data: dashboard,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil data dashboard",
    });
  }
}
