import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Teranga Foncier",
      links: [
        { label: "À Propos de Nous", path: "/about" },
        { label: "Comment Ça Marche ?", path: "/how-it-works" },
        { label: "Notre Blog", path: "/blog" },
        { label: "Devenir Partenaire", path: "/partners" },
        { label: "Tarifs & Frais", path: "/pricing" },
      ]
    },
    {
      title: "Nos Solutions",
      links: [
        { label: "Pour les Banques", path: "/solutions/banques" },
        { label: "Pour les Promoteurs", path: "/solutions/promoteurs" },
        { label: "Pour les Investisseurs", path: "/solutions/investisseurs" },
        { label: "Pour les Agriculteurs", path: "/solutions/agriculteurs" },
      ]
    },
    {
      title: "Ressources",
      links: [
        { label: "Contactez-Nous", path: "/contact" },
        { label: "FAQ", path: "/faq" },
        { label: "Glossaire du Foncier", path: "/glossary" },
        { label: "Guide Fiscal", path: "/tax-guide" },
      ]
    },
    {
      title: "Légal",
      links: [
        { label: "Mentions Légales", path: "/legal" },
        { label: "Politique de Confidentialité", path: "/privacy" },
        { label: "Politique de Cookies", path: "/cookie-policy" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Linkedin, path: "https://www.linkedin.com/in/abdoulaye-di%C3%A9m%C3%A9-58136a1b1/", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-700">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold text-primary">Teranga Foncier</span>
                <p className="text-xs text-slate-400">Par Abdoulaye Diémé</p>
              </Link>
            </div>
            <p className="text-sm">Votre partenaire de confiance pour un investissement foncier sécurisé au Sénégal.</p>
            <div className="space-y-2 text-sm">
              <a href="https://www.google.com/maps/search/?api=1&query=Dakar,+Sénégal" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> Dakar, Sénégal
              </a>
              <div className="flex items-center hover:text-primary transition-colors">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <div>
                  <a href="tel:+221775934241" className="block">+221 77 593 42 41</a>
                </div>
              </div>
              <div className="flex items-center hover:text-primary transition-colors">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <div>
                  <a href="mailto:contact@terangafoncier.com" className="block">contact@terangafoncier.com</a>
                  <a href="mailto:palaye122@gmail.com" className="block text-xs">palaye122@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <p className="font-semibold text-slate-100 mb-4">{section.title}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-slate-400 mb-4 md:mb-0">
            &copy; {currentYear} Teranga Foncier. Tous droits réservés. Conçu par Abdoulaye Diémé.
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.path}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-slate-400 hover:text-primary transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
