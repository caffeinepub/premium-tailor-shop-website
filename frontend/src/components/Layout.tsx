import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { SiFacebook, SiInstagram, SiX } from 'react-icons/si';

export default function Layout() {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Alterations', path: '/alterations' },
    { label: 'Appointments', path: '/appointments' },
  ];

  if (isAuthenticated) {
    navLinks.push({ label: 'Dashboard', path: '/dashboard' });
  }

  if (isAdmin) {
    navLinks.push({ label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img src="/assets/generated/tailor-logo-transparent.dim_200x200.png" alt="Logo" className="h-10 w-10" />
                <span className="text-xl font-serif font-semibold">Atelier Elegance</span>
              </button>

              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate({ to: link.path })}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      currentPath === link.path ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'}>
                {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>

              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate({ to: link.path });
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-accent ${
                    currentPath === link.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-muted/30 border-t mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/generated/tailor-logo-transparent.dim_200x200.png" alt="Logo" className="h-8 w-8" />
                <span className="font-serif font-semibold">Atelier Elegance</span>
              </div>
              <p className="text-sm text-muted-foreground">Premium tailoring services with exceptional craftsmanship.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate({ to: '/products' })} className="hover:text-primary transition-colors">
                    Custom Tailoring
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ to: '/alterations' })} className="hover:text-primary transition-colors">
                    Alterations
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate({ to: '/appointments' })} className="hover:text-primary transition-colors">
                    Home Visits
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: info@atelierelegance.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Hours: Mon-Sat 9AM-6PM</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025. Built with love using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
