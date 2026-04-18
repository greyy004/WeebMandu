import pool from '../libs/db.js';

export const createFavouriteTable = async () => {
    try {
        // Create Favourites Table
        const query = `
            CREATE TABLE IF NOT EXISTS favourites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                pokemon_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating favourite table:', err);
    }
};