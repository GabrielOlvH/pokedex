
export interface PokemonData {
    pokedex_id: number,
    form: string | null,
    timestamp: number
}

export type Encounter = {
    pokemon_id: number
    x: number,
    y: number,
    form: string | null,
    captured: string[]
}


export interface PlayerData {
    id: number
    pokemon: Map<number, PokemonData[]>
}

export type PlayerPosition = {
    x: number,
    y: number,
    zone: number
}

