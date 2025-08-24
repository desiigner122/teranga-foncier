import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';

const DocumentWallet = ({ documents = [] }) => {
  if (!documents.length) {
    return <div className="text-muted-foreground text-sm">Aucun document disponible.</div>;
  }
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Portefeuille documentaire communal</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {documents.map((doc, idx) => (
            <li key={doc.id || idx} className="flex items-center justify-between py-2">
              <div>
                <span className="font-medium">{doc.name || doc.filename || `Document ${idx+1}`}</span>
                {doc.type && <span className="ml-2 text-xs text-muted-foreground">({doc.type})</span>}
              </div>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <Download className="h-4 w-4" /> Télécharger
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DocumentWallet;
