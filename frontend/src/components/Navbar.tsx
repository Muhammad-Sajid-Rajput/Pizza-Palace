import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface NavbarProps {
  showCart?: boolean;
  showMenu?: boolean;
}

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

export default function Navbar({ showCart = true, showMenu = true }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!getToken());
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

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

  const navLinks = [
    { name: 'Home', path: '/', show: true },
    { name: 'Menu', path: '/menu', show: showMenu },
    { name: 'Orders', path: '/orders', show: isAuthenticated },
    { name: 'Cart', path: '/cart', show: isAuthenticated && showCart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 shadow-lg shadow-neutral-200/50' : 'bg-white py-5'
        }`}
    >
      <div className="max-width-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-2xl">🍕</span>
            </div>
            <span className="hidden md:block text-xl font-display font-extrabold tracking-tight text-neutral-900">
              Pizza<span className="text-primary-600">Palace</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-bold transition-all duration-300 hover:text-primary-600 ${isActive(link.path) ? 'text-primary-600' : 'text-neutral-500'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
            </div>

            <div className="flex items-center gap-4 border-l border-neutral-100 pl-8">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn-secondary py-2.5 px-6"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary py-2.5 px-6"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            {showCart && (
              <Link to="/cart" className="relative p-2 text-neutral-600">
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
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
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-neutral-100 space-y-2 animate-fade-in">
            {navLinks
              .filter((link) => link.show)
              .map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full btn-primary mt-4"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}