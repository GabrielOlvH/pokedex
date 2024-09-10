import {PokemonData} from "./pokemon-data";

interface PlayerData {
    uuid: string
    pokemon: Map<number, PokemonData>
}

type PlayerPosition = {
    x: number,
    y: number,
    zone: number
}

export {
    PlayerData,
    PlayerPosition
}