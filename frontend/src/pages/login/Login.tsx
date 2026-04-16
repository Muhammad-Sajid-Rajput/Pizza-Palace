import { useState, type FormEvent, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../config';

type FormType = 'login' | 'register' | 'admin';

export default function Login() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>('login');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [adminData, setAdminData] = useState({ email: '', password: '' });

  const toggleAdmin = () => {
    setIsAdmin((prev) => !prev);
    setActiveForm(isAdmin ? 'login' : 'admin');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  function handleUserFormSwitch(form: SetStateAction<FormType>) {
    setActiveForm(form);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginData.email || !loginData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login with:', { email: loginData.email });

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      });

      const data = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (!response.ok) {
        const errorMsg = data.message || data.error || 'Login failed. Please check your credentials.';
        setErrorMessage(errorMsg);
        return;
      }

      if (!data.token) {
        setErrorMessage('No token received from server');
        return;
      }

      const storage = loginData.remember ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      console.log('Token stored successfully');

      setSuccessMessage(`Welcome back, ${data.user?.name || 'User'}!`);

      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      const error = err as Error;
      console.error('Login error:', error);
      setErrorMessage(`Login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!registerData.name || !registerData.email || !registerData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (registerData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting registration with:', { name: registerData.name, email: registerData.email });

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();

      console.log('Register response status:', response.status);
      console.log('Register response data:', data);

      if (!response.ok) {
        const errorMsg = data.message || 'Registration failed. Please try again.';
        setErrorMessage(errorMsg);
        return;
      }

      setSuccessMessage(data.message || 'Registration successful! Please login.');
      setRegisterData({ name: '', email: '', password: '' });
      setTimeout(() => {
        handleUserFormSwitch('login');
      }, 1500);
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminData.email || !adminData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting admin login with:', { email: adminData.email });

      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminData.email, password: adminData.password }),
      });
      const data = await response.json();

      console.log('Admin login response status:', response.status);
      console.log('Admin login response data:', data);

      if (!response.ok) {
        const errorMsg = data.message || 'Admin login failed. Please check your credentials.';
        setErrorMessage(errorMsg);
        return;
      }

      if (!data.token) {
        setErrorMessage('No token received from server');
        return;
      }

      const storage = localStorage;
      storage.setItem('token', data.token);
      console.log('Admin token stored successfully');

      setSuccessMessage('Admin login successful');
      setTimeout(() => {
        console.log('Redirecting to admin dashboard...');
        window.location.href = '/admin';
      }, 1500);
    } catch (err) {
      const error = err as Error;
      console.error('Admin login error:', error);
      setErrorMessage(`Admin login error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-body">
      {/* TopAppBar */}
      <header className="bg-[#f7f6f3]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex justify-center items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold text-[#b90035] tracking-tight">Pizza Palace</Link>
          </div>

        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          {/* Branding/Image Side (Desktop Only) */}
          <div className="hidden lg:block relative min-h-[600px] bg-primary">
            <img
              alt="Artisan Pizza"
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNzzggUm5yhb0Ag-K4Wr9Pwi1rP75h8z6ZWnwDilL-Q7r6OKCjc2KHUsRcrqFAMs66JyA8MgYDkdrucd-4WQSbopwzs8OqXmWVaxgjeSObMrRw8d440tI7zE7uZKpEqp0P6GJ-vSeGKHp9uYrZZYLBwZtnPW39ruZVnHL64fj3bPemcM9Mt4zLvnvAU3UoqvZ5eRHG7Upbir2FHulyApgj5MSzSSUk_rt8qF2OEEayA-a0UxY-G0y42xF8968LtQdQ0A9lsTGMu2Q"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60"></div>
            <div className="absolute bottom-12 left-12 right-12 text-white">
              <h2 className="text-4xl font-extrabold font-headline leading-tight mb-4">Taste the Craft of Authenticity.</h2>
              <p className="text-on-primary opacity-90 text-lg">Every slice is a journey through traditional Italian flavors, curated for the modern palate.</p>
            </div>
          </div>

          {/* Auth Form Side */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-surface-container-lowest">
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-2">
                {activeForm === 'login' ? 'Welcome Back' : activeForm === 'register' ? 'Join the Palace' : 'Admin Access'}
              </h1>
              <p className="text-secondary text-sm">
                {activeForm === 'login'
                  ? 'Please enter your details to continue your culinary journey.'
                  : activeForm === 'register'
                    ? 'Create an account to start ordering your favorite pizzas.'
                    : 'Restricted access for Pizza Palace administrators.'}
              </p>
            </div>

            {/* Error/Success Feedback */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-error-container/10 border border-error-container text-error text-sm font-bold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-500 text-green-700 text-sm font-bold rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {successMessage}
              </div>
            )}

            {/* Forms */}
            {activeForm === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="email"
                      type="email"
                      placeholder="hungry@explorer.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  </div>
                </div>
                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="password">Password</label>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  </div>
                </div>
                {/* Remember Me */}
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded text-primary focus:ring-primary"
                    checked={loginData.remember}
                    onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                  />
                  <label htmlFor="remember" className="text-xs text-secondary font-medium cursor-pointer">Remember me</label>
                </div>
                {/* Login Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login to Palace'}
                  </button>
                </div>
              </form>
            )}

            {activeForm === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  </div>
                </div>
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="reg-email">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="reg-email"
                      type="email"
                      placeholder="hungry@explorer.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  </div>
                </div>
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="reg-password">Password</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  </div>
                </div>
                {/* Register Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Join the Palace'}
                  </button>
                </div>
              </form>
            )}

            {activeForm === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="admin-email">Admin Email</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="admin-email"
                      type="email"
                      placeholder="admin@pizzapalace.com"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">shield</span>
                  </div>
                </div>
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1" htmlFor="admin-password">Admin Password</label>
                  <div className="relative">
                    <input
                      className="w-full px-5 py-4 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary focus:bg-surface-bright transition-all text-on-surface placeholder:text-outline-variant"
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminData.password}
                      onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">lock</span>
                  </div>
                </div>
                {/* Admin Button */}
                <div className="pt-4">
                  <button
                    className="w-full bg-gradient-to-r from-secondary to-secondary-dim text-white font-headline font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-secondary/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Admin Login'}
                  </button>
                </div>
              </form>
            )}


            {/* Footer Text */}
            <div className="mt-10 text-center space-y-4">
              <p className="text-secondary text-sm">
                {activeForm === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => handleUserFormSwitch('register')} className="text-primary font-bold hover:underline">Sign Up</button>
                  </>
                ) : activeForm === 'register' ? (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => handleUserFormSwitch('login')} className="text-primary font-bold hover:underline">Login</button>
                  </>
                ) : (
                  <button onClick={() => { setIsAdmin(false); handleUserFormSwitch('login'); }} className="text-primary font-bold hover:underline">Back to User Login</button>
                )}
              </p>

              {!isAdmin && activeForm !== 'admin' && (
                <button
                  onClick={toggleAdmin}
                  className="text-[10px] font-bold uppercase tracking-widest text-outline-variant hover:text-primary transition-colors"
                >
                  Admin Access
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-8 text-center">
        <p className="text-xs font-medium text-outline-variant uppercase tracking-[0.2em]">© 2024 Pizza Palace Culinary Group</p>
      </footer>
    </div>
  );
}
