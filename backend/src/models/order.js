import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    pizzas: [
      {
        pizzaId: { type: String, required: true },
        name: { type: String, required: true, trim: true, maxlength: 80 },
        quantity: { type: Number, required: true, min: 1, max: 20 },
        priceCents: { type: Number, required: true, min: 1 },
        items: {
          base: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: false,
          },
          sauce: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: false,
          },
          cheese: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ingredient",
            required: false,
          },
          veggies: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
          ],
          meat: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
        },
      },
    ],
    totalCents: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Received", "In Kitchen", "Out for Delivery", "Delivered"],
      default: "Received",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
