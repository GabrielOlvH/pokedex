
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from "./models/user.model";

// Mock users for simplicity

// Passport local strategy configuration
passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({ username });

    console.log(username)
    console.log(password)
    if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
    }
    // Compare hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    });
}));

// Serialize user into session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id: number, done) => {
    User.findOne({ id })
        .then((user) => done(null, user || false));

});

export default passport;
