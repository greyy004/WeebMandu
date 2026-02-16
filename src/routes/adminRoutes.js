import express from 'express';
const router = express.Router();
import {jwtValidation, isAdmin} from '../middlewares/authMiddleware.js';
import {getDashboard} from '../controllers/adminController.js'

router.get('/dashboard', jwtValidation, isAdmin, getDashboard);

export default router;