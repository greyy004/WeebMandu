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
        //check DB
        const existing = await pool.query(
            `SELECT pokemons FROM daily_pokemons 
       WHERE user_id=$1 AND date=$2`,
            [userId, today]
        );

        //if exists → return
        if (existing.rows.length > 0) {
            return res.json(existing.rows[0].pokemons);
        }

        //generate new
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

        //save in DB
        await pool.query(
            `INSERT INTO daily_pokemons (user_id, date, pokemons)
       VALUES ($1, $2, $3)`,
            [userId, today, JSON.stringify(pokemons)]
        );

        //return response
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

        //check pokeballs
        const user = await pool.query(
            "SELECT pokeballs FROM users WHERE id=$1",
            [userId]
        );

        if (!user.rows.length || user.rows[0].pokeballs < 1) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "No pokeballs left" });
        }

        //OPTIONAL: prevent duplicate catch
        const exists = await pool.query(
            `SELECT * FROM user_pokemons 
       WHERE user_id=$1 AND pokemon_id=$2`,
            [userId, pokemon.id]
        );

        if (exists.rows.length > 0) {
            await pool.query("ROLLBACK");
            return res.status(400).json({ message: "Already caught" });
        }

        //deduct pokeball
        await pool.query(
            "UPDATE users SET pokeballs = pokeballs - 1 WHERE id=$1",
            [userId]
        );

        //save pokemon
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

        // Check for achievements (background task, don't wait for it to return response)
        checkAchievements(userId, 'pokemon_caught').catch(err => console.error('Error checking achievements:', err));

        return res.json({ message: "Caught successfully!" });

    } catch (err) {
        await pool.query("ROLLBACK");
        console.error(err);
        return res.status(500).json({ message: "Catch failed" });
    }
};

// Achievement Helper
async function checkAchievements(userId, conditionType) {
    try {
        // 1. Get all achievements for this condition
        const { rows: achievements } = await pool.query(
            'SELECT * FROM achievements WHERE condition_type = $1',
            [conditionType]
        );

        for (const achievement of achievements) {
            // 2. Calculate current progress based on condition
            let progress = 0;
            if (conditionType === 'pokemon_caught') {
                const { rows } = await pool.query(
                    'SELECT COUNT(*) as count FROM user_pokemons WHERE user_id = $1',
                    [userId]
                );
                progress = parseInt(rows[0].count);
            }
            // Add other condition types as needed (coins_earned, etc.)

            // 3. Upsert into user_achievements
            const unlocked = progress >= achievement.target_value;
            const unlockedAt = unlocked ? 'NOW()' : null;

            await pool.query(`
                INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked, unlocked_at)
                VALUES ($1, $2, $3, $4, ${unlocked ? 'NOW()' : 'NULL'})
                ON CONFLICT (user_id, achievement_id) DO UPDATE
                SET progress = EXCLUDED.progress,
                    unlocked = CASE WHEN user_achievements.unlocked = TRUE THEN TRUE ELSE EXCLUDED.unlocked END,
                    unlocked_at = CASE WHEN user_achievements.unlocked_at IS NOT NULL THEN user_achievements.unlocked_at ELSE EXCLUDED.unlocked_at END
            `, [userId, achievement.id, progress, unlocked]);

            // 4. Give rewards if just unlocked
            // This is a simplified version. A more robust one would compare old and new 'unlocked' status.
        }
    } catch (error) {
        console.error('Achievement check error:', error);
    }
}

export const getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'userDashboard.html'));
};

