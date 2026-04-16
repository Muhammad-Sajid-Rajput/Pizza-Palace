import { Router } from 'express';
import { protect } from '../middlewares/protectMiddleware.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  addIngredientSchema,
  addToCartSchema,
  createOrderSchema,
  forgotPasswordSchema,
  idParamSchema,
  loginSchema,
  registerSchema,
  removeFromCartSchema,
  resetPasswordSchema,
  updateIngredientSchema,
  updateOrderStatusSchema,
  verifyEmailSchema
} from '../validation/schemas.js';
import {
  register,
  login,
  loginAdmin,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../handlers/authHandler.js';
import {
  getAllIngredients,
  getAdminIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  getLowStockIngredients
} from '../handlers/ingredientHandler.js';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getOrderStats,
  cancelOrder
} from '../handlers/orderHandler.js';
import { pizzas } from '../models/pizzaData.js';
import { addToCart, getCart, removeFromCart, clearCart } from '../handlers/cartHandler.js';

export const router = Router();

router.post('/auth/register', authLimiter, validateRequest(registerSchema), register);
router.post('/auth/login', authLimiter, validateRequest(loginSchema), login);
router.post('/auth/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password/:token', authLimiter, validateRequest(resetPasswordSchema), resetPassword);
router.get('/auth/verify-email/:token', validateRequest(verifyEmailSchema), verifyEmail);

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/admin/login', authLimiter, validateRequest(loginSchema), loginAdmin);

router.get('/ingredients', getAllIngredients);
router.get('/admin/ingredients', protect(['admin']), getAdminIngredients);
router.post('/admin/ingredients', protect(['admin']), validateRequest(addIngredientSchema), addIngredient);
router.put('/admin/ingredients/:id', protect(['admin']), validateRequest(updateIngredientSchema), updateIngredient);
router.delete('/admin/ingredients/:id', protect(['admin']), validateRequest(idParamSchema), deleteIngredient);
router.get('/admin/ingredients/low-stock', protect(['admin']), getLowStockIngredients);

router.post('/orders', protect(['user', 'admin']), validateRequest(createOrderSchema), createOrder);
router.get('/orders', protect(['user', 'admin']), getUserOrders);
router.get('/orders/:id', protect(['user', 'admin']), validateRequest(idParamSchema), getOrderById);
router.delete('/orders/:id', protect(['user', 'admin']), validateRequest(idParamSchema), cancelOrder);

router.get('/admin/orders', protect(['admin']), getAllOrders);
router.put('/admin/orders/:id/status', protect(['admin']), validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.get('/admin/orders/stats', protect(['admin']), getOrderStats);

router.post('/cart', protect(['user', 'admin']), validateRequest(addToCartSchema), addToCart);
router.get('/cart', protect(['user', 'admin']), getCart);
router.delete('/cart', protect(['user', 'admin']), validateRequest(removeFromCartSchema), removeFromCart);
router.delete('/cart/clear', protect(['user', 'admin']), clearCart);

router.get('/pizzas', (req, res) => {
  res.json({ pizzas });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pizza Palace API is running!' });
});
