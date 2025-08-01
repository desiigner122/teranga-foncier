import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ParcelRequestForm = ({ parcelId, requestType, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (event) => {
     const files = Array.from(event.target.files);
     if (files.length > 3) {
         toast({ title: "Attention", description: "Vous ne pouvez joindre que 3 fichiers maximum.", variant: "destructive" });
         setAttachments([]);
         event.target.value = null; // Reset file input
     } else {
         setAttachments(files);
     }
  };

  const handleSubmit = (e) => {
     e.preventDefault();
     onSubmit({
        parcelId,
        requestType,
        message,
        attachments: attachments.map(f => f.name) // Pass file names for now
     });
     // Reset form state locally if needed, parent component handles closing
     setMessage('');
     setAttachments([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande {requestType === 'info' ? "d'Information" : "d'Achat"} pour {parcelId}</CardTitle>
        <CardDescription>Remplissez le formulaire ci-dessous. Un agent vous contactera.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Votre Message (optionnel)</Label>
            <Textarea
              id="message"
              placeholder={`Posez vos questions ou précisez votre intérêt pour ${requestType === 'info' ? 'cette parcelle' : 'l\'achat'}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          {requestType === 'buy' && (
            <div>
              <Label htmlFor="attachments">Joindre des documents (Ex: CNI, Plan de financement - Max 3 fichiers)</Label>
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {attachments.length > 0 && (
                <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                  {attachments.map((file, index) => <li key={index}>{file.name}</li>)}
                </ul>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4"/> Envoyer la Demande
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParcelRequestForm;