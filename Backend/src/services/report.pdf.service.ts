import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";

export async function generateDailyReportPdf(reportId: number) {
  const report = await prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: {
      transactions: {
        include: {
          rack: true,
          officer: {
            select: {
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

  if (!report) {
    throw new Error("Laporan tidak ditemukan.");
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  const fileName = `Laporan-${report.reportDate.toISOString().slice(0, 10)}.pdf`;

  return {
    doc,
    report,
    fileName,
  };
}
 