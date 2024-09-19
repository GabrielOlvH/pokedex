import {PlayerData, PokemonData} from "./types";

const players: Map<number, PlayerData> = new Map<number, PlayerData>()

export const getPlayerData = (id: number) => {
    if (!players.has(id)) {
        const defaultData: PlayerData = {
            id,
            pokemon: new Map<number, PokemonData[]>()
        }
        players.set(id, defaultData)
        return defaultData
    }
    return players.get(id)
}