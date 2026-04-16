export interface Pizza {
  _id: string;
  name: string;
  priceCents: number;
  imageName?: string;
  description?: string;
}

export interface CartCustomization {
  base: string;
  sauce: string;
  cheese: string;
  veggies: string[];
  meat: string[];
}

export interface IngredientOption {
  _id: string;
  name: string;
  type: string;
}

export interface OrderPizzaItem {
  quantity: number;
  pizzaId: string;
  name: string;
  priceCents: number;
  imageName?: string;
  customization?: {
    base: string;
    sauce: string;
    cheese: string;
    veggies: string[];
    meat: string[];
  };
  items?: {
    base?: IngredientOption;
    sauce?: IngredientOption;
    cheese?: IngredientOption;
    veggies?: IngredientOption[];
    meat?: IngredientOption[];
  };
}

export type OrderStatus = 'Received' | 'In Kitchen' | 'Out for Delivery' | 'Delivered';

export interface Order {
  totalCents: number;
  _id: string;
  status: OrderStatus;
  pizzas: OrderPizzaItem[];
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}
