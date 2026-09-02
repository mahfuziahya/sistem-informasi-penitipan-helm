import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum ditemukan");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // USER
  // =========================

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`User dibuat: ${admin.username}`);

  const officerPasswordHash = await bcrypt.hash("officer123", 10);

  const officer = await prisma.user.upsert({
    where: {
      username: "officer",
    },
    update: {},
    create: {
      name: "Petugas Helm",
      username: "officer",
      passwordHash: officerPasswordHash,
      role: "OFFICER",
    },
  });

  console.log(`Officer dibuat: ${officer.username}`);

  // =========================
  // RACK
  // =========================

  const rackData = [];

  for (const row of ["A", "B", "C", "D"]) {
    for (let number = 1; number <= 12; number++) {
      rackData.push({
        code: `${row}-${String(number).padStart(2, "0")}`,
      });
    }
  }

  for (const rack of rackData) {
    await prisma.rack.upsert({
      where: {
        code: rack.code,
      },
      update: {},
      create: {
        code: rack.code,
        status: "AVAILABLE",
      },
    });
  }

  console.log(`${rackData.length} rak berhasil dibuat`);

  console.log("🌱 Seed selesai");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
