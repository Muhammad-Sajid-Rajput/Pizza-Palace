import mongoose from "mongoose";
import Order from "../models/order.js";
import Ingredient from "../models/ingredients.js";
import Cart from "../models/cart.js";

import { pizzas as pizzaDataConfig } from "../models/pizzaData.js";

const DELIVERY_FEE_CENTS = 199;

const ingredientPopulate = [
  { path: "pizzas.items.base", select: "name type" },
  { path: "pizzas.items.sauce", select: "name type" },
  { path: "pizzas.items.cheese", select: "name type" },
  { path: "pizzas.items.veggies", select: "name type" },
  { path: "pizzas.items.meat", select: "name type" },
];

const calculateIngredientUsage = (items) => {
  const usageByName = new Map();

  for (const item of items) {
    const quantity = item.quantity || 1;
    const { base, sauce, cheese, veggies = [], meat = [] } = item.customization;

    [base, sauce, cheese, ...veggies, ...meat].forEach((name) => {
      usageByName.set(name, (usageByName.get(name) || 0) + quantity);
    });
  }

  return usageByName;
};

export const createOrder = async (req, res) => {
  try {
    const { items, totalCents: clientTotalCents } = req.body;
    const userId = req.user.id;

    // 1. Recalculate price and validate pizza IDs
    let calculatedTotalCents = 0;
    const validatedItems = [];

    for (const item of items) {
      const pizzaConfig = pizzaDataConfig.find(
        (p) => String(p._id) === String(item.pizzaId),
      );
      if (!pizzaConfig) {
        throw new Error(`Invalid pizza ID: ${item.pizzaId}`);
      }

      const itemPrice = pizzaConfig.priceCents;
      calculatedTotalCents += itemPrice * item.quantity;

      validatedItems.push({
        ...item,
        priceCents: itemPrice,
        name: pizzaConfig.name,
      });
    }

    const finalTotalCents = calculatedTotalCents + DELIVERY_FEE_CENTS;

    // 2. Validate ingredients availability
    const usageByName = calculateIngredientUsage(validatedItems);
    const ingredientNames = Array.from(usageByName.keys());
    const ingredients = await Ingredient.find({
      name: { $in: ingredientNames },
    }).lean();

    // Check which ingredients are missing
    const foundNames = new Set(ingredients.map((i) => i.name));
    const missingIngredients = ingredientNames.filter(
      (name) => !foundNames.has(name),
    );

    if (missingIngredients.length > 0) {
      return res.status(400).json({
        message: "Some ingredients are not available in inventory.",
        unavailableIngredients: missingIngredients,
        hint: "Please contact admin to restock these ingredients.",
      });
    }

    const ingredientByName = new Map(
      ingredients.map((ingredient) => [ingredient.name, ingredient]),
    );

    // Validate ingredient types
    for (const item of validatedItems) {
      const {
        base,
        sauce,
        cheese,
        veggies = [],
        meat = [],
      } = item.customization;

      if (ingredientByName.get(base)?.type !== "base")
        throw new Error(`Invalid base: ${base}`);
      if (ingredientByName.get(sauce)?.type !== "sauce")
        throw new Error(`Invalid sauce: ${sauce}`);
      if (ingredientByName.get(cheese)?.type !== "cheese")
        throw new Error(`Invalid cheese: ${cheese}`);

      for (const v of veggies) {
        if (ingredientByName.get(v)?.type !== "veggie")
          throw new Error(`Invalid veggie: ${v}`);
      }
      for (const m of meat) {
        if (ingredientByName.get(m)?.type !== "meat")
          throw new Error(`Invalid meat: ${m}`);
      }
    }

    for (const [name, requiredQty] of usageByName.entries()) {
      const ingredient = ingredientByName.get(name);
      if (!ingredient || ingredient.quantity < requiredQty) {
        throw new Error(`${name} does not have enough stock.`);
      }
    }

    // 3. Prepare order pizzas
    const orderPizzas = validatedItems.map((item) => {
      const { customization } = item;

      // Safe getter for ingredient ID
      const getIngredientId = (name) => {
        const ing = ingredientByName.get(name);
        return ing ? ing._id : null;
      };

      return {
        pizzaId: item.pizzaId,
        quantity: item.quantity,
        priceCents: item.priceCents,
        name: item.name,
        items: {
          base: getIngredientId(customization.base),
          sauce: getIngredientId(customization.sauce),
          cheese: getIngredientId(customization.cheese),
          veggies: (customization.veggies || [])
            .map(getIngredientId)
            .filter(Boolean),
          meat: (customization.meat || []).map(getIngredientId).filter(Boolean),
        },
      };
    });

    // 4. Create Order
    const order = await Order.create({
      user: userId,
      pizzas: orderPizzas,
      totalCents: finalTotalCents,
    });

    // 5. Deduct inventory
    await Ingredient.bulkWrite(
      Array.from(usageByName.entries()).map(([name, qty]) => ({
        updateOne: {
          filter: { name },
          update: { $inc: { quantity: -qty } },
        },
      })),
    );

    // 6. Clear cart
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate(ingredientPopulate);

    return res.status(201).json({
      message: "Order placed successfully!",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res
      .status(400)
      .json({ message: error.message || "Server error creating order" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate(ingredientPopulate)
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({ message: "Server error fetching orders" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate(ingredientPopulate)
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({ message: "Server error fetching orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("user", "name email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res
      .status(500)
      .json({ message: "Server error updating order status" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = { _id: id };
    if (userRole !== "admin") {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate("user", "name email")
      .populate(ingredientPopulate);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    console.error("Get order by ID error:", error);
    return res.status(500).json({ message: "Server error fetching order" });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [received, kitchen, delivery, completed, total] = await Promise.all([
      Order.countDocuments({ status: "Received" }),
      Order.countDocuments({ status: "In Kitchen" }),
      Order.countDocuments({ status: "Out for Delivery" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments(),
    ]);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .populate(ingredientPopulate)
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json({
      stats: { total, received, kitchen, delivery, completed },
      recentOrders,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return res
      .status(500)
      .json({ message: "Server error fetching order statistics" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = { _id: id };
    if (userRole !== "admin") {
      query.user = userId;
    }

    const order = await Order.findOne(query);
    if (!order) {
      throw new Error("Order not found");
    }

    // Only allow user to cancel if it's still just "Received"
    if (userRole !== "admin" && order.status !== "Received") {
      return res.status(400).json({
        message: `Cannot cancel order in status: ${order.status}. Please contact support.`,
      });
    }

    if (order.status === "Delivered") {
      return res
        .status(400)
        .json({ message: "Cannot cancel a delivered order" });
    }

    const restockOps = [];
    for (const pizza of order.pizzas) {
      const ingredientIds = [
        pizza.items.base,
        pizza.items.sauce,
        pizza.items.cheese,
        ...(pizza.items.veggies || []),
        ...(pizza.items.meat || []),
      ].filter(Boolean); // Only include valid ingredient IDs

      for (const ingredientId of ingredientIds) {
        restockOps.push({
          updateOne: {
            filter: { _id: ingredientId },
            update: { $inc: { quantity: pizza.quantity } },
          },
        });
      }
    }

    if (restockOps.length > 0) {
      await Ingredient.bulkWrite(restockOps);
    }

    await Order.deleteOne({ _id: id });

    return res.json({ message: "Order cancelled and ingredients restocked" });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(error.message === "Order not found" ? 404 : 400).json({
      message: error.message || "Server error cancelling order",
    });
  }
};
