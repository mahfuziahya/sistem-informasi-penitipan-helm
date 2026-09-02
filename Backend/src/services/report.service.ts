import { prisma } from "../lib/prisma.js";

export async function createDailyReport(date: string) {
  const reportDate = new Date(`${date}T00:00:00+07:00`);
  if (Number.isNaN(reportDate.getTime())) {
    throw new Error("Format tanggal tidak valid. Gunakan YYYY-MM-DD");
  }

  const nextDate = new Date(reportDate.getTime() + 24 * 60 * 60 * 1000);

  const transactions = await prisma.transaction.findMany({
    where: {
      checkInAt: {
        lt: nextDate,
      },

      OR: [
        {
          checkOutAt: null,
        },
        {
          checkOutAt: {
            gte: reportDate,
          },
        },
      ],
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

    orderBy: {
      checkInAt: "asc",
    },
  });

  const dailyTransactions = transactions.map((transaction) => {
    const checkOutAt = transaction.checkOutAt ? new Date(transaction.checkOutAt) : null;

    const dailyStatus = checkOutAt && checkOutAt >= reportDate && checkOutAt < nextDate ? "COMPLETED" : "ACTIVE";

    return {
      ...transaction,
      status: dailyStatus,
    };
  });
  const totalTransactions = transactions.length;

  const completedTransactions = transactions.filter((item) => item.checkOutAt && new Date(item.checkOutAt) < nextDate).length;

  const activeTransactions = totalTransactions - completedTransactions;
  const report = await prisma.dailyReport.upsert({
    where: {
      reportDate,
    },

    update: {
      totalTransactions,
      completedTransactions,
      activeTransactions,

      transactions: {
        set: transactions.map((transaction) => ({
          id: transaction.id,
        })),
      },
    },

    create: {
      reportDate,
      totalTransactions,
      completedTransactions,
      activeTransactions,

      transactions: {
        connect: transactions.map((transaction) => ({
          id: transaction.id,
        })),
      },
    },

    include: {
      transactions: {
        include: {
          rack: true,
          officer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          checkInAt: "asc",
        },
      },
    },
  });

  return {
    ...report,
    transactions: dailyTransactions,
  };
}

export async function getDailyReport(date: string) {
  const reportDate = new Date(`${date}T00:00:00+07:00`);

  if (Number.isNaN(reportDate.getTime())) {
    throw new Error("Format tanggal tidak valid");
  }

  // Buat / perbarui laporan berdasarkan transaksi pada tanggal tersebut
  return createDailyReport(date);
}
