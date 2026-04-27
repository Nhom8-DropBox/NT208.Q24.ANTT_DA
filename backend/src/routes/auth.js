import authController from '../controllers/authController.js';
import middlewareAuth from '../middleware/auth.js';
import express from 'express';
const router = express.Router();


router.post('/register', authController.register); 
router.post('/login', authController.login); 
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', middlewareAuth, authController.getProfile);
export default router;