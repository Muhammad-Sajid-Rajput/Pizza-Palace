import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    type: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'], required: true },
    quantity: { type: Number, default: 0, min: 0 },
    threshold: { type: Number, default: 20, min: 0 }
  },
  { timestamps: true }
);

ingredientSchema.index({ name: 1, type: 1 }, { unique: true });

export default mongoose.model('Ingredient', ingredientSchema);
