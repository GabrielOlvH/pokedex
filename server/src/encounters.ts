import {Server, Socket} from "socket.io";
import {PlayerPosition} from "./player-data";

type Encounter = {
    pokemon_id: number
    x: number,
    y: number,
    form: string | null,
    captured: string[]
}

let encounters: Encounter[][]=[]

const updateEncounters = (zone: number) => {
    console.log(`Updating encounters for zone ${zone}: `)

    let zoneEncounters: Encounter[] = []
    for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
            const chance = (0.9 + (zoneEncounters.length * 0.02))
            if (Math.random() > chance) {
                zoneEncounters.push({
                    pokemon_id: Math.floor(Math.random() * 1000),
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
        console.log(`check ${JSON.stringify(pos)} ${JSON.stringify(encounter)}`)
        if (encounter.x === pos.x && encounter.y === pos.y ) {
            socket.emit('UPDATE_ENCOUNTER', JSON.stringify(encounter))
            console.log("FOUND!")
            return
        }
    }
    socket.emit('UPDATE_ENCOUNTER', 'none')
}

const throwPokeball = (pos: PlayerPosition, socket: Socket) => {
    for (let encounter of encounters[pos.zone]) {
        if (encounter.x === pos.x && encounter.y === pos.y) {
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${encounter.pokemon_id}/`).then(resp =>
                resp.json().then(json => {
                    const catchRate = json.capture_rate * 2
                    let shakes = 3;
                    let i;
                    for (i = 0; i < shakes; i++) {
                        let randomValue = Math.floor(Math.random() * 256);
                        if (randomValue > catchRate) {
                            break
                        }
                    }
                    socket.emit('CAPTURE_CHECK', JSON.stringify({ shakes: i }))
                }))
            return
        }
    }

}

export {
    startEncounterTask,
    checkEncounter,
    throwPokeball
}