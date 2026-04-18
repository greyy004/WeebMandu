import express from 'express';
import {authLogin, authRegister, authLogout} from '../controllers/authController.js';
import {validateRegister, validateLogin} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/authRegister',validateRegister, authRegister);
router.post('/authLogin', validateLogin, authLogin);
router.get('/authLogout', authLogout);

export default router;