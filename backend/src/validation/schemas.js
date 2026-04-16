import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const tokenRegex = /^[a-fA-F0-9]{16,256}$/;

const ingredientName = z
  .string()
  .trim()
  .min(1, 'Ingredient name is required')
  .max(50, 'Ingredient name is too long')
  .regex(/^[a-zA-Z0-9\s-]+$/, 'Ingredient name contains invalid characters');

const ingredientType = z.enum(['base', 'sauce', 'cheese', 'veggie', 'meat']);

const quantitySchema = z.number().int().min(0).max(5000);
const thresholdSchema = z.number().int().min(0).max(5000);

const customizationSchema = z
  .object({
    base: ingredientName,
    sauce: ingredientName,
    cheese: ingredientName,
    veggies: z.array(ingredientName).max(10).optional().default([]),
    meat: z.array(ingredientName).max(10).optional().default([])
  })
  .strict();

const itemSchema = z
  .object({
    pizzaId: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(80),
    priceCents: z.number().int().min(1).max(100000),
    imageName: z.string().trim().min(1).max(120).optional(),
    customization: customizationSchema,
    quantity: z.number().int().min(1).max(20).default(1)
  })
  .strict();

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
      password: z.string().min(8).max(128)
    })
    .strict()
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
      password: z.string().min(1).max(128)
    })
    .strict()
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email().max(254).transform((value) => value.toLowerCase())
    })
    .strict()
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().trim().regex(tokenRegex, 'Invalid reset token')
  }),
  body: z
    .object({
      password: z.string().min(8).max(128)
    })
    .strict()
});

export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().trim().regex(tokenRegex, 'Invalid verification token')
  })
});

export const addIngredientSchema = z.object({
  body: z
    .object({
      name: ingredientName,
      type: ingredientType,
      quantity: quantitySchema.optional(),
      threshold: thresholdSchema.optional()
    })
    .strict()
});

export const updateIngredientSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid ingredient id')
  }),
  body: z
    .object({
      name: ingredientName.optional(),
      quantity: quantitySchema.optional(),
      threshold: thresholdSchema.optional()
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required')
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid id')
  })
});

export const createOrderSchema = z.object({
  body: z
    .object({
      items: z.array(itemSchema).min(1).max(20),
      totalCents: z.number().int().min(1).max(2000000)
    })
    .strict()
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid order id')
  }),
  body: z
    .object({
      status: z.enum(['Received', 'In Kitchen', 'Out for Delivery', 'Delivered'])
    })
    .strict()
});

export const removeFromCartSchema = z.object({
  body: z
    .object({
      pizzaId: z.string().trim().min(1).max(64),
      customization: customizationSchema
    })
    .strict()
});

export const addToCartSchema = z.object({
  body: itemSchema
});
