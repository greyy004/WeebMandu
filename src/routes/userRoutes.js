import express from 'express';
const router = express.Router();
import {jwtValidation} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats, getWallet, getDailyPokemons, catchPokemon, getOwnedPokemons, buyPokeball, claimDailyReward, getOnlineTrainers} from '../controllers/userController.js'

router.get('/dashboard', jwtValidation, getDashboard);
router.get('/stats', jwtValidation, getStats);
router.get('/wallet', jwtValidation, getWallet);
router.get('/daily-pokemons', jwtValidation, getDailyPokemons);
router.get('/owned-pokemons', jwtValidation, getOwnedPokemons);
router.post('/store/buy-pokeball', jwtValidation, buyPokeball);
router.post('/daily-reward/claim', jwtValidation, claimDailyReward);
router.post('/catch', jwtValidation, catchPokemon);
router.get('/onlineTrainers', jwtValidation, getOnlineTrainers);

export default router;
