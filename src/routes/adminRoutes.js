import express from 'express';
const router = express.Router();
import {jwtValidation, isAdmin} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats, getUsersDetails} from '../controllers/adminController.js'

router.get('/dashboard', jwtValidation, isAdmin, getDashboard);
router.get('/stats', jwtValidation, isAdmin, getStats);
router.get('/userdetails', jwtValidation, isAdmin, getUsersDetails);

export default router;