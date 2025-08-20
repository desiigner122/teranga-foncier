import React, { forwardRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Building, Landmark, Leaf, Banknote, TrendingUp, HeartHandshake as Handshake, Scale, Users, FileSignature, AlertTriangle, Sprout, Map, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const solutions = [
  { title: 'Banques & Finances', href: '/solutions/banques', description: 'Évaluez les garanties et analysez les risques fonciers.', icon: Banknote },
  { title: 'Promoteurs', href: '/solutions/promoteurs', description: 'Identifiez des opportunités et suivez vos projets de construction.', icon: Building },
  { title: 'Investisseurs', href: '/solutions/investisseurs', description: 'Suivez votre portefeuille et détectez les meilleures opportunités.', icon: TrendingUp },
  { title: 'Agriculteurs', href: '/solutions/agriculteurs', description: 'Gérez vos parcelles, suivez la météo et analysez vos sols.', icon: Leaf },
];

const ecosystem = [
  { title: 'Mairies', href: '/dashboard', description: 'Gérez le cadastre et les permis de votre commune.', icon: Landmark },
  { title: 'Notaires', href: '/dashboard', description: 'Authentifiez les actes et consultez les archives.', icon: Scale },
  { title: 'Agents Immobiliers', href: '/agent', description: 'Gérez vos clients, mandats et visites.', icon: Handshake },
  { title: 'Particuliers', href: '/dashboard', description: 'Listez votre bien et suivez vos demandes d\'achat.', icon: Users },
];

const resources = [
  { title: 'Comment ça Marche ?', href: '/how-it-works', description: 'Notre processus de vérification et d\'achat, étape par étape.', icon: FileSignature },
  { title: 'À Propos de Nous', href: '/about', description: 'Découvrez notre mission, notre vision et l\'équipe derrière Teranga Foncier.', icon: LifeBuoy },
  { title: 'Lutte Contre la Fraude', href: '/#anti-fraude', description: 'Comment nous vous protégeons des arnaques foncières.', icon: AlertTriangle },
]

const DesktopNavigation = ({ isScrolled }) => {
  const useDarkText = isScrolled;

  const navLinkClass = ({ isActive }) =>
    cn(
      navigationMenuTriggerStyle(),
      'bg-transparent text-sm font-medium',
      isActive
        ? 'text-primary'
        : useDarkText ? 'text-muted-foreground hover:text-foreground' : 'text-foreground hover:text-foreground',
      'hover:bg-accent/50'
    );
    
  const triggerClass = cn(
    navigationMenuTriggerStyle(),
    'bg-transparent text-sm font-medium data-[state=open]:bg-accent/50',
    useDarkText ? 'text-muted-foreground hover:text-foreground' : 'text-foreground hover:text-foreground',
    'hover:bg-accent/50'
  );


  return (
    <div className="hidden md:flex items-center gap-1">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavLink to="/" className={navLinkClass} end>Accueil</NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button asChild variant="ghost" className={cn(navLinkClass({isActive: window.location.pathname.startsWith('/parcelles')}), "font-bold")}>
                <Link to="/parcelles">Terrains</Link>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Button asChild variant="ghost" className={cn(navLinkClass({isActive: window.location.pathname === '/map'}), "font-bold")}>
                <Link to="/map">Carte</Link>
            </Button>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass}>Solutions</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {solutions.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href} icon={component.icon}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

           <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass}>Écosystème</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {ecosystem.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href} icon={component.icon}>
                        {component.description}
                    </ListItem>
                    ))}
                </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className={triggerClass}>Ressources</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {resources.map((component) => (
                    <ListItem key={component.title} title={component.title} href={component.href} icon={component.icon}>
                        {component.description}
                    </ListItem>
                    ))}
                </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

const ListItem = forwardRef(({ className, title, children, icon: Icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            {Icon && <div className="p-1.5 bg-primary/10 text-primary rounded-md"><Icon className="h-5 w-5" /></div>}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground ml-10">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default DesktopNavigation;
