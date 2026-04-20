import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../libs/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'adminDashboard.html'));
};

export const getStats = async (req, res) => {
    try {
        // Get total users and total caught pokemons
        const totalPokemonQuery = 'SELECT COUNT(*) as total FROM user_pokemons';
        const totalPokemonResult = await pool.query(totalPokemonQuery);
        const totalCaught = parseInt(totalPokemonResult.rows[0].total);
        const usersQuery = 'SELECT COUNT(*) as total FROM users';
        const usersResult = await pool.query(usersQuery);
        const totalUsers = parseInt(usersResult.rows[0].total);

        // Get active sessions (simulated - you can implement real session tracking)
        const activeSessions = Math.floor(Math.random() * 50) + 10; // Mock data

    

        // System status
        const systemStatus = 'Online';

        res.json({
            totalUsers,
            activeSessions,
            totalCaught,
            systemStatus
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

export const getUsersDetails = async (req, res) => {
    try {
        const query = `
            SELECT id, name, email, is_admin AS "isAdmin", coins, pokeballs, created_at AS "createdAt", profile_image_url
            FROM users where is_admin = false
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query);
        console.log('Fetched user details:', rows);
        res.json({ users: rows });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
};

export const getAchievements = async (req, res) => {
    try {
        const query = `
            SELECT id, code, name, description, icon_url, condition_type, target_value, reward_coins, reward_pokeballs, created_at
            FROM achievement_definitions
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query);
        console.log('Fetched achievements:', rows);
        res.json({ achievements: rows });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'Failed to fetch achievements' });
    }
};

export const addAchievement = async (req, res) => {
    try {
        const { name, code, description, condition_type, target_value, reward_coins, reward_pokeballs, icon_url } = req.body;

        const query = `
            INSERT INTO achievement_definitions (code, name, description, icon_url, condition_type, target_value, reward_coins, reward_pokeballs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, description, icon_url, condition_type, target_value, reward_coins, reward_pokeballs, created_at
        `;
        const values = [code, name, description, icon_url, condition_type, target_value, reward_coins, reward_pokeballs];

        const { rows } = await pool.query(query, values);
        console.log('Added achievement:', rows[0]);
        res.status(201).json({ achievement: rows[0] });
    } catch (error) {
        console.error('Error adding achievement:', error);
        if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({ message: 'Achievement code already exists' });
        } else {
            res.status(500).json({ message: 'Failed to add achievement' });
        }
    }
};

export const deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM achievement_definitions WHERE id = $1';
        await pool.query(query, [id]);
        console.log('Deleted achievement:', id);
        res.json({ message: 'Achievement deleted successfully' });
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({ message: 'Failed to delete achievement' });
    }
};