import {Server, Socket} from "socket.io";
import {Encounter, PlayerPosition} from "./types";
import {getUserId} from "./server";
import {fetchPokemon} from "./pokemon-data";

let encounters: Encounter[][] = []

const updateEncounters = (zone: number) => {
    console.log(`Updating encounters for zone ${zone}: `)

    let zoneEncounters: Encounter[] = []
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
            const chance = (0.9 + (zoneEncounters.length * 0.02))
            if (Math.random() > chance) {
                zoneEncounters.push({
                    pokemon_id: Math.round(Math.random() * 151),
                    x, y,
                    form: null,
                    captured: []
                })
            }
        }
    }

    console.log(zoneEncounters)

    encounters[zone] = zoneEncounters
}

const updateAllEncounters = () => {
    for (let i = 0; i < 32; i++) {
        updateEncounters(i)
    }
}

const startEncounterTask = () => {
    updateAllEncounters()
    setTimeout(() => {
        updateAllEncounters()
    }, 1000 * 60 * 15)
}

const checkEncounter = (pos: PlayerPosition, socket: Socket) => {

    for (let encounter of encounters[pos.zone]) {
        if (encounter.x === pos.x && encounter.y === pos.y && !encounter.captured.includes(getUserId(socket))) {
            socket.emit('UPDATE_ENCOUNTER', JSON.stringify(encounter))
            return
        }
    }
    socket.emit('UPDATE_ENCOUNTER', 'none')
}

const throwPokeball = (pos: PlayerPosition, socket: Socket) => {
    for (let encounter of encounters[pos.zone]) {
        if (encounter.x === pos.x && encounter.y === pos.y && !encounter.captured.includes(getUserId(socket))) {
            fetchPokemon(encounter.pokemon_id).then(pkmn => {
                const catchRate = pkmn.capture_rate * 2
                let shakes = 3;
                let i;
                for (i = 0; i < shakes; i++) {
                    let randomValue = Math.floor(Math.random() * 256);
                    if (randomValue > catchRate) {
                        break
                    }
                }
                if (i === 3) {
                    encounter.captured.push(getUserId(socket))

                }
                socket.emit('CAPTURE_CHECK', JSON.stringify({ shakes: i }))
            });
            break;
        }
    }
}

export {
    startEncounterTask,
    checkEncounter,
    throwPokeball
}