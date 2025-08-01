import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Fatou B.",
    location: "Diaspora (France)",
    quote: "Grâce à Teranga Foncier, j'ai pu acheter mon terrain à Diamniadio en toute confiance depuis Paris. Le processus de vérification m'a vraiment rassurée. Service impeccable !",
    rating: 5,
    avatarDesc: "Avatar Fatou B.",
    avatarTextDesc: "Portrait d'une femme africaine professionnelle"
  },
  {
    name: "Moussa D.",
    location: "Dakar",
    quote: "J'étais sceptique au début, mais leur équipe a été très professionnelle. Ils ont vérifié tous les documents et m'ont accompagné chez le notaire. Je recommande vivement.",
    rating: 5,
    avatarDesc: "Avatar Moussa D.",
    avatarTextDesc: "Portrait d'un homme sénégalais souriant"
  },
  {
    name: "Aïcha S.",
    location: "Diaspora (Canada)",
    quote: "Enfin une plateforme sérieuse pour investir au pays ! La carte interactive et les détails sur chaque parcelle sont très utiles. J'ai trouvé le terrain parfait pour ma future maison.",
    rating: 4,
    avatarDesc: "Avatar Aïcha S.",
    avatarTextDesc: "Portrait d'une jeune femme africaine"
  },
  {
    name: "Omar F.",
    location: "Promoteur Immobilier",
    quote: "Teranga Foncier a révolutionné la façon dont nous acquérons des terrains. La transparence et la rapidité des vérifications sont un atout majeur pour nos projets.",
    rating: 5,
    avatarDesc: "Avatar Omar F.",
    avatarTextDesc: "Portrait d'un homme d'affaires africain"
  },
  {
    name: "Sophie N.",
    location: "Investisseur",
    quote: "J'ai investi dans plusieurs parcelles via Teranga Foncier. Leur expertise juridique et leur connaissance du marché m'ont permis de faire des choix éclairés et sécurisés.",
    rating: 5,
    avatarDesc: "Avatar Sophie N.",
    avatarTextDesc: "Portrait d'une femme d'affaires européenne"
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-gradient-to-r from-primary/5 to-green-500/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Ce que nos clients disent</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des témoignages authentiques de ceux qui ont sécurisé leur investissement foncier avec Teranga Foncier.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-primary/50">
                      <CardContent className="flex-grow p-6">
                        <Quote className="h-8 w-8 text-primary/60 mb-4" />
                        <p className="text-sm text-foreground leading-relaxed mb-6 flex-grow italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center mt-auto">
                          <Avatar className="h-10 w-10 mr-3">
                            {/* Placeholder image to avoid CORS issues */}
                            <img  className="w-full h-full object-cover rounded-full" alt={testimonial.avatarDesc} src="https://placehold.co/40x40/E0E0E0/333333?text=AV" />
                            <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                          </div>
                          <div className="ml-auto flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-15px] top-1/2 -translate-y-1/2 hidden sm:inline-flex" />
            <CarouselNext className="absolute right-[-15px] top-1/2 -translate-y-1/2 hidden sm:inline-flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
