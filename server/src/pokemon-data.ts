import PokemonType from "./models/pokemon-type.model";

export const pokedexCache: {id: number, name: string, sprite: string}[] = []

const generateCache = () => {
    PokemonType.find().then(p => p.forEach(pokemon => {
        pokedexCache.push({
            id: pokemon.pokedex_id,
            name: pokemon.name,
            sprite: pokemon.sprites[0].data
        })
    }))
}

generateCache()

export const fetchPokemon = (id: number) => {
    return PokemonType.findOne({ id }).then(value => {
        if (value) {
            return value
        }

        return cachePokemon(id).then((value) => value)
    })
}


const cachePokemon = async (id: number) => {
    const results = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
    ]);

    const [r1, r2] = results;
    const pokemon = await r1.json();
    const species = await r2.json();

    // Função para converter imagem em base64 no Node.js
    const imageToBase64 = async (url: string) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    };

    // Converta as sprites para base64
    const frontDefaultBase64 = await imageToBase64(pokemon["sprites"]["front_default"]);
    const frontShinyBase64 = await imageToBase64(pokemon["sprites"]["front_shiny"]);

    const type = new PokemonType({
        id: id,
        pokedex_id: species["pokedex_numbers"][0]["entry_number"],
        name: pokemon["forms"][0]["name"],
        cries: pokemon["cries"]["latest"],
        types: pokemon["types"].map((r: any) => r["type"]["name"]),
        sprites: [
            {
                name: "front-default",
                data: frontDefaultBase64
            },
            {
                name: "front-shiny",
                data: frontShinyBase64
            }
        ],
        description: species["flavor_text_entries"][0]["flavor_text"].replaceAll("\n", " "),
        capture_rate: species["capture_rate"],
        evolves_from: species["evolves_from_species"]
            ? species["evolves_from_species"].url.split("/").slice(-2)[0]
            : null
    });
    await type.save();
    console.log(`Saved ${type.name} (#${type.pokedex_id}) to db`)
    console.log(type)
    return type;
};

