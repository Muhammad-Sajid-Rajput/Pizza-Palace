const loginToggle = document.getElementById("loginToggle");
const registerToggle = document.getElementById("registerToggle");
const adminToggle = document.getElementById("adminToggle");
const userTabs = document.getElementById("userTabs");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const adminLoginForm = document.getElementById("adminLoginForm");

let isAdmin = false;
const API_BASE = "http://localhost:3001/api";

function showUserMode() {
  isAdmin = false;
  userTabs.style.display = "flex";
  adminLoginForm.classList.remove("active");

  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  loginToggle.classList.add("active");
  registerToggle.classList.remove("active");

  adminToggle.innerText = "Admin Login";
}

function showAdminMode() {
  isAdmin = true;
  userTabs.style.display = "none";
  loginForm.classList.remove("active");
  registerForm.classList.remove("active");
  adminLoginForm.classList.add("active");

  adminToggle.innerText = "User Login";
}

adminToggle.addEventListener("click", () => {
  if (isAdmin) {
    showUserMode();
  } else {
    showAdminMode();
  }
});

// User form tab switching
loginToggle.addEventListener("click", () => {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");

  loginToggle.classList.add("active");
  registerToggle.classList.remove("active");
});

registerToggle.addEventListener("click", () => {
  registerForm.classList.add("active");
  loginForm.classList.remove("active");

  registerToggle.classList.add("active");
  loginToggle.classList.remove("active");
});

// User Register
registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    let data = {};
    try {
      data = await response.json();
    } catch (jsonErr) {
      // If response is not JSON, keep data as empty object
    }
    if (response.ok) {
      alert("Registration successful! Please verify your email.");
      registerForm.reset();
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    alert("Registration error: " + err.message);
  }
});

// User Login
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const remember = document.getElementById("rememberMe").checked;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      // Save token for authenticated requests
      if (remember) {
        localStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("token", data.token);
      }
      alert(`Welcome back, ${data.user.name}!`);
      window.location.href = "UserDashboard.html";
    } else {
      alert(data.message || "Invalid credentials");
    }
  } catch (err) {
    alert("Login error: " + err.message);
  }
});

// Admin Login
adminLoginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  const adminEmail = "admin@pizza.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    alert("Welcome Admin!");
    window.location.href = "AdminDashboard.html";
  } else {
    alert("Invalid admin credentials.");
  }
});

// Forgot Password
const forgotLink = document.querySelector('.forgot');
if (forgotLink) {
  forgotLink.addEventListener('click', async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    if (!email) {
      alert('Please enter your email in the email field first.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Password reset email sent. Please check your inbox.');
      } else {
        alert(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
}