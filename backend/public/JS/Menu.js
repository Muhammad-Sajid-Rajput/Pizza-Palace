import { formatPrice } from '/utils/format.js';

async function fetchPizzasFromBackend() {
  try {
    const response = await fetch('/api/pizzas');
    const data = await response.json();
    if (response.ok) {
      return data.pizzas || [];
    } else {
      alert(data.message || 'Failed to load menu');
      return [];
    }
  } catch (err) {
    alert('Error fetching menu: ' + err.message);
    return [];
  }
}

async function renderPizzaMenu() {
  const pizzas = await fetchPizzasFromBackend();
  let pizzaHTML = '';

  pizzas.forEach((pizza) => {
    pizzaHTML += `
      <div class="pizza-card">
        <img src="images/${pizza.imageName || 'default'}.png" alt="${pizza.name}" class="pizza-image">
        <h2>${pizza.name}</h2>
        <h4>${formatPrice(pizza.priceCents)}</h4>

        <div class="added-msg"></div>
        <button class="add-to-cart js-add-to-cart" data-pizza-id="${pizza._id}">Add to Cart</button>
        <button class="customize-pizza js-customize-pizza" data-pizza-id="${pizza._id}">Customize</button>

        <div class="customize-container js-customize-container-${pizza._id}" style="display: none;"></div>
      </div>
    `;
  });

  document.querySelector('.js-pizza-list').innerHTML = pizzaHTML;

  // Handle Add to Cart
  document.querySelectorAll('.js-add-to-cart').forEach(button => {
    button.addEventListener('click', async (e) => {
      const pizzaId = e.currentTarget.dataset.pizzaId;
      const pizza = pizzas.find(p => p._id === pizzaId);
      const form = document.querySelector(`.js-customize-container-${pizzaId}`);

      const defaultCustomization = {
        base: 'Thin',
        sauce: 'Tomato',
        cheese: 'Mozzarella',
        veggies: [],
        meat: []
      };

      let customization = { ...defaultCustomization };

      if (form && form.innerHTML.trim() !== '' && form.style.display !== 'none') {
        customization.base = form.querySelector('#base')?.value || defaultCustomization.base;
        customization.sauce = form.querySelector('#sauce')?.value || defaultCustomization.sauce;
        customization.cheese = form.querySelector('#cheese')?.value || defaultCustomization.cheese;

        const selectedVeggies = [...form.querySelectorAll('input[name="veggies"]:checked')].map(cb => cb.value);
        const selectedMeats = [...form.querySelectorAll('input[name="meat"]:checked')].map(cb => cb.value);

        customization.veggies = selectedVeggies.length > 0 ? selectedVeggies : defaultCustomization.veggies;
        customization.meat = selectedMeats.length > 0 ? selectedMeats : defaultCustomization.meat;
      } 
      // Always ensure defaults are set for base, sauce, and cheese
      customization.base = customization.base || defaultCustomization.base;
      customization.sauce = customization.sauce || defaultCustomization.sauce;
      customization.cheese = customization.cheese || defaultCustomization.cheese;
      customization.veggies = customization.veggies || defaultCustomization.veggies;
      customization.meat = customization.meat || defaultCustomization.meat;

      // Send to backend cart API
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (!token) {
          alert('You must be logged in to add items to the cart.');
          window.location.href = 'Login.html';
          return;
        }
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            pizzaId: pizza._id,
            name: pizza.name,
            priceCents: pizza.priceCents,
            imageName: pizza.imageName,
            customization,
            quantity: 1
          })
        });
        const data = await res.json();
        if (res.ok) {
          // Show the message only on the correct pizza card
          let card = null;
          if (button.closest) {
            card = button.closest('.pizza-card');
          } else if (e.currentTarget && e.currentTarget.closest) {
            card = e.currentTarget.closest('.pizza-card');
          }
          if (card) {
            let msgBox = card.querySelector('.added-msg');
            msgBox.textContent = 'Added to cart!';
            msgBox.style.display = 'block';
            setTimeout(() => { msgBox.style.display = 'none'; }, 1500);
          } else {
            alert('Added to cart!');
          }
        } else {
          alert(data.message || 'Failed to add to cart');
        }
      } catch (err) {
        alert('Error adding to cart: ' + err.message);
      }
    });
  });

  // Handle Customize Toggle
  document.querySelectorAll('.js-customize-pizza').forEach(button => {
    button.addEventListener('click', (e) => {
      const pizzaId = e.currentTarget.dataset.pizzaId;
      const container = document.querySelector(`.js-customize-container-${pizzaId}`);

      if (container.innerHTML.trim() === '') {
        container.innerHTML = generateCustomizationForm();
      }

      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });
  });
}

// Form builder
function generateCustomizationForm() {
  return `
    <form>
      <div>
        <label>Base:</label>
        <select id="base">
          <option>Thin</option>
          <option>Thick</option>
          <option>Cheese Burst</option>
        </select>
      </div>

      <div>
        <label>Sauce:</label>
        <select id="sauce">
          <option>Tomato</option>
          <option>Barbecue</option>
          <option>Pesto</option>
        </select>
      </div>

      <div>
        <label>Cheese:</label>
        <select id="cheese">
          <option>Mozzarella</option>
          <option>Cheddar</option>
        </select>
      </div>

      <div>
        <label>Veggies:</label>
        <div class="option-row">
          <label><input type="checkbox" name="veggies" value="Onion"> Onion</label>
          <label><input type="checkbox" name="veggies" value="Mushroom"> Mushroom</label>
        </div>
      </div>

      <div>
        <label>Meat:</label>
        <div class="option-row">
          <label><input type="checkbox" name="meat" value="Chicken"> Chicken</label>
          <label><input type="checkbox" name="meat" value="Pepperoni"> Pepperoni</label>
        </div>
      </div>
    </form>
  `;
}

renderPizzaMenu();
