import { useCallback, useEffect, useState } from 'react';
import type { Order, OrderPizzaItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';

const STEPS = ['Received', 'In Kitchen', 'Out for Delivery', 'Delivered'] as const;

interface Ingredient {
  name: string;
  quantity: number;
  threshold: number;
  type: string;
  _id: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editable, setEditable] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAdminToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchInventory = useCallback(async () => {
    const token = getAdminToken();
    try {
      setInventoryLoading(true);
      const response = await fetch(`${API_BASE}/admin/ingredients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load inventory');
        return;
      }

      setInventory(data.ingredients || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Inventory error: ${message}`);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const updateInventoryItem = async (id: string, quantity: number) => {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE}/admin/ingredients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update inventory');
    }
  };

  const fetchOrders = useCallback(async () => {
    const token = getAdminToken();
    try {
      setOrdersLoading(true);
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load orders');
        return;
      }

      setOrders(data.orders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Order error: ${message}`);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(
    async (id: string, status: string) => {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Failed to update order status');
        return;
      }

      await fetchOrders();
    },
    [fetchOrders]
  );

  const handleSaveInventory = async () => {
    try {
      for (const item of inventory) {
        await updateInventoryItem(item._id, item.quantity);
      }
      alert('Inventory updated successfully');
      setEditable(false);
      await fetchInventory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(message);
    }
  };

  const getNextStatus = (current: string) => {
    const index = STEPS.indexOf(current as (typeof STEPS)[number]);
    return index >= 0 && index < STEPS.length - 1 ? STEPS[index + 1] : null;
  };

  const handleInventoryChange = (id: string, value: string) => {
    setInventory((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity: parseInt(value, 10) || 0 } : item))
    );
  };

  useEffect(() => {
    void fetchInventory();
    void fetchOrders();

    const interval = setInterval(() => {
      void fetchInventory();
      void fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchInventory, fetchOrders]);

  const groupedOrders = orders.filter((order) => order.status !== 'Delivered');

  const groupCartItems = (items: OrderPizzaItem[]) => {
    if (!Array.isArray(items)) return [];

    const grouped: Record<string, OrderPizzaItem & { quantity: number }> = {};

    items.forEach((pizza) => {
      const content = pizza.items || {};
      const key = `${pizza.pizzaId}-${content.base?.name}-${content.sauce?.name}-${content.cheese?.name}-${(
        content.veggies || []
      )
        .map((value) => value.name)
        .join('-')}-${(content.meat || []).map((value) => value.name).join('-')}`;

      if (!grouped[key]) {
        grouped[key] = { ...pizza, quantity: pizza.quantity || 1 };
      } else {
        grouped[key].quantity += pizza.quantity || 1;
      }
    });

    return Object.values(grouped);
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <header className="bg-neutral-900 text-white sticky top-0 z-50 shadow-2xl shadow-neutral-900/20">
        <div className="max-width-container h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <span className="text-xl font-display font-black tracking-tight">
              Admin<span className="text-primary-500">Center</span>
            </span>
          </div>
          <button
            onClick={handleLogOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500 hover:border-red-500 transition-all duration-300 font-bold text-xs uppercase tracking-widest"
            title="Logout"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-width-container py-12 md:py-20 space-y-20">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Inventory Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-4xl font-headline font-extrabold text-neutral-900 tracking-tight">Inventory Control</h2>
              <p className="text-neutral-500 font-medium">Manage stock levels for all pizza ingredients</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditable(true)}
                className={`btn-secondary px-8 ${editable ? 'hidden' : ''}`}
              >
                Edit Inventory
              </button>
              {editable && (
                <>
                  <button
                    type="button"
                    onClick={() => setEditable(false)}
                    className="btn-ghost px-8"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="inventoryForm"
                    className="btn-primary px-8"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-200/40 overflow-hidden">
            {inventoryLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-neutral-400 font-bold animate-pulse">Loading inventory...</p>
              </div>
            ) : (
              <form
                id="inventoryForm"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSaveInventory();
                }}
                className="p-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inventory.map((item) => (
                    <div key={item._id} className={`p-6 rounded-3xl border-2 transition-all duration-300 ${editable ? 'border-primary-100 bg-primary-50/30' : 'border-neutral-50 bg-neutral-50/50'}`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="badge badge-primary">{item.type}</span>
                          {item.quantity <= item.threshold && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Low Stock" />
                          )}
                        </div>
                        <h3 className="font-bold text-neutral-900 truncate">{item.name}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Current Stock</p>
                            <input
                              type="number"
                              min="0"
                              value={item.quantity}
                              disabled={!editable}
                              onChange={(event) => handleInventoryChange(item._id, event.target.value)}
                              className={`w-full bg-white rounded-xl px-4 py-2 font-black text-lg transition-all ${editable ? 'ring-2 ring-primary-500 border-transparent text-primary-600' : 'border-neutral-100 text-neutral-900'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Order Section */}
        <section className="space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-4xl font-headline font-extrabold text-neutral-900 tracking-tight">Live Orders</h2>
            <p className="text-neutral-500 font-medium">Real-time order processing and status tracking</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {ordersLoading ? (
              <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center gap-4 border border-neutral-100">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <p className="text-neutral-400 font-bold animate-pulse">Fetching live orders...</p>
              </div>
            ) : groupedOrders.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border border-neutral-100 border-dashed">
                <div className="text-6xl mb-6">📭</div>
                <h3 className="text-2xl font-display font-black text-neutral-900 mb-2">Kitchen is Empty</h3>
                <p className="text-neutral-500 font-medium">No active orders to display at the moment.</p>
              </div>
            ) : (
              groupedOrders.map((order) => {
                const items = groupCartItems(order.pizzas);
                return (
                  <div key={order._id} className="bg-white rounded-[40px] border border-neutral-100 shadow-xl shadow-neutral-200/40 overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="flex flex-col lg:flex-row">
                      {/* Order Info Sidebar */}
                      <div className="lg:w-80 bg-neutral-900 text-white p-8 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10 space-y-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Order ID</p>
                            <h4 className="font-display font-black text-xl">#{order._id.slice(-8).toUpperCase()}</h4>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Customer</p>
                            <p className="font-bold text-sm">{order.user?.name || 'Guest User'}</p>
                            <p className="text-neutral-500 text-xs truncate">{order.user?.email}</p>
                          </div>
                          <div className="pt-6 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Total Value</span>
                              <span className="text-xl font-display font-black text-primary-500">${(order.totalCents / 100).toFixed(2)}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              {order.status}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items & Actions */}
                      <div className="flex-1 p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {items.map((item, index) => {
                            const content = item.items || {};
                            return (
                              <div key={`${order._id}-${index}`} className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-100 flex gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🍕</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-black text-neutral-900 truncate">{item.name}</h5>
                                    <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-black rounded-lg">x{item.quantity}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[
                                      content.base?.name,
                                      content.sauce?.name,
                                      content.cheese?.name,
                                      ...(content.veggies || []).map((v) => v.name),
                                      ...(content.meat || []).map((m) => m.name)
                                    ].filter(Boolean).map((ing, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-500 text-[10px] font-bold rounded-md">
                                        {ing}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-neutral-50 flex items-center justify-between gap-6">
                          <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 transition-all duration-1000 shadow-lg shadow-primary-200"
                              style={{ width: order.status === 'Received' ? '25%' : order.status === 'In Kitchen' ? '50%' : order.status === 'Out for Delivery' ? '75%' : '100%' }}
                            />
                          </div>
                          <div className="flex shrink-0">
                            {getNextStatus(order.status) ? (
                              <button
                                onClick={() => void updateOrderStatus(order._id, getNextStatus(order.status)!)}
                                className="btn-primary px-8 py-4 h-auto text-xs uppercase tracking-[0.2em]"
                              >
                                Advance to {getNextStatus(order.status)}
                              </button>
                            ) : (
                              <span className="badge badge-success py-4 px-8 text-xs">Order Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
