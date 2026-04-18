import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

pool.on('error', (err) => {
    console.error('Database error:', err);
});


export default pool;