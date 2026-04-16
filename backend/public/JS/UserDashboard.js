import { formatPrice } from '../utils/format.js';

// Helper to get user token
function getUserToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Fetch user orders from backend
async function fetchUserOrders() {
  const token = getUserToken();
  const res = await fetch('/api/orders', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  return data.orders || [];
}

// Cancel latest order (optional, if backend supports it)
async function cancelLatestOrderBackend(orderId) {
  const token = getUserToken();
  await fetch(`/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
}

// Render current (non-delivered) order
async function renderCurrentOrder() {
  const container = document.querySelector('.js-current-order');
  const orders = (await fetchUserOrders()).filter(order => order.status !== 'Delivered');
  if (!container || !orders.length) {
    if (container) {
      container.innerHTML = `<p>No current orders.</p>`;
    }
    return;
  }
  const latestOrder = orders[orders.length - 1];
  const items = groupCartItems(latestOrder.items);
  const currentStatus = latestOrder.status;
  const totalPriceCents = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) + 20000;
  container.innerHTML = items.map(item => {
    const c = item.customization || {};
    return `
      <div class="order-card">
        <p><strong>Pizza:</strong> ${item.name}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Customization:</strong> 
          ${[c.base, c.sauce, c.cheese, ...(c.veggies || []), ...(c.meat || [])].filter(Boolean).join(', ') || 'None'}
        </p>
      </div>
    `;
  }).join('') + `
    <div class="total-amount-row">
      <span><strong>Total:</strong> ${formatPrice(totalPriceCents)}</span>
      <button class="cancel-order-btn">Cancel Order</button>
    </div>
    ${renderStatusSteps(currentStatus)}
  `;
  document.querySelector('.cancel-order-btn').addEventListener('click', async () => {
    await cancelLatestOrderBackend(latestOrder._id);
    renderCurrentOrder();
    renderPreviousOrders();
  });
}

// Render status steps
function renderStatusSteps(status) {
  const steps = ['Received', 'In Kitchen', 'Out for Delivery'];
  return `
    <div class="order-status">
      ${steps.map(step => `
        <div class="status-step ${step === status ? 'active' : ''}">${step}</div>
      `).join('')}
    </div>
  `;
}

// Render previous (delivered) orders
async function renderPreviousOrders() {
  const orders = (await fetchUserOrders()).filter(order => order.status === 'Delivered');
  const prevSection = document.querySelector('.previous-orders');
  if (!prevSection || !orders.length) return;
  const lastThree = orders.slice(-3).reverse();
  const html = lastThree.map(order => {
    const items = groupCartItems(order.items);
    const totalPriceCents = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0) + 20000;
    const pizzasHTML = items.map(item => {
      const c = item.customization || {};
      return `
        <p><strong>Pizza:</strong> ${item.name}</p>
        <p><strong>Quantity:</strong> ${item.quantity}</p>
        <p><strong>Customization:</strong> 
          ${[c.base, c.sauce, c.cheese, ...(c.veggies || []), ...(c.meat || [])].filter(Boolean).join(', ') || 'None'}
        </p>
      `;
    }).join('');
    return `
      <div class="order-card">
        ${pizzasHTML}
        <p><strong>Total:</strong> ${formatPrice(totalPriceCents)}</p>
        <p><strong>Status:</strong> Delivered</p>
      </div>
    `;
  }).join('');
  prevSection.innerHTML = `<h2>Previous Orders</h2>` + html;
}

function groupCartItems(items) {
  const grouped = {};
  items.forEach(pizza => {
    const key = getPizzaKey(pizza);
    if (!grouped[key]) {
      grouped[key] = { ...pizza, quantity: 1 };
    } else {
      grouped[key].quantity += 1;
    }
  });
  return Object.values(grouped);
}

function getPizzaKey(pizza) {
  const c = pizza.customization || {};
  return `${pizza.id}-${c.base}-${c.sauce}-${c.cheese}-${(c.veggies || []).join('-')}-${(c.meat || []).join('-')}`;
}

renderCurrentOrder();
renderPreviousOrders();