import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const HeaderLogo = ({ isScrolled, onClick }) => {
  const useDarkText = isScrolled;

  return (
    <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={onClick}>
      <ShieldCheck className={cn("h-7 w-7 transition-colors duration-300", useDarkText ? 'text-primary' : 'text-primary')} />
      <span className={cn("text-xl font-bold transition-colors duration-300", useDarkText ? 'text-foreground' : 'text-foreground')}>Teranga Foncier</span>
    </Link>
  );
};

export default HeaderLogo;