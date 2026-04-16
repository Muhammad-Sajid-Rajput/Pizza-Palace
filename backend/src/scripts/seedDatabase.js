import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Ingredient from "../models/ingredients.js";
import User from "../models/user.js";

dotenv.config();

const mongoUri =
  process.env.SEED_MONGODB_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/pizzadb";

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding");

    await Ingredient.deleteMany({});
    console.log("Cleared existing ingredients");

    const ingredients = [
      // Bases
      { name: "Thin Crust", type: "base", quantity: 50, threshold: 10 },
      { name: "Thick Crust", type: "base", quantity: 45, threshold: 10 },
      { name: "Stuffed Crust", type: "base", quantity: 30, threshold: 8 },
      { name: "Gluten-Free Base", type: "base", quantity: 25, threshold: 5 },
      { name: "Whole Wheat Base", type: "base", quantity: 35, threshold: 8 },
      // Sauces
      { name: "Tomato Sauce", type: "sauce", quantity: 40, threshold: 12 },
      { name: "BBQ Sauce", type: "sauce", quantity: 35, threshold: 10 },
      { name: "White Sauce", type: "sauce", quantity: 30, threshold: 8 },
      { name: "Pesto Sauce", type: "sauce", quantity: 25, threshold: 6 },
      { name: "Spicy Sauce", type: "sauce", quantity: 38, threshold: 10 },
      // Cheeses
      { name: "Mozzarella", type: "cheese", quantity: 60, threshold: 15 },
      { name: "Cheddar", type: "cheese", quantity: 45, threshold: 12 },
      { name: "Parmesan", type: "cheese", quantity: 35, threshold: 10 },
      { name: "Goat Cheese", type: "cheese", quantity: 25, threshold: 8 },
      { name: "Blue Cheese", type: "cheese", quantity: 20, threshold: 5 },
      // Veggies
      { name: "Bell Peppers", type: "veggie", quantity: 40, threshold: 12 },
      { name: "Mushrooms", type: "veggie", quantity: 35, threshold: 10 },
      { name: "Onions", type: "veggie", quantity: 45, threshold: 15 },
      { name: "Tomatoes", type: "veggie", quantity: 38, threshold: 12 },
      { name: "Olives", type: "veggie", quantity: 30, threshold: 8 },
      { name: "Spinach", type: "veggie", quantity: 25, threshold: 8 },
      { name: "Corn", type: "veggie", quantity: 32, threshold: 10 },
      { name: "Jalapeños", type: "veggie", quantity: 28, threshold: 8 },
      { name: "Pineapple", type: "veggie", quantity: 22, threshold: 6 },
      // Meats
      { name: "Pepperoni", type: "meat", quantity: 50, threshold: 15 },
      { name: "Italian Sausage", type: "meat", quantity: 40, threshold: 12 },
      { name: "Ham", type: "meat", quantity: 35, threshold: 10 },
      { name: "Bacon", type: "meat", quantity: 30, threshold: 10 },
      { name: "Chicken", type: "meat", quantity: 45, threshold: 12 },
      { name: "Ground Beef", type: "meat", quantity: 38, threshold: 12 },
    ];

    await Ingredient.insertMany(ingredients);
    console.log(`Seeded ${ingredients.length} ingredients`);

    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@pizzapalace.com";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin12345";
    const userEmail = process.env.SEED_USER_EMAIL || "user@pizzapalace.com";
    const userPassword = process.env.SEED_USER_PASSWORD || "user12345";

    await User.updateOne(
      { email: adminEmail.toLowerCase() },
      {
        $set: {
          name: "Admin User",
          email: adminEmail.toLowerCase(),
          password: await bcrypt.hash(adminPassword, 12),
          role: "admin",
          isVerified: true,
          verifyToken: undefined,
          verifyTokenExpiresAt: undefined,
        },
      },
      { upsert: true },
    );

    await User.updateOne(
      { email: userEmail.toLowerCase() },
      {
        $set: {
          name: "Demo User",
          email: userEmail.toLowerCase(),
          password: await bcrypt.hash(userPassword, 12),
          role: "user",
          isVerified: true,
          verifyToken: undefined,
          verifyTokenExpiresAt: undefined,
        },
      },
      { upsert: true },
    );

    console.log("Seeded demo accounts");
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`User: ${userEmail} / ${userPassword}`);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedData();
