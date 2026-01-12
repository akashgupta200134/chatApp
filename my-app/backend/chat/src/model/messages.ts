import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;   // ✅ FIXED
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,   // ✅ FIXED
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    image: {
      url: String,
      publicId: String,
    },

    messageType: {
      type: String,
      enum: ["text", "image"],
      default: "text",
      required: true,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    seenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