export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user info (name + wallet + profile picture)
        const userQuery = `
            SELECT name, coins, pokeballs, profile_image_url 
            FROM users 
            WHERE id = $1
        `;
        const userResult = await pool.query(userQuery, [userId]);

        const name = userResult.rows[0]?.name || null;
        const pokeCoins = userResult.rows[0]?.coins || 0;
        const pokeballs = userResult.rows[0]?.pokeballs || 0;
        const profileImageUrl = userResult.rows[0]?.profile_image_url || null;

        // Get Pokédex progress
        const pokedexQuery = `
            SELECT COUNT(*) as caught 
            FROM user_pokemons 
            WHERE user_id = $1
        `;
        const pokedexResult = await pool.query(pokedexQuery, [userId]);
        const pokedexProgress = parseInt(pokedexResult.rows[0].caught);

        // Get achievements count
        const achievementsQuery = `
            SELECT COUNT(*) as unlocked 
            FROM user_achievements 
            WHERE user_id = $1 AND unlocked = TRUE
        `;
        const achievementsResult = await pool.query(achievementsQuery, [userId]);
        const achievements = parseInt(achievementsResult.rows[0].unlocked);

        // Mock data for remaining stats
        const activeQuests = Math.floor(Math.random() * 8) + 1;
        const onlineFriends = Math.floor(Math.random() * 20) + 5;

        res.json({
            name,
            pokedexProgress,
            achievements,
            pokeCoins,
            pokeballs,
            activeQuests,
            onlineFriends,
            profileImageUrl
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

export const getWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const walletResult = await pool.query(
            'SELECT coins, pokeballs FROM users WHERE id = $1',
            [userId]
        );

        res.json({
            pokeCoins: walletResult.rows[0]?.coins || 0,
            pokeballs: walletResult.rows[0]?.pokeballs || 0
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Failed to fetch wallet' });
    }
};

export const buyPokeball = async (req, res) => {
    const userId = req.user.id;
    const pokeballCost = 50;

    try {
        await pool.query('BEGIN');

        const walletResult = await pool.query(
            'SELECT coins, pokeballs FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );

        if (!walletResult.rows.length) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }

        const currentCoins = walletResult.rows[0].coins || 0;
        if (currentCoins < pokeballCost) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Not enough Pokecoins' });
        }

        const updatedResult = await pool.query(
            `UPDATE users
             SET coins = coins - $1,
                 pokeballs = pokeballs + 1
             WHERE id = $2
             RETURNING coins, pokeballs`,
            [pokeballCost, userId]
        );

        await pool.query('COMMIT');

        return res.json({
            message: 'Purchased 1 Pokeball',
            pokeCoins: updatedResult.rows[0].coins,
            pokeballs: updatedResult.rows[0].pokeballs,
            cost: pokeballCost
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error buying pokeball:', error);
        return res.status(500).json({ message: 'Purchase failed' });
    }
};

export const claimDailyReward = async (req, res) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const rewardCoins = 20;
    const rewardPokeballs = 1;

    try {
        await pool.query('BEGIN');

        const existingResult = await pool.query(
            `SELECT claimed
             FROM daily_rewards
             WHERE user_id = $1 AND date = $2
             FOR UPDATE`,
            [userId, today]
        );

        if (existingResult.rows.length && existingResult.rows[0].claimed === true) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Daily reward already claimed' });
        }

        if (existingResult.rows.length === 0) {
            await pool.query(
                `INSERT INTO daily_rewards (user_id, date, coins, pokeballs, claimed)
                 VALUES ($1, $2, $3, $4, TRUE)`,
                [userId, today, rewardCoins, rewardPokeballs]
            );
        } else {
            await pool.query(
                `UPDATE daily_rewards
                 SET coins = $3,
                     pokeballs = $4,
                     claimed = TRUE
                 WHERE user_id = $1 AND date = $2`,
                [userId, today, rewardCoins, rewardPokeballs]
            );
        }

        const updatedResult = await pool.query(
            `UPDATE users
             SET coins = coins + $1,
                 pokeballs = pokeballs + $2
             WHERE id = $3
             RETURNING coins, pokeballs`,
            [rewardCoins, rewardPokeballs, userId]
        );

        await pool.query('COMMIT');

        return res.json({
            message: 'Daily reward claimed',
            reward: { coins: rewardCoins, pokeballs: rewardPokeballs },
            pokeCoins: updatedResult.rows[0].coins,
            pokeballs: updatedResult.rows[0].pokeballs
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error claiming daily reward:', error);
        return res.status(500).json({ message: 'Failed to claim daily reward' });
    }
};

export const getOwnedPokemons = async (req, res) => {
    try {
        const userId = req.user.id;

        const ownedResult = await pool.query(
            `SELECT pokemon_id as id, name, image, types, caught_at
             FROM user_pokemons
             WHERE user_id = $1
             ORDER BY caught_at DESC`,
            [userId]
        );

        res.json({
            count: ownedResult.rows.length,
            pokemons: ownedResult.rows
        });
    } catch (error) {
        console.error('Error fetching owned pokemons:', error);
        res.status(500).json({ message: 'Failed to fetch owned pokemons' });
    }
};
