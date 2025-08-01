import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const FloatingWhatsAppButton = () => {
  const phoneNumber = "221775934241";
  const message = "Bonjour, je vous contacte depuis le site Teranga Foncier.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        asChild
        className="h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg pl-4 pr-6 py-2 flex items-center gap-3"
      >
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Contacter sur WhatsApp">
          <WhatsAppIcon />
          <span className="font-semibold hidden sm:inline">Discuter sur WhatsApp</span>
          <span className="font-semibold sm:hidden">WhatsApp</span>
        </a>
      </Button>
    </motion.div>
  );
};

export default FloatingWhatsAppButton;