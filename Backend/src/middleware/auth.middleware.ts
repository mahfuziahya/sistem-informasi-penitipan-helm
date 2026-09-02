import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

type AuthUser = {
  userId: number;
  username: string;
  role: "ADMIN" | "OFFICER";
};

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      });
    }

    const [type, token] = authorization.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Format authorization tidak valid",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        message: "JWT_SECRET belum dikonfigurasi",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string" || !decoded || typeof decoded.userId !== "number" || typeof decoded.username !== "string" || (decoded.role !== "ADMIN" && decoded.role !== "OFFICER")) {
      return res.status(401).json({
        message: "Token tidak valid",
      });
    }

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah expired",
    });
  }
}

export function authorize(...allowedRoles: Array<"ADMIN" | "OFFICER">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User belum terautentikasi",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses",
      });
    }

    next();
  };
}
