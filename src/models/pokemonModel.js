import pool from '../libs/db.js';

export const createPokemonTable = async () => {
    try {
        // Create Pokemon Table
        const query = `
            CREATE TABLE IF NOT EXISTS pokemons (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                type1 VARCHAR(50),
                type2 VARCHAR(50),
                image_url VARCHAR(255)
            )
        `;
        await pool.query(query);
    } catch (err) {
        console.error('Error creating pokemon table:', err);
    }
};