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
            SELECT id, name, email, is_admin AS "isAdmin", coins, pokeballs, created_at AS "createdAt"
            FROM users where is_admin = false
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query);
        res.json({ users: rows });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
};