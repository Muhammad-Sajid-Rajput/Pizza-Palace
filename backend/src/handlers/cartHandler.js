import Cart from "../models/cart.js";
import { pizzas } from "../models/pizzaData.js";

const defaultCustomization = {
  base: "Thin Crust",
  sauce: "Tomato Sauce",
  cheese: "Mozzarella",
  veggies: [],
  meat: [],
};

const normalizeCustomization = (customization = {}) => ({
  base: customization.base || defaultCustomization.base,
  sauce: customization.sauce || defaultCustomization.sauce,
  cheese: customization.cheese || defaultCustomization.cheese,
  veggies: Array.isArray(customization.veggies)
    ? [
        ...new Set(
          customization.veggies
            .map((value) => String(value).trim())
            .filter(Boolean),
        ),
      ].sort()
    : [],
  meat: Array.isArray(customization.meat)
    ? [
        ...new Set(
          customization.meat
            .map((value) => String(value).trim())
            .filter(Boolean),
        ),
      ].sort()
    : [],
});

const buildItemKey = (item) =>
  `${item.pizzaId}:${item.customization.base}:${item.customization.sauce}:${item.customization.cheese}:${item.customization.veggies.join(
    ",",
  )}:${item.customization.meat.join(",")}`;

const mergeDuplicateItems = (items) => {
  const itemMap = new Map();

  for (const item of items) {
    const safeItem = {
      ...item,
      customization: normalizeCustomization(item.customization),
      quantity: Number(item.quantity) || 1,
    };
    const key = buildItemKey(safeItem);

    if (!itemMap.has(key)) {
      itemMap.set(key, safeItem);
    } else {
      const existing = itemMap.get(key);
      existing.quantity += safeItem.quantity;
      itemMap.set(key, existing);
    }
  }

  return Array.from(itemMap.values());
};

export const addToCart = async (req, res) => {
  try {
    const { pizzaId, name, imageName, customization, quantity = 1 } = req.body;
    const userId = req.user.id;

    const pizzaData = pizzas.find(
      (pizza) => String(pizza._id) === String(pizzaId),
    );
    if (!pizzaData) {
      return res.status(400).json({ message: "Invalid pizza item" });
    }

    const finalPriceCents = pizzaData.priceCents;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const safeCustomization = normalizeCustomization(customization);

    cart.items.push({
      pizzaId,
      name: pizzaData.name, // Use name from database/config
      priceCents: finalPriceCents,
      imageName: pizzaData.imageName, // Use imageName from database/config
      customization: safeCustomization,
      quantity,
    });

    cart.items = mergeDuplicateItems(cart.items);
    await cart.save();

    return res.json({ message: "Added to cart", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ message: "Server error adding to cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId }).lean();

    if (!cart) {
      return res.json({ cart: { items: [] } });
    }

    const items = mergeDuplicateItems(cart.items || []);
    return res.json({ cart: { ...cart, items } });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ message: "Server error fetching cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { pizzaId, customization } = req.body;
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const targetKey = buildItemKey({
      pizzaId,
      customization: normalizeCustomization(customization),
    });

    cart.items = cart.items.filter((item) => buildItemKey(item) !== targetKey);
    await cart.save();

    return res.json({ message: "Removed from cart", cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ message: "Server error removing from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ message: "Server error clearing cart" });
  }
};
