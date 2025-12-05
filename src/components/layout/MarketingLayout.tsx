import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
interface MarketingLayoutProps {
  children: React.ReactNode;
}
export function MarketingLayout({ children }: MarketingLayoutProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { name: 'The Problem', href: '#problem' },
    { name: 'The Solution', href: '#solution' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Success Stories', href: '#stories' },
  ];
  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-lg tracking-tight text-white">28 DAY</span>
                <span className="font-display font-extrabold text-orange-500 tracking-wide text-sm">RESET</span>
              </div>
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-200 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Button 
                onClick={() => navigate('/register')}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-semibold"
              >
                Join Challenge
              </Button>
            </nav>
            {/* Mobile Nav */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-navy-800">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-navy-900 border-navy-800 text-white">
                  <div className="flex flex-col gap-6 mt-8">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className="text-lg font-medium text-slate-200 hover:text-orange-500 transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                    <Button 
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/register');
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-full py-6 text-lg"
                    >
                      Join Challenge
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-12 border-t border-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-6 w-6 text-orange-500" />
                <span className="font-display font-bold text-xl text-white">28 Day Reset</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                The science-backed metabolic health challenge designed to help you reverse your metabolic age and reclaim your vitality.
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Medical Disclaimer</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Coach Login</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-navy-900 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Reset Project. Built with ❤️ at Cloudflare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}