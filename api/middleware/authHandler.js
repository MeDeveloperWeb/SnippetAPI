import passport from 'passport';
import statusCode from '../statusCode.js';
import User from "../models/userModel.js";
import { getDetailsFromJWT } from '../utils/userUtils.js';

const tokenResetExtracter = function(req) {
    const authHeader = req.get("authorization");
    if (authHeader?.startsWith("Reset ")){
        return authHeader.substring(6, authHeader.length);
   } else {
      return null;
   }
};

export function isAuthenticated() {
    return (
        passport.authenticate('jwt', { session: false })
    );
}

export async function canReqPassword(req, res, next) {
    const reset = tokenResetExtracter(req);
    if (!reset) res.status(statusCode.VALIDATION_ERROR).json("Invalid Link!");
    else {
        const token = getDetailsFromJWT(reset, "reset");
        const user = await User.findById(token.sub);
        if (user === null || user === undefined) res.status(statusCode.VALIDATION_ERROR).json("Invalid Link!");
        else {
            req.user = user;
            next();
        }
    }
}

