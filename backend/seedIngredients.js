import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pizzapalace';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Ingredient Schema (inline to avoid import issues)
const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  type: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'], required: true },
  quantity: { type: Number, default: 50, min: 0 },
  threshold: { type: Number, default: 20, min: 0 }
}, { timestamps: true });

ingredientSchema.index({ name: 1, type: 1 }, { unique: true });

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

// Seed ingredients
const seedIngredients = async () => {
  try {
    // Read ingredients from JSON file
    const ingredientsPath = path.join(__dirname, 'ingredients.json');
    const rawData = fs.readFileSync(ingredientsPath, 'utf8');
    const ingredientsData = JSON.parse(rawData);

    // Flatten all ingredients into one array
    const allIngredients = [
      ...ingredientsData.bases.map(i => ({ ...i, type: 'base' })),
      ...ingredientsData.sauces.map(i => ({ ...i, type: 'sauce' })),
      ...ingredientsData.cheeses.map(i => ({ ...i, type: 'cheese' })),
      ...ingredientsData.veggies.map(i => ({ ...i, type: 'veggie' })),
      ...ingredientsData.meats.map(i => ({ ...i, type: 'meat' })),
    ];

    console.log(`📦 Found ${allIngredients.length} ingredients to seed`);

    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log('🧹 Cleared existing ingredients');

    // Insert all ingredients
    const result = await Ingredient.insertMany(allIngredients, { ordered: false });
    console.log(`✅ Successfully seeded ${result.length} ingredients`);

    // Log summary by type
    const summary = await Ingredient.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Ingredients Summary:');
    summary.forEach(s => {
      console.log(`   ${s._id}: ${s.count}`);
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
console.log('🚀 Starting ingredients seeding...\n');
await connectDB();
await seedIngredients();
