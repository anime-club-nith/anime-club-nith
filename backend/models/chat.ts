import { Schema, model, Types } from "mongoose";

export interface IChat {
  _id: Types.ObjectId,
  sender: Types.ObjectId,
  room: Types.ObjectId,
  text: string;
  imageURL: string;
  // Mention fields
  mentions: Types.ObjectId[];
  mentionsEveryone: boolean;
  // Pin fields
  isPinned: boolean;
  pinnedBy: Types.ObjectId | null;
  pinnedAt: Date | null;
  // Delete field
  isDeleted: boolean;
}

const chatSchema: Schema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'Auth',
    required: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
  text: {
    type: String,
  },
  imageURL: {
    type: String,
    default: " ",
  },
  // @Mentions
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'Auth',
    default: [],
  }],
  mentionsEveryone: {
    type: Boolean,
    default: false,
  },
  // Pinning
  isPinned: {
    type: Boolean,
    default: false,
    index: true,
  },
  pinnedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Auth',
    default: null,
  },
  pinnedAt: {
    type: Date,
    default: null,
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
},
  { timestamps: true });

export default model<IChat>("Chat", chatSchema);
