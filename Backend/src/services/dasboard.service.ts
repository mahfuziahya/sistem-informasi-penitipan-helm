import { prisma } from "../lib/prisma.js";

export async function getDashboardData() {
  // Awal hari
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Akhir hari
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Total transaksi hari ini
  const totalTransactions = await prisma.transaction.count({
    where: {
      checkInAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  // Penitipan aktif
  const activeTransactions = await prisma.transaction.count({
    where: {
      status: "ACTIVE",
    },
  });

  // Sudah diambil
  const completedTransactions = await prisma.transaction.count({
    where: {
      status: "COMPLETED",
    },
  });

  // Total rak
  const totalRacks = await prisma.rack.count();

  // Rak terisi
  const occupiedRacks = await prisma.rack.count({
    where: {
      status: "OCCUPIED",
    },
  });

  // Rak kosong
  const availableRacks = await prisma.rack.count({
    where: {
      status: "AVAILABLE",
    },
  });

  // Rak nonaktif
  const inactiveRacks = await prisma.rack.count({
    where: {
      status: "INACTIVE",
    },
  });

  // Persentase okupansi
  const occupancyPercentage = totalRacks > 0 ? Number(((occupiedRacks / totalRacks) * 100).toFixed(2)) : 0;

  // Transaksi terbaru
  const recentTransactions = await prisma.transaction.findMany({
    take: 10,

    orderBy: {
      createdAt: "desc",
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

  return {
    summary: {
      totalTransactions,
      activeTransactions,
      completedTransactions,
    },

    racks: {
      total: totalRacks,
      occupied: occupiedRacks,
      available: availableRacks,
      inactive: inactiveRacks,
      occupancyPercentage,
    },

    recentTransactions,
  };
}
