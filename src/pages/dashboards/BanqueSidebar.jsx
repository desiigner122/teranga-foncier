import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Banknote, FileText, Users, ShieldCheck, BarChart3, Settings, Menu, FolderCheck, DollarSign, FileCheck, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const BANQUE_NAV_ITEMS = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard/banque",
    description: "Vue d'ensemble banque"
  },
  {
    title: "Garanties",
    icon: ShieldCheck,
    href: "/dashboard/banque/guarantees",
    description: "Garanties bancaires"
  },
  {
    title: "Financements",
    icon: DollarSign,
    href: "/dashboard/banque/financements",
    description: "Demandes de financement"
  },
  {
    title: "Évaluations",
    icon: Scale,
    href: "/dashboard/banque/evaluations",
    description: "Évaluations foncières"
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/dashboard/banque/documents",
    description: "Gestion des documents"
  },
  {
    title: "Clients",
    icon: Users,
    href: "/dashboard/banque/clients",
    description: "Liste des clients"
  },
  {
    title: "Dossiers",
    icon: FolderCheck,
    href: "/dashboard/banque/dossiers",
    description: "Dossiers en cours"
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/dashboard/banque/settings",
    description: "Configuration banque"
  }
];

const BanqueSidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className={`font-bold text-lg ${isCollapsed ? 'hidden' : 'block'}`}>Banque</h2>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="p-2">
        <nav className="space-y-1">
          {BANQUE_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${location.pathname.startsWith(item.href) ? 'bg-gray-100 font-semibold' : ''}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default BanqueSidebar;
