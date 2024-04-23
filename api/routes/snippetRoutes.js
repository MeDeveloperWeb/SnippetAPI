import { Router } from "express";
import {
	addSnippet,
	deleteSnippet,
	findAll,
	getSnippet,
	getUserSnippets,
	updateSnippet,
} from "../controllers/snippetController.js";
import { isAuthenticated } from "../middleware/authHandler.js";

const router = Router();

router.get("/", findAll);
router.get("/get/:id", getSnippet);
router.post("/add", isAuthenticated(), addSnippet);
router.get("/user/:username", getUserSnippets);
router.delete("/delete", isAuthenticated(), deleteSnippet);
router.post("/update", isAuthenticated(), updateSnippet);

export default router;
