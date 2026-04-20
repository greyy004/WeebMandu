import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
const router = express.Router();
import {jwtValidation, isAdmin} from '../middlewares/authMiddleware.js';
import {getDashboard, getStats, getUsersDetails, getAchievements, addAchievement, deleteAchievement} from '../controllers/adminController.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'achievements');

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
    cb(null, `achievement-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB for icons
});

router.get('/dashboard', jwtValidation, isAdmin, getDashboard);
router.get('/stats', jwtValidation, isAdmin, getStats);
router.get('/userdetails', jwtValidation, isAdmin, getUsersDetails);
router.get('/achievements', jwtValidation, isAdmin, getAchievements);
router.post('/achievements', jwtValidation, isAdmin, upload.single('icon_file'), addAchievement);
router.delete('/achievements/:id', jwtValidation, isAdmin, deleteAchievement);

export default router;