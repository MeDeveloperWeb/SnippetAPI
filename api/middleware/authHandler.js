import passport from "passport";
import statusCode from "../statusCode.js";
import User from "../models/userModel.js";
import { getDetailsFromJWT } from "../utils/userUtils.js";

const tokenResetExtractor = function (req) {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Reset ")) {
		return authHeader.substring(6, authHeader.length);
	} else {
		return null;
	}
};

export function isAuthenticated() {
	return passport.authenticate("jwt", { session: false });
}

export async function canReqPassword(req, res, next) {
	const reset = tokenResetExtractor(req);
	if (!reset)
		res.status(statusCode.VALIDATION_ERROR).json({
			error: "Invalid Link!",
		});
	else {
		const token = getDetailsFromJWT(reset, "reset");
		if (!token) {
			res.status(statusCode.UNAUTHORIZED).json({
				error: "Invalid Link!",
			});
			return;
		}
		const user = await User.findById(token.sub);
		if (!user) {
			res.status(statusCode.UNAUTHORIZED).json({
				error: "Invalid Link!",
			});
			return;
		} else {
			req.user = user;
			next();
		}
	}
}
