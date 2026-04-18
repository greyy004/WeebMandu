import bcrypt from "bcrypt";
import pool from "./src/libs/db.js";

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin1029", 10);

    const query = `
      INSERT INTO users (name, email, password, is_admin)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    const { rows } = await pool.query(query, ["admin", "admin@gmail.com", hashedPassword, true]);
    const admin = rows[0];

    if (admin) {
      console.log("Admin created:", admin);
    } else {
      console.log("Admin already exists or could not be created.");
    }
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    await pool.end();
  }
}

createAdmin();
