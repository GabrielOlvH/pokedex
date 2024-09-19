import {Socket} from "socket.io";
import {checkEncounter, throwPokeball} from "./encounters";
import {PlayerPosition} from "./types";

export const handleMessages = (socket: Socket) => {

    socket.on('MOVE_PLAYER', (payload) => {
        const pos: PlayerPosition = JSON.parse(payload)
        checkEncounter(pos, socket)
    })

    socket.on('THROW_POKEBALL', (payload) => {

        const pos: PlayerPosition = JSON.parse(payload)
        throwPokeball(pos, socket)
    })
}