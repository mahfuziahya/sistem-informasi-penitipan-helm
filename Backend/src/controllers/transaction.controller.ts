import type { Request, Response } from "express";
import { createCheckIn, getTicketByToken, checkoutTransaction, searchActiveTransaction, getAllTransactions } from "../services/transaction.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export async function checkIn(req: AuthRequest, res: Response) {
  try {
    const { plateNumber } = req.body;

    if (!plateNumber) {
      return res.status(400).json({
        message: "Nomor plat wajib diisi",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "User belum terautentikasi",
      });
    }

    const transaction = await createCheckIn(plateNumber, req.user.userId);

    return res.status(201).json({
      message: "Check-in berhasil",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Check-in gagal",
    });
  }
}

export async function getTicket(req: Request, res: Response) {
  try {
    const { token } = req.params;

    if (typeof token != "string") {
      return res.status(400).json({
        message: "Token tiket wajib diberikan",
      });
    }

    const transaction = await getTicketByToken(token);

    return res.status(200).json({
      message: "Tiket ditemukan",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error instanceof Error ? error.message : "Tiket tidak ditemukan",
    });
  }
}

export async function checkout(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "ID transaksi tidak valid",
      });
    }

    const transactionId = Number(id);

    if (Number.isNaN(transactionId)) {
      return res.status(400).json({
        message: "ID transaksi harus berupa angka",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "User belum terautentikasi",
      });
    }

    const transaction = await checkoutTransaction(transactionId);

    return res.status(200).json({
      message: "Helm berhasil diambil",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Checkout gagal",
    });
  }
}

export async function searchByPlate(req: Request, res: Response) {
  try {
    const plate = req.query.plate;

    if (typeof plate !== "string") {
      return res.status(400).json({
        message: "Nomor plat wajib diberikan",
      });
    }

    const transaction = await searchActiveTransaction(plate);

    return res.status(200).json({
      message: "Data penitipan ditemukan",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error instanceof Error ? error.message : "Data penitipan tidak ditemukan",
    });
  }
}

export async function getTransactions(req: AuthRequest, res: Response) {
  try {
    const transactions = await getAllTransactions();

    return res.status(200).json({
      message: "Data transaksi berhasil diambil",
      data: transactions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error instanceof Error ? error.message : "Gagal mengambil data transaksi",
    });
  }
}
