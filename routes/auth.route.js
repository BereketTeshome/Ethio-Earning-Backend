import express from "express";
import * as authController from "../controllers/auth.controller.js";
import passport from 'passport';

// import { register, login, googleAuth, googleAuthCallback } from '../controllers/auth.controller';
const router = express.Router();

router.route("/demo").get(authController.demoController);
router.route("/register").post(authController.register);

router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);

router.route("/google").get(authController.googleAuth);
// Password recovery routes
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password').post(authController.resetPassword);
// Activate the user account after its regitration
router.route("/verfiyuser").post(authController.activateTheUserAccount)
// Verify 2FA route
router.post('/activate', authController.verify2FA);
// Enable 2FA 
router.post('/enable-2fa',authController.enable2FA)

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),authController.googleAuthHandler);

router.get('/', authController.getAllUsers);
export default router;
