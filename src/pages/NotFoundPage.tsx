import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
export function NotFoundPage() {
  return (
    <MarketingLayout>
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-soft">
            <FileQuestion className="h-12 w-12 text-navy-900" />
          </div>
          <h1 className="text-6xl font-display font-bold text-navy-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">Page Not Found</h2>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
          <Button
            asChild
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </MarketingLayout>
  );
}