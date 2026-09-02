import QRCode from "qrcode";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

export async function generateQRCode(token: string) {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL belum ditemukan");
  }

  const ticketUrl = `${frontendUrl}/ticket/${token}`;

  const qrImage = await QRCode.toDataURL(ticketUrl);

  return {
    ticketUrl,
    qrImage,
  };
}

export async function searchActiveTransaction(plateNumber: string) {
  const normalizedPlate = plateNumber.trim().toUpperCase();

  if (!normalizedPlate) {
    throw new Error("Nomor plat wajib diisi");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      plateNumber: normalizedPlate,
      status: "ACTIVE",
    },
    include: {
      rack: true,
      officer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Penitipan aktif dengan nomor plat tersebut tidak ditemukan");
  }

  return transaction;
}
