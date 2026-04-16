import { useCallback, useEffect, useState } from 'react';
import PizzaCard from '../../components/PizzaCard';
import Modal from '../../components/Modal';
import CustomizeForm from '../../components/CustomizeForm';
import {
  PizzaCardSkeletonGrid,
  ErrorMessage,
  LoadingSpinner,
} from '../../components/Loading';
import { API_BASE } from '../../config';
import type { CartCustomization, Pizza } from '../../types';

export default function Menu() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [selectedPizzaId, setSelectedPizzaId] = useState<string | null>(null);
  const [customData, setCustomData] = useState<Record<string, CartCustomization>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPizzas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/pizzas`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load menu');
        return;
      }

      setPizzas(Array.isArray(data.pizzas) ? data.pizzas : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching menu: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPizzas();
  }, [fetchPizzas]);

  const addToCart = async (pizza: Pizza) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const customization = customData[pizza._id] || {
      base: 'Thin Crust',
      sauce: 'Tomato Sauce',
      cheese: 'Mozzarella',
      veggies: [],
      meat: [],
    };

    try {
      setAddingId(pizza._id);
      const response = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pizzaId: pizza._id,
          name: pizza.name,
          priceCents: pizza.priceCents,
          imageName: pizza.imageName,
          customization,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to add to cart');
        return;
      }

      setSuccessMessage(`${pizza.name} added to cart!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedPizzaId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error adding to cart: ${message}`);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Hero Section - Simplified */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Menu</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Fresh, handcrafted pizzas made with premium ingredients
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">


        {/* Menu Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Our Signature Menu</h2>
          <p className="text-neutral-500 mt-1">Handcrafted pizzas with fresh, premium ingredients</p>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
            <div className="bg-neutral-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
              <p className="font-bold">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <PizzaCardSkeletonGrid count={6} />}

        {/* Pizza Grid */}
        {!loading && pizzas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pizzas.map((pizza) => (
              <PizzaCard
                key={pizza._id}
                pizza={pizza}
                onAddToCart={addToCart}
                onCustomize={setSelectedPizzaId}
                isAdding={addingId === pizza._id}
                showCustomize={true}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && pizzas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Pizzas Found</h3>
            <p className="text-neutral-500 mb-6">
              We're currently updating our kitchen. Please check back soon!
            </p>
            <button
              onClick={fetchPizzas}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Refresh Menu
            </button>
          </div>
        )}
      </main>

      {/* Customize Modal */}
      <Modal
        isOpen={selectedPizzaId !== null}
        onClose={() => setSelectedPizzaId(null)}
        title="Customize Your Pizza"
        size="lg"
      >
        {selectedPizzaId && (
          <div className="space-y-6">
            <CustomizeForm
              pizzaId={selectedPizzaId}
              onChange={(id, data) => setCustomData((prev) => ({ ...prev, [id]: data }))}
            />

            <div className="flex gap-4 pt-6 border-t border-neutral-100 mt-6">
              <button
                onClick={() => {
                  const pizza = pizzas.find((p) => p._id === selectedPizzaId);
                  if (pizza) {
                    addToCart(pizza);
                  }
                }}
                disabled={addingId === selectedPizzaId}
                className="btn-primary flex-[2] py-3 text-base shadow-lg shadow-primary-200"
              >
                {addingId === selectedPizzaId ? (
                  <div className="flex items-center justify-center gap-4">
                    <LoadingSpinner size="sm" />
                    Adding...
                  </div>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                onClick={() => setSelectedPizzaId(null)}
                className="btn-ghost flex-1 py-3 text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
