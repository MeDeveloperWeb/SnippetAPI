import {Router} from 'express';
import { register, login, refresh, forgotPassword, reqPassword, changePassword, verifyEmail, reqEmailVerification, googleLogin, changeUsername, logout, getUser, findUsers } from '../controllers/userController.js';
import { isAuthenticated, canReqPassword } from '../middleware/authHandler.js';
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/auth/google", googleLogin);
router.get("/token/refresh", refresh);
router.post("/change-username", isAuthenticated(), changeUsername);
router.post("/req-password", reqPassword);
router.post("/forgot-password", canReqPassword , forgotPassword);
router.post("/change-password", isAuthenticated(), changePassword);
router.get("/req-verification", isAuthenticated(), reqEmailVerification);
router.get("/verify-email", verifyEmail);
router.post("/logout", isAuthenticated(), logout);
router.get("/:username", getUser);
router.get("/", findUsers);

export default router;