import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    throw new Error("Username atau password salah");
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    throw new Error("Username atau password salah");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "8h",
    },
  );

  return {
    token,

    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  };
}
