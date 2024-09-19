import mongoose, { Document, Schema } from 'mongoose';


interface IUser extends Document {
    id: number;
    username: string;
    password: string;
}

const UserSchema: Schema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
})

const User = mongoose.model<IUser>('User', UserSchema);
export default User;