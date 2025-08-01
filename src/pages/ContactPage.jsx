import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, Send, Building, HelpCircle, Loader2, Linkedin } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabaseClient';

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            subject: formData.subject, 
            message: formData.message 
          }
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Message Envoyé !",
        description: "Merci de nous avoir contactés. Votre message a été enregistré et nous reviendrons vers vous bientôt.",
        className: "bg-green-500 text-white",
      });
      e.target.reset();
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Une erreur est survenue. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>Contact - Participez à la Transformation Digitale du Sénégal</title>
        <meta name="description" content="Contactez Teranga Foncier pour collaborer sur des projets liés à la transformation numérique du Sénégal. Nous sommes ouverts aux partenariats alignés avec l'agenda C50." />
        <meta property="og:title" content="Contactez Teranga Foncier - Transformation Numérique" />
        <meta property="og:description" content="Notre équipe est disponible pour discuter de la transformation digitale du secteur foncier sénégalais." />
        <link rel="canonical" href="https://www.terangafoncier.com/contact" />
      </Helmet>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="container mx-auto py-24 px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
          <Send className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Contactez-Nous</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Une question sur notre rôle dans la transformation numérique ? Notre équipe est là pour vous accompagner.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3"
          >
            <Card className="shadow-xl border-border/50 bg-card hover:shadow-primary/10 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Envoyez-nous un message direct</CardTitle>
                <CardDescription>Remplissez le formulaire ci-dessous. Votre message sera enregistré en toute sécurité.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="font-medium">Nom complet</Label>
                      <Input id="name" name="name" placeholder="Votre nom et prénom" required className="h-11" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-medium">Adresse Email</Label>
                      <Input id="email" type="email" name="email" placeholder="votre.email@exemple.com" required className="h-11" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="font-medium">Sujet de votre message</Label>
                    <Input id="subject" name="subject" placeholder="Ex: Partenariat transformation digitale" required className="h-11" value={formData.subject} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="font-medium">Votre Message</Label>
                    <Textarea id="message" name="message" placeholder="Écrivez votre message détaillé ici..." rows={6} required value={formData.message} onChange={handleInputChange} />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {loading ? 'Envoi en cours...' : 'Envoyer le Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="shadow-lg border-border/50 bg-card hover:shadow-accent_brand/10 transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Building className="mr-2 h-5 w-5 text-accent_brand"/>Nos Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-accent_brand flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Adresse</h4>
                    <p className="text-muted-foreground text-sm">Dakar, Sénégal</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-1 text-accent_brand flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Téléphone</h4>
                    <p className="text-muted-foreground text-sm">+221 77 593 42 41</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-1 text-accent_brand flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-muted-foreground text-sm hover:text-primary transition-colors"><a href="mailto:palaye122@gmail.com">palaye122@gmail.com</a></p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 mt-1 text-accent_brand flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Horaires de disponibilité</h4>
                    <p className="text-muted-foreground text-sm">Lundi - Dimanche : 24h/24</p>
                  </div>
                </div>
                 <div className="flex items-start">
                  <Linkedin className="h-5 w-5 mr-3 mt-1 text-accent_brand flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">LinkedIn</h4>
                    <a href="https://www.linkedin.com/in/abdoulaye-di%C3%A9m%C3%A9-58136a1b1/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                      Profil d'Abdoulaye Diémé
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-border/50 bg-card hover:shadow-accent_brand/10 transition-shadow duration-300">
               <CardHeader>
                  <CardTitle className="text-xl flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-accent_brand"/>FAQ Rapide</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-sm text-muted-foreground">
                      Consultez notre <a href="/faq" className="text-primary hover:underline">page FAQ</a> pour des réponses aux questions courantes.
                  </p>
                  <div className="aspect-[16/10] bg-muted rounded-lg mt-4 flex items-center justify-center text-muted-foreground overflow-hidden">
                     <img  className="w-full h-full object-cover" alt="Illustration conceptuelle épurée d'une bulle de dialogue avec un point d'interrogation, sur fond clair." src="https://images.unsplash.com/photo-1662394030934-dbebdb69cf6c" />
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ContactPage;