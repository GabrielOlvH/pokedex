import express from 'express';
import session from "express-session";

import http = require('http');
import {Server, Socket} from 'socket.io';

import {startEncounterTask} from './encounters';
import {handleMessages} from "./ws-messages";
import passport from './auth'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt from "bcryptjs";

const app = express();


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

app.use(cookieParser())
const sharedSess = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false, // UPDATE FOR HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
})

app.use(sharedSess)

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
    if (username.length < 5) {
        return res.status(400).json({ message: 'Username needs at least 5 characters' });
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            id: await User.countDocuments(),
            username,
            password: hashedPassword
        });

        await newUser.save();

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

app.get("/pokemon/:id", async (req, res) => {
    const id = parseInt(req.params["id"])
    const pokemon = await fetchPokemon(id)
    res.status(201).json(pokemon)
})

app.get("/pokedex", (req, res) => {
    res.status(201).json(pokedexCache)
})


const server = http.createServer(app)
// @ts-ignore
import ios from 'socket.io-express-session';
import User from "./models/user.model";
import connectDB from "./db";
import {fetchPokemon, pokedexCache} from "./pokemon-data";
import PokemonType from "./models/pokemon-type.model";

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
})
io.use(ios(sharedSess));

connectDB()

let connections = 0

io.sockets.on('connection', (socket) => {
    // @ts-ignore
    const sessions = socket.handshake["sessionStore"]["sessions"];
    if (sessions !== undefined) {
        for (const [key, value] of Object.entries(sessions)) {
            const sessionData = JSON.parse(value as string); // Parse the session data
            if (sessionData.passport && sessionData.passport.user !== undefined) {
                //@ts-ignore
                socket.userId = sessionData.passport.user
                console.log(`User ID ${getUserId(socket)} connected! Total: ${++connections}`);

            }
        }
    }
    socket.on('disconnect', () => {
        if (getUserId(socket) !== undefined) {
            console.log(`Client disconnected! Total: ${--connections}`)
        }
    })
    handleMessages(socket)


})

export const getUserId = (socket: Socket) => {
    //@ts-ignore
    return socket.userId;
}

startEncounterTask()

server.listen(4000, () => {
    console.log('listening on *:4000')
})

app.listen(4001, () => {
    console.log('Server started on http://localhost:4001');
});
