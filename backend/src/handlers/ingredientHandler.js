import Ingredient from '../models/ingredients.js';

export const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ quantity: { $gt: 0 } }).sort({ type: 1, name: 1 }).lean();

    const groupedIngredients = {
      bases: ingredients.filter((ingredient) => ingredient.type === 'base'),
      sauces: ingredients.filter((ingredient) => ingredient.type === 'sauce'),
      cheeses: ingredients.filter((ingredient) => ingredient.type === 'cheese'),
      veggies: ingredients.filter((ingredient) => ingredient.type === 'veggie'),
      meats: ingredients.filter((ingredient) => ingredient.type === 'meat')
    };

    return res.json({ ingredients: groupedIngredients });
  } catch (error) {
    console.error('Get ingredients error:', error);
    return res.status(500).json({ message: 'Server error fetching ingredients' });
  }
};

export const getAdminIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ type: 1, name: 1 }).lean();
    return res.json({ ingredients });
  } catch (error) {
    console.error('Get admin ingredients error:', error);
    return res.status(500).json({ message: 'Server error fetching ingredients' });
  }
};

export const addIngredient = async (req, res) => {
  try {
    const { name, type, quantity = 0, threshold = 20 } = req.body;
    const ingredient = await Ingredient.create({ name, type, quantity, threshold });

    return res.status(201).json({
      message: 'Ingredient added successfully',
      ingredient
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Ingredient already exists for this type' });
    }

    console.error('Add ingredient error:', error);
    return res.status(500).json({ message: 'Server error adding ingredient' });
  }
};

export const updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ingredient = await Ingredient.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    return res.json({
      message: 'Ingredient updated successfully',
      ingredient
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Ingredient already exists for this type' });
    }

    console.error('Update ingredient error:', error);
    return res.status(500).json({ message: 'Server error updating ingredient' });
  }
};

export const deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;

    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }

    return res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Delete ingredient error:', error);
    return res.status(500).json({ message: 'Server error deleting ingredient' });
  }
};

export const getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    })
      .sort({ type: 1, name: 1 })
      .lean();

    return res.json({ ingredients });
  } catch (error) {
    console.error('Get low stock ingredients error:', error);
    return res.status(500).json({ message: 'Server error fetching low stock ingredients' });
  }
};
