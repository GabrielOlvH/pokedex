
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import {User} from "./types";

// Mock users for simplicity
export const users: User[] = [
    { id: 1, username: 'user', password: '$2a$10$XNML3xt1dNvAkcswcet1n.IF5VWGqYdAbowYMdLYI07VajzNbPq46' } // hashed password 'password123'
];

// Passport local strategy configuration
passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(user => user.username === username);

    if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.hash("password123", 10).then(console.log)
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
    const user = users.find(user => user.id === id);
    done(null, user || false);
});

export default passport;
