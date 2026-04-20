import express from 'express';
const router = express.Router();
import {jwtValidation, isAdmin} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats, getUsersDetails, getAchievements, addAchievement, deleteAchievement} from '../controllers/adminController.js'

router.get('/dashboard', jwtValidation, isAdmin, getDashboard);
router.get('/stats', jwtValidation, isAdmin, getStats);
router.get('/userdetails', jwtValidation, isAdmin, getUsersDetails);
router.get('/achievements', jwtValidation, isAdmin, getAchievements);
router.post('/achievements', jwtValidation, isAdmin, addAchievement);
router.delete('/achievements/:id', jwtValidation, isAdmin, deleteAchievement);

export default router;