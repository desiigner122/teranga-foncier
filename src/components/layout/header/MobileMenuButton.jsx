import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileMenuButton = ({ isMenuOpen, isScrolled, onClick }) => {
  const useDarkIcon = isScrolled;

  return (
    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick}>
      {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className={cn("h-6 w-6", useDarkIcon ? 'text-foreground' : 'text-foreground')} />}
    </Button>
  );
};

export default MobileMenuButton;