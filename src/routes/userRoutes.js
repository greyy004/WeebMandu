import express from 'express';
const router = express.Router();
import {jwtValidation} from '../middlewares/authMiddleware.js';
import {getDashboard} from '../controllers/userController.js'

router.get('/dashboard', jwtValidation, getDashboard);

export default router;