import express from 'express';

import http = require('http');
import {Server} from 'socket.io';
import {checkEncounter, startEncounterTask, throwPokeball} from './encounters';
import {PlayerPosition} from "./player-data";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (or specify a particular domain)
        methods: ["GET", "POST"], // HTTP methods allowed
        allowedHeaders: ["my-custom-header"], // Allow custom headers if needed
        credentials: true, // Allow cookies to be sent
    },
});

let connections = 0

io.on('connection', (socket) => {
    console.log(`Client connected! Total: ${++connections}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected! Total: ${--connections}`);
    });

    socket.on('MOVE_PLAYER', (payload) => {
        const pos: PlayerPosition = JSON.parse(payload)
        checkEncounter(pos, socket)
    })

    socket.on('THROW_POKEBALL', (payload) => {
        const pos: PlayerPosition = JSON.parse(payload)
        throwPokeball(pos, socket)
    })
});

startEncounterTask()


server.listen(4000, () => {
    console.log('listening on *:4000');
});
