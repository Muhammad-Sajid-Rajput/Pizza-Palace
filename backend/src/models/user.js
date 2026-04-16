import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiresAt: Date,
    verifyToken: String,
    verifyTokenExpiresAt: Date
}, { timestamps: true });


export default mongoose.model("User", userSchema);
