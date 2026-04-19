import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../libs/db.js';
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// helper
function getRandomIds() {
    const max = 1010;
    const set = new Set();

    while (set.size < 5) {
        set.add(Math.floor(Math.random() * max) + 1);
    }

    return [...set];
}

export const getDailyPokemons = async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    try {
        // 1️⃣ check DB
        const existing = await pool.query(
            `SELECT pokemons FROM daily_pokemons 
       WHERE user_id=$1 AND date=$2`,
            [userId, today]
        );

        // 2️⃣ if exists → return
        if (existing.rows.length > 0) {
            return res.json(existing.rows[0].pokemons);
        }

        // 3️⃣ generate new
        const ids = getRandomIds();

        const pokemons = await Promise.all(
            ids.map(async (id) => {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                const data = await res.json();

                return {
                    id: data.id,
                    name: data.name,
                    image: data.sprites.front_default,
                    types: data.types.map(t => t.type.name),
                    catch_cost: 20
                };
            })
        );

        // 4️⃣ save in DB
        await pool.query(
            `INSERT INTO daily_pokemons (user_id, date, pokemons)
       VALUES ($1, $2, $3)`,
            [userId, today, JSON.stringify(pokemons)]
        );

        // 5️⃣ return response
        res.json(pokemons);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load daily pokemons" });
    }
};

export const catchPokemon = async (req, res) => {
    const userId = req.user.id;
    const { pokemon } = req.body;

    try {
        await pool.query("BEGIN");

        // 1️⃣ check pokeballs
        const user = await pool.query(
            "SELECT pokeballs FROM users WHERE id=$1",
            [userId]
        );

        if (!user.rows.length || user.rows[0].pokeballs < 1) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "No pokeballs left" });
        }

        // 2️⃣ OPTIONAL: prevent duplicate catch
        const exists = await pool.query(
            `SELECT * FROM user_pokemons 
       WHERE user_id=$1 AND pokemon_id=$2`,
            [userId, pokemon.id]
        );

        if (exists.rows.length > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "Already caught" });
        }

        // 3️⃣ deduct pokeball
        await pool.query(
            "UPDATE users SET pokeballs = pokeballs - 1 WHERE id=$1",
            [userId]
        );

        // 4️⃣ save pokemon
        await pool.query(
            `INSERT INTO user_pokemons 
       (user_id, pokemon_id, name, image, types)
       VALUES ($1, $2, $3, $4, $5)`,
            [
                userId,
                pokemon.id,
                pokemon.name,
                pokemon.image,
                pokemon.types
            ]
        );

        await pool.query("COMMIT");

        return res.json({ message: "Caught successfully!" });

    } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ message: "Catch failed" });
    }
};

export const getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'userDashboard.html'));
};

export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's Pokédex progress (caught Pokémon count)
        const pokedexQuery = 'SELECT COUNT(*) as caught FROM user_pokemons WHERE user_id = $1';
        const pokedexResult = await pool.query(pokedexQuery, [userId]);
        const pokedexProgress = parseInt(pokedexResult.rows[0].caught);

        // Get user's coins
        const coinsQuery = 'SELECT coins FROM users WHERE id = $1';
        const coinsResult = await pool.query(coinsQuery, [userId]);
        const pokeCoins = coinsResult.rows[0]?.coins || 0;

        // Get achievements (simulated - you can implement real achievement system)
        const achievements = Math.floor(Math.random() * 10); // Mock data

        // Get active quests (simulated)
        const activeQuests = Math.floor(Math.random() * 8) + 1; // Mock data

        // Get online friends (simulated)
        const onlineFriends = Math.floor(Math.random() * 20) + 5; // Mock data

        res.json({
            pokedexProgress,
            achievements,
            pokeCoins,
            activeQuests,
            onlineFriends
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};
