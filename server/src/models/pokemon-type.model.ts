import mongoose, { Document, Schema } from 'mongoose';

interface IPokemonType extends Document {
    id: number,
    pokedex_id: number,
    name: string,
    cries: string[],
    types: string[],
    sprites: { name: string, data: string }[],
    description: string,
    capture_rate: number,
    evolves_from: number
}

const PokemonTypeSchema: Schema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    pokedex_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cries: {
        type: [String],
        required: true
    },
    types: {
        type: [String],
        required: true
    },
    sprites: {
        type: [{
            name: { type: String, required: true },
            data: { type: String, required: true }
        }],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    capture_rate: {
        type: Number,
        required: true
    },
    evolves_from: {
        type: Number,
        required: false
    }
});

const PokemonType = mongoose.model<IPokemonType>('PokemonType', PokemonTypeSchema);
export default PokemonType;