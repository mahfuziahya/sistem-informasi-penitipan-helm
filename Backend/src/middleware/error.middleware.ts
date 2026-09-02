import type { NextFunction, Request, Response } from "express";

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Terjadi kesalahan pada server",
  });
}
