import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare } from 'lucide-react';
import AIHelpModal from '@/components/layout/AIHelpModal';

const FloatingAIButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5, type: 'spring', stiffness: 150 }}
      >
        <Button
          size="lg"
          className="rounded-full p-4 shadow-2xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          onClick={() => setIsModalOpen(true)}
          aria-label="Ouvrir l'assistant IA"
        >
          <Sparkles className="h-6 w-6 mr-2" />
          Assistance IA
        </Button>
      </motion.div>
      <AIHelpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FloatingAIButton;