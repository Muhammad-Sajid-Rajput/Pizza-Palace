import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

interface NavLink {
  name: string;
  path: string;
  show: boolean;
  icon?: string;
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Determine nav links based on authentication
  const getNavLinks = (): NavLink[] => {
    const links: NavLink[] = [];

    if (!isAuthenticated) {
      links.push(
        { name: 'Menu', path: '/menu', show: true },
        { name: 'Login', path: '/login', show: true }
      );
    } else {
      // Authenticated users (both admin and regular) get same nav items
      links.push(
        { name: 'Dashboard', path: '/dashboard', show: true },
        { name: 'Menu', path: '/menu', show: true },
        { name: 'Cart', path: '/cart', show: true },
        { name: 'Orders', path: '/orders', show: true }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Top Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-neutral-200/30 py-3'
          : 'bg-white py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={isAuthenticated ? '/dashboard' : '/menu'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl">🍕</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                Pizza<span className="text-primary-600">Palace</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navLinks
                  .filter((link) => link.show)
                  .map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`text-sm font-semibold transition-all duration-200 relative py-2 ${isActive(link.path)
                        ? 'text-primary-600'
                        : 'text-neutral-600 hover:text-primary-600'
                        }`}
                    >
                      {link.name}
                      {isActive(link.path) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                      )}
                    </Link>
                  ))}
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3 border-l border-neutral-200 pl-6">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-md shadow-primary-200 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-neutral-200 space-y-2 animate-fade-in">
              {navLinks
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-semibold transition-colors ${isActive(link.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-white bg-primary-600 rounded-lg font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
}
