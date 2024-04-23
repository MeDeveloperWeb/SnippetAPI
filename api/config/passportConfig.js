import passport from 'passport';
import User  from "../models/userModel.js";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const usePassport = () => {
    const opts = {
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_ACCESS_SECRET,
    };

    passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
        try {
            const user = await User.findById(jwt_payload.sub);
            return done(null, user || false);
        }
        catch (err) {
            return done(err, false);
        }
    }));
}

export default usePassport;

