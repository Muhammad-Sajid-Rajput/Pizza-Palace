import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            pizzaId: { type: String, required: true },
            name: { type: String, required: true, trim: true, maxlength: 80 },
            priceCents: { type: Number, required: true, min: 1 },
            imageName: { type: String, trim: true },
            customization: {
                base: { type: String, required: true, trim: true },
                sauce: { type: String, required: true, trim: true },
                cheese: { type: String, required: true, trim: true },
                veggies: [String],
                meat: [String]
            },
            quantity: { type: Number, default: 1, min: 1, max: 20 }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", cartSchema);
