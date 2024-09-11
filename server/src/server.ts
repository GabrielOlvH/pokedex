import express from 'express';
import session from "express-session";

import http = require('http');
import {Server} from 'socket.io';

import {startEncounterTask} from './encounters';
import {handleMessages} from "./ws-messages";
import passport, {users} from './auth'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from "bcryptjs";
import {User} from './types'

const app = express();


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(cookieParser())

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // UPDATE FOR HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.post('/login', passport.authenticate('local'), (req, res) => {

    res.send({ message: 'Logged in successfully' });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if the username already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create a new user with the hashed password
        const newUser: User = ({
            id: users.length,
            username,
            password: hashedPassword, // Save the hashed password
        });

        users.push(newUser)

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during signup', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.send({ authenticated: true, user: req.user });
    } else {
        res.send({ authenticated: false });
    }
});


app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) return res.status(500).send({ message: 'Logout failed' });
        res.send({ message: 'Logged out successfully' });
    });
});

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
})

let connections = 0

io.on('connection', (socket) => {
    console.log(`Client connected! Total: ${++connections}`);
    socket.on('disconnect', () => console.log(`Client disconnected! Total: ${--connections}`))
    handleMessages(socket)
})

startEncounterTask()

server.listen(4000, () => {
    console.log('listening on *:4000')
})

app.listen(4001, () => {
    console.log('Server started on http://localhost:4001');
});
