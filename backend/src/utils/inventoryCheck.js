import Ingredient from '../models/ingredients.js';
import { sendMail } from './mailer.js';

export const checkInventoryThreshold = async () => {
  try {
    const lowStockIngredients = await Ingredient.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    }).lean();

    if (lowStockIngredients.length === 0) {
      return [];
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return lowStockIngredients;
    }

    const ingredientList = lowStockIngredients
      .map(
        (ingredient) =>
          `- ${ingredient.name} (${ingredient.type}): ${ingredient.quantity} units remaining (threshold: ${ingredient.threshold})`
      )
      .join('\n');

    await sendMail({
      from: process.env.FROM_EMAIL,
      to: adminEmail,
      subject: 'Low Stock Alert - Pizza Palace Inventory',
      html: `
        <h2>Low Stock Alert</h2>
        <p>The following ingredients need restocking:</p>
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${ingredientList}</pre>
      `
    });

    console.log(`Low stock alert sent for ${lowStockIngredients.length} ingredients`);
    return lowStockIngredients;
  } catch (error) {
    console.error('Inventory check error:', error);
    return [];
  }
};
