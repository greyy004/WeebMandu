import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { authLogin, authRegister, authLogout, updateProfilePicture } from '../controllers/authController.js';
import { validateRegister, validateLogin, jwtValidation } from '../middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'public', 'userAvatar');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

const router = express.Router();

router.post('/authRegister', validateRegister, authRegister);
router.post('/authLogin', validateLogin, authLogin);
router.get('/authLogout', authLogout);
router.post('/profile-picture', jwtValidation, upload.single('avatar'), updateProfilePicture);

export default router;
