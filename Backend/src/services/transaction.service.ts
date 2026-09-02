import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { generateQRCode } from "./qr.service.js";

export async function createCheckIn(plateNumber: string, officerId: number) {
  const normalizedPlate = plateNumber.trim().toUpperCase();

  if (!normalizedPlate) {
    throw new Error("Nomor plat wajib diisi");
  }

  // Cari rak yang masih kosong
  const availableRack = await prisma.rack.findFirst({
    where: {
      status: "AVAILABLE",
    },
    orderBy: {
      code: "asc",
    },
  });

  if (!availableRack) {
    throw new Error("Semua rak sedang terisi");
  }

  // Generate kode tiket
  const ticketCode = `HDQ-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Generate token QR
  const qrToken = crypto.randomBytes(32).toString("hex");

  // Simpan transaksi + update rak

  const transaction = await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        ticketCode,
        qrToken,
        plateNumber: normalizedPlate,
        rackId: availableRack.id,
        officerId,
        status: "ACTIVE",
      },
    });

    await tx.rack.update({
      where: {
        id: availableRack.id,
      },
      data: {
        status: "OCCUPIED",
      },
    });

    return tx.transaction.findUnique({
      where: {
        id: newTransaction.id,
      },
      include: {
        rack: true,
      },
    });
  });

  const qr = await generateQRCode(transaction!.qrToken);

  return {
    transaction,
    qr,
  };
}

export async function getTicketByToken(qrToken: string) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      qrToken,
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
    throw new Error("Tiket tidak ditemukan");
  }

  return transaction;
}

export async function checkoutTransaction(transactionId: number) {
  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  });

  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan");
  }

  if (transaction.status !== "ACTIVE") {
    throw new Error("Tiket sudah digunakan atau sudah diambil");
  }

  const result = await prisma.$transaction(async (tx) => {
    const completedTransaction = await tx.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        status: "COMPLETED",
        checkOutAt: new Date(),
      },
    });

    await tx.rack.update({
      where: {
        id: transaction.rackId,
      },
      data: {
        status: "AVAILABLE",
      },
    });

    return tx.transaction.findUnique({
      where: {
        id: completedTransaction.id,
      },
      include: {
        rack: true,
      },
    });
  });

  return result;
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

export async function getAllTransactions() {
  return prisma.transaction.findMany({
    orderBy: {
      checkInAt: "desc",
    },
    include: {
      rack: true,
    },
  });
}
