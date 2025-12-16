import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "absolute top-4 right-4" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className={`${className} hover:scale-110 hover:rotate-12 transition-all duration-200 active:scale-90 z-50`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-gold-400" />
      ) : (
        <Moon className="h-5 w-5 text-navy-600" />
      )}
    </Button>
  );
}
