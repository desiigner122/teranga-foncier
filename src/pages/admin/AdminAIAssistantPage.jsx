// src/pages/admin/AdminAIAssistantPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const suggestedPrompts = [
    "Rédige un article de blog sur les 5 avantages d'investir dans le foncier à Dakar en 2025.",
    "Crée une description attrayante pour une parcelle de 300m² située à Saly, idéale pour une villa.",
    "Génère 3 exemples de réponses à un client qui demande si le prix d'un terrain est négociable.",
    "Écris un court paragraphe pour la section 'À Propos' de notre site web, mettant en avant la sécurité et la transparence."
];

const AdminAIAssistantPage = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateContent = async (currentPrompt) => {
    if (!currentPrompt.trim()) return;
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast({ 
        variant: 'destructive', 
        title: 'Configuration manquante', 
        description: 'La clé API Gemini n\'est pas configurée. Ajoutez VITE_GEMINI_API_KEY à votre fichier .env' 
      });
      return;
    }
    
    setLoading(true);
    setGeneratedContent('');
    try {
      const payload = { contents: [{ role: "user", parts: [{ text: currentPrompt }] }] };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Réponse API invalide ou vide');
      }
      
      const text = result.candidates[0].content.parts[0].text;
      setGeneratedContent(text);
      
      toast({ 
        title: 'Contenu généré avec succès!', 
        description: 'Le contenu a été généré et est prêt à être utilisé.' 
      });
    } catch (err) {
      // Log error for debugging in development only
      if (import.meta.env.DEV) {
        console.error('AI generation error:', err);
      }
      toast({ 
        variant: 'destructive', 
        title: 'Erreur de génération', 
        description: err.message || 'Une erreur inattendue s\'est produite lors de la génération du contenu.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({ title: 'Copié !' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 md:p-6 lg:p-8"
    >
      <h1 className="text-3xl font-bold flex items-center">
        <Sparkles className="mr-3 h-8 w-8 text-purple-600"/>
        Assistant IA
      </h1>
      <p className="text-muted-foreground">Générez du contenu, des réponses et des idées pour accélérer votre travail.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Générer du Contenu</CardTitle>
                    <CardDescription>Décrivez ce que vous souhaitez que l'IA génère.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        id="prompt"
                        placeholder="Ex: Rédige un article de blog..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={8}
                    />
                    <Button onClick={() => handleGenerateContent(prompt)} disabled={loading} className="w-full">
                        {loading ? <LoadingSpinner size="small" className="mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                        {loading ? 'Génération...' : 'Générer'}
                    </Button>
                </CardContent>
            </Card>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                    <CardDescription>Cliquez pour utiliser un de ces prompts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {suggestedPrompts.map((s_prompt, index) => (
                        <Button key={index} variant="outline" className="w-full text-left justify-start" onClick={() => { setPrompt(s_prompt); handleGenerateContent(s_prompt); }}>
                            {s_prompt}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Résultat</CardTitle>
            {generatedContent && (
                <Button variant="outline" size="sm" onClick={handleCopyContent}>
                    <Copy className="mr-2 h-4 w-4" /> Copier
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm min-h-[300px]">
              {loading ? <div className="flex justify-center items-center h-full"><LoadingSpinner/></div> : generatedContent || "Le contenu généré par l'IA apparaîtra ici."}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminAIAssistantPage;
