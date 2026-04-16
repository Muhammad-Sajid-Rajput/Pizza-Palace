// Removed unused imports from local data files

// Helper to get admin token
function getAdminToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Fetch inventory from backend
async function fetchInventory() {
  const token = getAdminToken();
  const res = await fetch('/api/admin/ingredients', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  return data.ingredients || [];
}

// Update inventory item in backend
async function updateInventoryItemBackend(id, update) {
  const token = getAdminToken();
  await fetch(`/api/admin/ingredients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(update)
  });
}

// Fetch all orders from backend
async function fetchAllOrders() {
  const token = getAdminToken();
  const res = await fetch('/api/admin/orders', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  return data.orders || [];
}

// Update order status in backend
async function updateOrderStatusBackend(id, status) {
  const token = getAdminToken();
  await fetch(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ status })
  });
}

// Render Inventory Section
async function renderInventory() {
  const container = document.querySelector('.js-inventory-list');
  const inventory = await fetchInventory();
  container.innerHTML = '';
  inventory.forEach(item => {
    const section = document.createElement('div');
    section.className = 'inventory-item';
    section.innerHTML = `
      <label>
        ${item.name}
        <input type="number" min="0" value="${item.stock}" data-id="${item._id}" disabled>
      </label>
    `;
    container.appendChild(section);
  });
}

// Enable editing and saving inventory changes
function setupInventoryForm() {
  const form = document.getElementById('inventoryForm');
  const editBtn = document.querySelector('.edit-btn');
  editBtn.addEventListener('click', () => {
    form.querySelectorAll('input').forEach(input => input.removeAttribute('disabled'));
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    for (const input of inputs) {
      const id = input.dataset.id;
      const newStock = parseInt(input.value);
      await updateInventoryItemBackend(id, { stock: newStock });
      input.setAttribute('disabled', 'true');
    }
    alert('Inventory updated successfully!');
    renderInventory();
    setupInventoryForm();
  });
}

// Show only current (non-delivered) orders
async function renderOrders() {
  const orders = await fetchAllOrders();
  const container = document.querySelector('.js-order-list');
  container.innerHTML = '';
  const currentOrders = orders.filter(order => order.status !== 'Delivered');
  if (!currentOrders.length) {
    container.innerHTML = '<p>No current orders.</p>';
    return;
  }
  currentOrders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    const groupedItems = groupCartItems(order.items);
    const pizzaDetails = groupedItems.map(p => {
      const c = p.customization || {};
      const customText = [c.base, c.sauce, c.cheese, ...(c.veggies || []), ...(c.meat || [])]
        .filter(Boolean).join(', ') || 'None';
      return `<p>${p.name} - <strong>Qty:</strong> ${p.quantity} - <strong>Custom:</strong> ${customText}</p>`;
    }).join('');
    const nextStatus = getNextStatus(order.status);
    const buttonHTML = nextStatus
      ? `<button data-id="${order._id}" data-status="${nextStatus}">${nextStatus}</button>`
      : '';
    card.innerHTML = `
      <p><strong>Order</strong></p>
      ${pizzaDetails}
      <p class="status-label">Status: ${order.status}</p>
      <div class="status-buttons"> Next Status: ${buttonHTML}</div>
    `;
    container.appendChild(card);
  });
  // Setup status change buttons
  container.querySelectorAll('.status-buttons button').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const newStatus = btn.dataset.status;
      await updateOrderStatusBackend(id, newStatus);
      renderOrders(); // re-render after status update
    });
  });
}

// Get next step in order lifecycle
function getNextStatus(current) {
  const steps = ['Received', 'In Kitchen', 'Out for Delivery', 'Delivered'];
  const index = steps.indexOf(current);
  return index !== -1 && index < steps.length - 1 ? steps[index + 1] : null;
}

// Group identical pizzas (same customization) to show quantity
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

// Init
renderInventory();
setupInventoryForm();
renderOrders();