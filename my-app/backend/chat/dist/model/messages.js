import mongoose, { Schema } from "mongoose";
const MessageSchema = new Schema({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId, // ✅ FIXED
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
}, {
    timestamps: true,
});
export const Message = mongoose.model("Message", MessageSchema);
