import { Schema, Types, model } from "mongoose";

export interface IAuth {
    _id: Types.ObjectId,
    name: string,
    email: string,
    password: string,
    salt: string,
    isVerified: boolean,
    expoPushToken?: string,
    // Profile fields
    bio?: string,
    avatarUrl?: string,
    displayName?: string,
    status?: 'online' | 'idle' | 'dnd' | 'invisible',
}

const authSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    expoPushToken: {
        type: String,
        default: null,
    },
    bio: {
        type: String,
        default: '',
        maxlength: 180,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    displayName: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'online',
        enum: ['online', 'idle', 'dnd', 'invisible'],
    },
}, { timestamps: true });

export default model<IAuth>("Auth", authSchema);