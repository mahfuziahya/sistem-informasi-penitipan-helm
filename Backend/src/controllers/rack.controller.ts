import type { Request, Response } from "express";

import { getAllRacks, createRack, updateRackStatus, deleteRack } from "../services/rack.service.js";

export async function getRacks(req: Request, res: Response) {
  try {
    const racks = await getAllRacks();

    return res.status(200).json({
      message: "Data rak berhasil diambil",
      data: racks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil data rak",
    });
  }
}

export async function addRack(req: Request, res: Response) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Kode rak wajib diisi",
      });
    }

    const rack = await createRack(code);

    return res.status(201).json({
      message: "Rak berhasil dibuat",
      data: rack,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal membuat rak",
    });
  }
}

export async function changeRackStatus(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "ID rak tidak valid",
      });
    }

    const rackId = Number(id);

    if (Number.isNaN(rackId)) {
      return res.status(400).json({
        message: "ID rak harus berupa angka",
      });
    }

    const { status } = req.body;

    if (status !== "AVAILABLE" && status !== "INACTIVE") {
      return res.status(400).json({
        message: "Status harus AVAILABLE atau INACTIVE",
      });
    }

    const rack = await updateRackStatus(rackId, status);

    return res.status(200).json({
      message: "Status rak berhasil diubah",
      data: rack,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal mengubah status rak",
    });
  }
}

export async function removeRack(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "ID rak tidak valid",
      });
    }

    const rackId = Number(id);

    if (Number.isNaN(rackId)) {
      return res.status(400).json({
        message: "ID rak harus berupa angka",
      });
    }

    await deleteRack(rackId);

    return res.status(200).json({
      message: "Rak berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal menghapus rak",
    });
  }
}
