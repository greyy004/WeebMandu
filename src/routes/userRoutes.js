import express from 'express';
const router = express.Router();
import {jwtValidation} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats, getDailyPokemons, catchPokemon} from '../controllers/userController.js'

router.get('/dashboard', jwtValidation, getDashboard);
router.get('/stats', jwtValidation, getStats);
router.get('/daily-pokemons', jwtValidation, getDailyPokemons);
router.post('/catch', jwtValidation, catchPokemon);

export default router;