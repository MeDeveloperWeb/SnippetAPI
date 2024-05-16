import { Router } from "express";
import {
	register,
	login,
	refresh,
	reqPassword,
	changePassword,
	verifyEmail,
	reqEmailVerification,
	googleLogin,
	changeUsername,
	logout,
	getUser,
	findUsers,
	refreshViaPOST,
	changeEmail,
	canChangeForgottenPassword,
	resetForgottenPassword,
} from "../controllers/userController.js";
import { isAuthenticated, canReqPassword } from "../middleware/authHandler.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/auth/google", googleLogin);
router.get("/token/refresh", refresh);
router.post("/token/refresh", refreshViaPOST);
router.post("/change-username", isAuthenticated(), changeUsername);
router.post("/req-password", reqPassword);
router.get("/forgot-password", canReqPassword, canChangeForgottenPassword);
router.post("/reset-password", canReqPassword, resetForgottenPassword);
router.post("/change-password", isAuthenticated(), changePassword);
router.post("/change-email", isAuthenticated(), changeEmail);
router.get("/req-verification", isAuthenticated(), reqEmailVerification);
router.get("/verify-email/:token", verifyEmail);
router.post("/logout", isAuthenticated(), logout);
router.post("/", isAuthenticated(), getUser);
router.get("/", findUsers);

export default router;
