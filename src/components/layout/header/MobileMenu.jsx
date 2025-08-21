import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { Banknote, Building, TrendingUp, Leaf, Landmark, Scale, Handshake, Users, FileSignature, Sprout, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell } from "../../components/ui/table";

const solutions = [
  { title: 'Banques & Finances', href: '/solutions/banques', description: 'évaluez les garanties et analysez les risques fonciers.', icon: Banknote },
  { title: 'Promoteurs', href: '/solutions/promoteurs', description: 'Identifiez des opportunités et suivez vos projets de construction.', icon: Building },
  { title: 'Investisseurs', href: '/solutions/investisseurs', description: 'Suivez votre portefeuille et détectez les meilleures opportunités.', icon: TrendingUp },
  { title: 'Agriculteurs', href: '/solutions/agriculteurs', description: 'Gérez vos parcelles, suivez la météo et analysez vos sols.', icon: Leaf },
];

const ecosysteme = [
  { title: 'Mairies', href: '/dashboard', description: 'Gérez le cadastre, les permis et les demandes citoyennes.', icon: Landmark },
  { title: 'Notaires', href: '/dashboard', description: 'Authentifiez les actes et consultez les archives en toute sécurité.', icon: Scale },
  { title: 'Agents Immobiliers', href: '/agent', description: 'Gérez vos clients et mandats.', icon: Handshake },
  { title: 'Particuliers', href: '/dashboard', description: 'Listez votre bien et suivez vos demandes.', icon: Users },
  { title: 'Sécurisation Fonciére', href: '/how-it-works', description: 'Prévenez les litiges gréce é des titres clairs.', icon: FileSignature },
  { title: 'Développement Agricole', href: '/solutions/agriculteurs', description: 'Accédez é des données clés pour vos rendements.', icon: Sprout },
]

const MobileMenu = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const mobileNavLinkClass = (isActive) =>
    `block px-4 py-3 rounded-md text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground'}`;
  
  const CollapsibleMobileMenu = ({ title, items }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    
    return (
      <Collapsible open={isSubMenuOpen} onOpenChange={setIsSubMenuOpen}>
        <CollapsibleTrigger className="w-full">
          <div className={cn(mobileNavLinkClass(false), "flex justify-between items-center")}>
            <span>{title}</span>
            {isSubMenuOpen ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 border-l-2 ml-4 border-primary/50">
          {items.map(item => (
             <NavLink key={item.href} to={item.href} className={({isActive}) => mobileNavLinkClass(isActive)} onClick={onClose}>
               <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-primary"/>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
               </div>
            </NavLink>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-t shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="container mx-auto px-4 space-y-2 py-4">
        <NavLink to="/" className={({isActive}) => mobileNavLinkClass(isActive)} onClick={onClose} end>Accueil</NavLink>
        <NavLink to="/parcelles" className={({isActive}) => mobileNavLinkClass(isActive)} onClick={onClose}>Terrains</NavLink>
        
        <CollapsibleMobileMenu title="Solutions" items={solutions} />
        <CollapsibleMobileMenu title="écosystéme" items={ecosysteme} />

        <NavLink to="/how-it-works" className={({isActive}) => mobileNavLinkClass(isActive)} onClick={onClose}>Fonctionnement</NavLink>
        <NavLink to="/contact" className={({isActive}) => mobileNavLinkClass(isActive)} onClick={onClose}>Contact</NavLink>

        <div className="border-t pt-4 mt-4 space-y-3">
          {!user ? (
            <Button variant="outline" className="w-full" size="sm" asChild onClick={onClose}>
              <Link to="/login">Connexion</Link>
            </Button>
          ) : (
             <Button size="sm" className="w-full" asChild variant="default" onClick={onClose}>
                <Link to="/dashboard">Mon Tableau de Bord</Link>
              </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
