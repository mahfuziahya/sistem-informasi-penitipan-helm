import type { Request, Response } from "express";

import { getDailyReport, createDailyReport } from "../services/report.service.js";
import { generateDailyReportPdf } from "../services/report.pdf.service.js";

export async function getDailyReportController(req: Request, res: Response) {
  try {
    const { date } = req.query;

    if (typeof date !== "string") {
      return res.status(400).json({
        message: "Parameter date wajib diisi",
      });
    }

    const report = await getDailyReport(date);

    return res.status(200).json({
      message: "Report harian berhasil diambil",
      data: report,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal mengambil report harian",
    });
  }
}

export async function createDailyReportController(req: Request, res: Response) {
  try {
    const { date } = req.body;

    const report = await createDailyReport(date);

    return res.status(201).json({
      message: "Report harian berhasil dibuat",
      data: report,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal membuat report harian",
    });
  }
}

export async function downloadDailyReportPdf(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "ID laporan tidak valid",
      });
    }

    const reportId = Number(id);

    if (Number.isNaN(reportId)) {
      return res.status(400).json({
        message: "ID laporan harus berupa angka",
      });
    }

    const { doc, fileName, report } = await generateDailyReportPdf(reportId);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // HEADER
    doc.font("Helvetica-Bold").fontSize(22).text("SIMPAN", {
      align: "center",
    });

    doc.font("Helvetica").fontSize(10).text("PENITIPAN HELM · QR", {
      align: "center",
    });

    doc.moveDown(0.8);

    doc.font("Helvetica-Bold").fontSize(18).text("LAPORAN HARIAN PENITIPAN HELM", {
      align: "center",
    });

    doc.moveDown(0.5);

    const reportDate = new Date(report.reportDate).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.font("Helvetica").fontSize(11).text(`Tanggal: ${reportDate}`, {
      align: "center",
    });

    doc.moveDown(1.5);

    // RINGKASAN

    doc.font("Helvetica-Bold").fontSize(13).text("RINGKASAN");

    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(11);

    doc.text(`Total Transaksi       : ${report.totalTransactions}`);

    doc.text(`Sudah Diambil         : ${report.completedTransactions}`);

    doc.text(`Masih Dititipkan      : ${report.activeTransactions}`);

    doc.moveDown(1.5);

    // DETAIL TRANSAKSI

    doc.font("Helvetica-Bold").fontSize(13).text("DETAIL TRANSAKSI");

    doc.moveDown(0.7);

    // Posisi kolom
    const xTicket = 40;
    const xPlate = 145;
    const xRack = 250;
    const xCheckIn = 315;
    const xCheckOut = 390;
    const xStatus = 470;

    let y = doc.y;

    // HEADER TABEL
    doc.font("Helvetica-Bold").fontSize(8);

    doc.text("TICKET ID", xTicket, y, {
      width: 100,
    });

    doc.text("PLAT", xPlate, y, {
      width: 100,
    });

    doc.text("RAK", xRack, y, {
      width: 60,
    });

    doc.text("MASUK", xCheckIn, y, {
      width: 70,
    });

    doc.text("KELUAR", xCheckOut, y, {
      width: 70,
    });

    doc.text("STATUS", xStatus, y, {
      width: 70,
    });

    // Garis header
    y += 18;

    doc.moveTo(40, y).lineTo(555, y).stroke();

    y += 10;

    // DATA TRANSAKSI
    for (const transaction of report.transactions) {
      // Kalau hampir sampai bawah halaman
      if (y > 740) {
        doc.addPage();

        y = 50;

        doc.font("Helvetica-Bold").fontSize(13).text("DETAIL TRANSAKSI - LANJUTAN");

        y += 30;

        // Header tabel halaman baru
        doc.font("Helvetica-Bold").fontSize(8);

        doc.text("TICKET ID", xTicket, y, {
          width: 100,
        });

        doc.text("PLAT", xPlate, y, {
          width: 100,
        });

        doc.text("RAK", xRack, y, {
          width: 60,
        });

        doc.text("MASUK", xCheckIn, y, {
          width: 70,
        });

        doc.text("KELUAR", xCheckOut, y, {
          width: 70,
        });

        doc.text("STATUS", xStatus, y, {
          width: 70,
        });

        y += 18;

        doc.moveTo(40, y).lineTo(555, y).stroke();

        y += 10;
      }

      // DATA BARIS
      doc.font("Helvetica").fontSize(7.5);

      doc.text(transaction.ticketCode, xTicket, y, {
        width: 100,
      });

      doc.text(transaction.plateNumber, xPlate, y, {
        width: 100,
      });

      doc.text(transaction.rack.code, xRack, y, {
        width: 60,
      });

      doc.text(
        new Date(transaction.checkInAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) +
          " " +
          new Date(transaction.checkInAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        xCheckIn,
        y,
        {
          width: 70,
        },
      );

      doc.text(
        transaction.checkOutAt
          ? new Date(transaction.checkOutAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }) +
              " " +
              new Date(transaction.checkOutAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
          : "-",
        xCheckOut,
        y,
        {
          width: 70,
        },
      );

      doc.text(transaction.status, xStatus, y, {
        width: 70,
      });
      // Garis antar baris
      y += 20;

      doc.moveTo(40, y).lineTo(555, y).stroke();

      y += 8;
    }

    // FOOTER
    doc.moveDown(2);

    doc.font("Helvetica").fontSize(8).text("Dokumen ini dibuat secara otomatis oleh Sistem Informasi Penitipan Helm Berbasis QR Code.", 40, 780, {
      width: 515,
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Gagal membuat PDF laporan",
    });
  }
}
