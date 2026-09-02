import { prisma } from "../lib/prisma.js";

export async function getAllRacks() {
  return prisma.rack.findMany({
    orderBy: {
      code: "asc",
    },
  });
}

export async function createRack(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Kode rak wajib diisi");
  }

  const existingRack = await prisma.rack.findUnique({
    where: {
      code: normalizedCode,
    },
  });

  if (existingRack) {
    throw new Error("Kode rak sudah digunakan");
  }

  return prisma.rack.create({
    data: {
      code: normalizedCode,
      status: "AVAILABLE",
    },
  });
}

export async function updateRackStatus(rackId: number, status: "AVAILABLE" | "INACTIVE") {
  const rack = await prisma.rack.findUnique({
    where: {
      id: rackId,
    },
  });

  if (!rack) {
    throw new Error("Rak tidak ditemukan");
  }

  if (rack.status === "OCCUPIED") {
    throw new Error("Rak sedang digunakan dan tidak dapat dinonaktifkan");
  }

  return prisma.rack.update({
    where: {
      id: rackId,
    },
    data: {
      status,
    },
  });
}

export async function deleteRack(rackId: number) {
  const rack = await prisma.rack.findUnique({
    where: {
      id: rackId,
    },
  });

  if (!rack) {
    throw new Error("Rak tidak ditemukan");
  }

  if (rack.status === "OCCUPIED") {
    throw new Error("Rak sedang digunakan dan tidak dapat dihapus");
  }

  const transactionCount = await prisma.transaction.count({
    where: {
      rackId,
    },
  });

  if (transactionCount > 0) {
    throw new Error("Rak memiliki riwayat transaksi dan tidak dapat dihapus");
  }

  return prisma.rack.delete({
    where: {
      id: rackId,
    },
  });
}
