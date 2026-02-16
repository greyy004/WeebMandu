import bcrypt from "bcrypt";
import { prisma } from "./src/lib/db.js";

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("admin1029", 10);

  const admin = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      isAdmin: true
    }
  });

  console.log("Admin created:", admin);
}

createAdmin();
