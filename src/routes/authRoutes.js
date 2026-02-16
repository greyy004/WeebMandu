import express from 'express';
import {authLogin, authRegister} from '../controllers/authController.js';
import {validateRegister, validateLogin} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/authRegister',validateRegister, authRegister);
router.post('/authLogin', validateLogin, authLogin);

export default router;