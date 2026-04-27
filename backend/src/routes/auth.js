import authController from '../controllers/authController.js';
import express from 'express';
const router = express.Router();


router.post('/register', authController.register); // routing to register page and calling the 'register' function in authController
router.post('/login', authController.login); // routing to login page and calling the 'login' function in authController

export default router;