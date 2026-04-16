import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';

const DELIVERY_FEE_CENTS = 199;

interface Customization {
  base: string;
  sauce: string;
  cheese: string;
  veggies?: string[];
  meat?: string[];
}

interface IngredientOption {
  _id: string;
  name: string;
  type: string;
}

interface CartItem {
  _id?: string;
  id?: string;
  pizzaId: string;
  name: string;
  imageName: string;
  priceCents: number;
  quantity: number;
  customization: Customization;
  items?: {
    base?: IngredientOption;
    sauce?: IngredientOption;
    cheese?: IngredientOption;
    veggies?: IngredientOption[];
    meat?: IngredientOption[];
  };
}

export default function CheckOut() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const fetchCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to fetch cart');
        return;
      }

      setCart(data.cart?.items || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching cart: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const removeFromCart = async (pizzaId: string, customization: Customization) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pizzaId, customization }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to remove item');
        return;
      }

      setError(null);
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error removing item: ${message}`);
    }
  };

  const placeOrder = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    const payload = {
      items: cart.map((item) => ({
        pizzaId: item.pizzaId || item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        customization: item.customization,
        priceCents: item.priceCents,
      })),
      totalCents:
        cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0) + DELIVERY_FEE_CENTS,
    };

    try {
      setIsPlacingOrder(true);
      setError(null);

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Order response:', { status: response.status, data });
      if (!response.ok) {
        // Handle inventory errors specifically
        if (data.unavailableIngredients && data.unavailableIngredients.length > 0) {
          const ingredientsList = data.unavailableIngredients.join(', ');
          setError(`Out of stock: ${ingredientsList}. Please remove these items from your cart.`);
        } else {
          setError(data.message || 'Order failed. Please try again.');
        }
        return;
      }

      // Success - navigate to orders page
      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Order failed: ${message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const subtotal = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE_CENTS : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-background text-on-background min-h-screen pb-40 font-body">
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Editorial Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">Checkout</h1>
          <p className="text-on-surface-variant font-medium">Review your artisanal selection</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
            <span className="material-symbols-outlined text-xl">error</span>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-neutral-400 font-bold animate-pulse">Loading your cart...</p>
          </div>
        )}

        {!loading && cart.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-neutral-200">
            <div className="text-7xl mb-8 animate-float">🛒</div>
            <h3 className="text-3xl font-headline font-black mb-4">Your Cart is Empty</h3>
            <p className="text-neutral-500 mb-10 max-w-sm mx-auto">
              Looks like you haven't added any delicious pizzas to your cart yet.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary"
            >
              Start Ordering
            </button>
          </div>
        )}

        {!loading && cart.length > 0 && (
          <>
            {/* Cart Items Section */}
            <section className="space-y-6">
              {cart.map((item, index) => (
                <div key={`${item.pizzaId}-${index}`} className="bg-surface-container-lowest rounded-lg p-5 flex items-center gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-transform hover:scale-[1.01]">
                  <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-surface-container-low">
                    <img
                      className="w-full h-full object-cover"
                      src={`/${item.imageName}.png`}
                      alt={item.name}
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = '/Pepperoni.png';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-on-surface font-headline">{item.name}</h3>
                      <span className="font-bold text-primary font-headline">${(item.priceCents * item.quantity / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">{item.customization.base}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">{item.customization.sauce}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">{item.customization.cheese}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-surface-container-high rounded-full px-1 py-1">
                        <span className="px-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Qty: {item.quantity}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.pizzaId, item.customization)}
                        className="text-secondary hover:text-error transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>


            {/* Bill Breakdown Section */}
            <section className="mt-12 mb-24 bg-surface-container-low rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant font-medium">
                  <span>Delivery Fee</span>
                  <span>${(deliveryFee / 100).toFixed(2)}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Grand Total</p>
                    <p className="text-4xl font-extrabold text-on-surface font-headline">${(total / 100).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Action Sheet (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-4 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg">
              <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4">
                <div className="hidden md:block flex-grow">
                  <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Amount</p>
                  <p className="text-2xl font-extrabold text-neutral-900">${(total / 100).toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                  className="w-full md:w-auto md:min-w-[280px] bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-lg uppercase tracking-wider">Placing Order...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg uppercase tracking-wider">Place Order</span>
                      <span className="text-xl">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}