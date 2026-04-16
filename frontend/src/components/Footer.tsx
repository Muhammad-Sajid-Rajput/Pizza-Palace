import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-100 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-width-container py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">🍕</span>
              </div>
              <span className="text-2xl font-display font-black tracking-tight">
                Pizza<span className="text-primary-500">Palace</span>
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs font-medium">
              We're on a mission to deliver the world's most delicious, handcrafted pizzas right to your door. Fresh, fast, and always flavorful.
            </p>
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 group"
                  title={social}
                >
                  <span className="sr-only">{social}</span>
                  {social === 'Facebook' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.38-4.669 1.24 0 2.535.221 2.535.221v2.788h-1.428c-1.49 0-1.85.925-1.85 1.874v2.25h3.14l-.502 3.47h-2.638v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social === 'Twitter' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.95 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  )}
                  {social === 'Instagram' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.355 2.618 6.778 6.98 6.978 1.28.058 1.688.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.058-1.28.072-1.688.072-4.948 0-3.259-.014-3.668-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.01 4.01 0 110-8.019 4.01 4.01 0 010 8.019zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Quick Links</h4>
            <ul className="space-y-4">
              {['Menu', 'Orders', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link 
                    to={link === 'Menu' ? '/' : link === 'Orders' ? '/orders' : '#'} 
                    className="text-neutral-400 hover:text-white transition-colors duration-300 font-bold text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600 scale-0 group-hover:scale-100 transition-transform duration-300" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Support</h4>
            <ul className="space-y-4">
              <li>
                <a href="mailto:hello@pizzapalace.com" className="text-neutral-400 hover:text-white transition-colors duration-300 font-bold text-sm block">
                  hello@pizzapalace.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="text-neutral-400 hover:text-white transition-colors duration-300 font-bold text-sm block">
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-300 font-bold text-sm block">
                  Help Center & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter (UI Only) */}
          <div className="space-y-8">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Join the Club</h4>
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 font-bold leading-relaxed uppercase tracking-wider">
                Get 20% off your first order!
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary-600 transition-colors flex-1"
                />
                <button className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-all duration-300 active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              &copy; {currentYear} Pizza Palace. Built with passion.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] font-black text-neutral-500 hover:text-neutral-300 uppercase tracking-widest transition-colors">Privacy</a>
              <a href="#" className="text-[10px] font-black text-neutral-500 hover:text-neutral-300 uppercase tracking-widest transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="flex items-center gap-6 grayscale opacity-30">
            <div className="text-xl font-display font-black tracking-tighter">VISA</div>
            <div className="text-xl font-display font-black tracking-tighter">MASTER</div>
            <div className="text-xl font-display font-black tracking-tighter">PAYPAL</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
