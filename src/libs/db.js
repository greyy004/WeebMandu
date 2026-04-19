import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  idleTimeoutMillis: 30000,
});

let hasLoggedConnect = false;
pool.on('connect', () => {
    if (!hasLoggedConnect) {
        console.log('Connected to the database');
        hasLoggedConnect = true;
    }
});

pool.on('error', (err) => {
    console.error('Database error:', err);
});


export default pool;