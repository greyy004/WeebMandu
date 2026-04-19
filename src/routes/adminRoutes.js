import express from 'express';
const router = express.Router();
import {jwtValidation, isAdmin} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats} from '../controllers/adminController.js'

router.get('/dashboard', jwtValidation, isAdmin, getDashboard);
router.get('/stats', jwtValidation, isAdmin, getStats);

export default router;