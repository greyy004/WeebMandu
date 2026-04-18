import pool from '../libs/db.js';

export const createUserTable = async () => {
    try {
        // Create Users Table
        const query = `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    is_admin BOOLEAN DEFAULT FALSE
                )
            `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating user table:', err);
    }
};