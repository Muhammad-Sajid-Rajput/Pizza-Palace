import { formatPrice } from '../utils/format.js';

const DELIVERY_FEE_CENTS = 199; // $1.99
let cart = [];

async function fetchCartFromBackend() {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    if (!token) {
      cart = [];
      alert('You must be logged in to view your cart.');
      window.location.href = 'Login.html';
      return;
    }
    const res = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      // Normalize cart items to flatten _doc if present
      cart = (data.cart?.items || []).map(item => item._doc ? item._doc : item);
      console.log('Fetched cart from backend:', cart); // Debug log
    } else {
      cart = [];
      alert(data.message || 'Failed to fetch cart');
    }
  } catch (err) {
    cart = [];
    alert('Error fetching cart: ' + err.message);
  }
}

async function renderOrderList() {
  await fetchCartFromBackend();
  const listContainer = document.querySelector('.js-order-list');
  const items = cart; // Use backend cart directly

  if (items.length === 0) {
    listContainer.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  listContainer.innerHTML = items.map(item => {
    const itemTotalCents = item.priceCents * item.quantity;
    return `
      <div class="checkout-item">
        <img src="../images/${item.imageName}.png" alt="${item.name}" class="checkout-image">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p><strong>Quantity:</strong> ${item.quantity}</p>
          <div class="custom-info">
            <span><strong>Base:</strong> ${item.customization.base}</span>
            <span><strong>Sauce:</strong> ${item.customization.sauce}</span>
            <span><strong>Cheese:</strong> ${item.customization.cheese}</span>
            ${item.customization.veggies?.length ? `<span><strong>Veggies:</strong> ${item.customization.veggies.join(', ')}</span>` : ''}
            ${item.customization.meat?.length ? `<span><strong>Meat:</strong> ${item.customization.meat.join(', ')}</span>` : ''}
          </div>
          <div class="item-footer">
            <p class="item-total"><strong>Price :</strong> ${formatPrice(itemTotalCents)}</p>
            <button class="delete-btn" data-pizza-id="${item.pizzaId}" data-customization='${JSON.stringify(item.customization)}'>Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pizzaId = btn.dataset.pizzaId;
      const customization = JSON.parse(btn.dataset.customization);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ pizzaId, customization })
        });
        const data = await res.json();
        if (res.ok) {
          await renderOrderList();
          renderOrderSummary();
        } else {
          alert(data.message || 'Failed to remove from cart');
        }
      } catch (err) {
        alert('Error removing from cart: ' + err.message);
      }
    });
  });
}

async function renderOrderSummary() {
  await fetchCartFromBackend();
  const summaryContainer = document.querySelector('.js-order-summary');
  const items = cart; // Use backend cart directly

  let subtotalCents = 0;
  items.forEach(item => {
    subtotalCents += item.priceCents * item.quantity;
  });

  let deliveryFee = items.length === 0 ? 0 : DELIVERY_FEE_CENTS;
  let totalCents = subtotalCents + deliveryFee;

  summaryContainer.innerHTML = `
    <h2>Order Summary</h2>
    <p><strong>Items Total:</strong> ${formatPrice(subtotalCents)}</p>
    <p><strong>Delivery Charges:</strong> ${formatPrice(deliveryFee)}</p>
    <h3><strong>Total:</strong> ${formatPrice(totalCents)}</h3>
    <button class="place-order-btn" ${items.length === 0 ? 'disabled' : ''}>Place Order</button>
  `;
}

function handlePlaceOrder() {
  document.addEventListener('click', async function (e) {
    if (!e.target.classList.contains('place-order-btn')) return;

    // Always fetch the latest cart from backend before placing order
    await fetchCartFromBackend();
    const items = cart; // Use backend cart directly

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderPayload = {
      items: items.map(item => ({
        pizzaId: item._id || item.id || item.pizzaId,
        name: item.name,
        quantity: item.quantity,
        customization: item.customization,
        priceCents: item.priceCents
      })),
      totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0) + DELIVERY_FEE_CENTS
    };

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to place an order.');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await response.json();
      if (response.ok) {
        // No need to clear localStorage or cart array; backend manages cart
        alert('Order placed!');
        window.location.href = 'UserDashboard.html';
      } else {
        alert(data.message || 'Order failed');
      }
    } catch (err) {
      alert('Order error: ' + err.message);
    }
  });
}

// Initial execution
renderOrderList();
renderOrderSummary();
handlePlaceOrder();
