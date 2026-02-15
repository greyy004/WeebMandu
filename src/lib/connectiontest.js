import { prisma } from "./db.js";

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to Prisma");
  } catch (e) {
    console.error("Prisma connection error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
