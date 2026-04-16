import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import type { Order } from '../../types';

function getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
    Received: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📋' },
    'In Kitchen': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '👨‍🍳' },
    'Out for Delivery': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🚗' },
    Delivered: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
  };

  const config = statusConfig[status] || statusConfig['Received'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {status}
    </span>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) return;

      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const cancelOrder = async (orderId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Cancel order failed:', err);
    }
  };

  useEffect(() => {
    void fetchOrders();

    const interval = setInterval(() => {
      void fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
            <p className="text-neutral-500 text-sm mt-1">Track and manage your orders</p>
          </div>
          <Link
            to="/menu"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            New Order
          </Link>
        </div>

        {/* Active Orders */}
        {orders.filter(o => o.status !== 'Delivered').length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              Active Orders
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                {orders.filter(o => o.status !== 'Delivered').length}
              </span>
            </h2>
            <div className="space-y-4">
              {orders
                .filter((order) => order.status !== 'Delivered')
                .map((order) => (
                  <div key={order._id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-neutral-500">Order #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-neutral-400 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 transition-all duration-500"
                            style={{
                              width:
                                order.status === 'Received'
                                  ? '25%'
                                  : order.status === 'In Kitchen'
                                    ? '50%'
                                    : order.status === 'Out for Delivery'
                                      ? '75%'
                                      : '100%',
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-neutral-500">
                          <span>Received</span>
                          <span>In Kitchen</span>
                          <span>Out for Delivery</span>
                          <span>Delivered</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                        <div>
                          <p className="text-sm text-neutral-600">
                            {order.pizzas.length} item{order.pizzas.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-lg font-bold text-neutral-900">
                            ${(order.totalCents / 100).toFixed(2)}
                          </p>
                        </div>
                        {order.status === 'Received' && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-50 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-neutral-50 px-6 py-4">
                      <div className="space-y-3">
                        {order.pizzas.map((pizza, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-lg">🍕</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-neutral-900">{pizza.name}</p>
                              <p className="text-xs text-neutral-500">
                                {pizza.customization?.base} • Qty: {pizza.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-neutral-900">
                              ${((pizza.priceCents * pizza.quantity) / 100).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {orders.filter(o => o.status === 'Delivered').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Completed Orders</h2>
            <div className="space-y-3">
              {orders
                .filter((order) => order.status === 'Delivered')
                .map((order) => (
                  <div key={order._id} className="bg-white rounded-xl border border-neutral-200 p-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Delivered on {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-neutral-900">
                          ${(order.totalCents / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-neutral-500">{order.pizzas.length} items</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {orders.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
            <div className="text-6xl mb-4">🍕</div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Orders Yet</h3>
            <p className="text-neutral-500 mb-6">
              Your order history will appear here once you place your first order.
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        )}

        {loading && (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
