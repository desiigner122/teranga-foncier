import React from 'react';
import { CheckCircle, Clock, User, FileText } from 'lucide-react';

const statusMap = {
  created: { label: 'Créée', icon: FileText, color: 'text-blue-500' },
  attributed: { label: 'Attribuée', icon: User, color: 'text-green-600' },
  validated: { label: 'Validée par notaire', icon: CheckCircle, color: 'text-green-500' },
  archived: { label: 'Archivée', icon: Clock, color: 'text-gray-400' },
};

const ParcelTimeline = ({ history = [] }) => {
  console.log('[DEBUG] ParcelTimeline history:', history);
  if (!history.length) return <div className="text-muted-foreground text-sm">Aucune étape enregistrée.</div>;
  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
      {history.map((step, idx) => {
        const status = statusMap[step.status] || statusMap.created;
        const Icon = status.icon;
        return (
          <li key={idx} className="mb-6 ml-6">
            <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-white border ${status.color}`}>
              <Icon className={`h-4 w-4 ${status.color}`} />
            </span>
            <h3 className="font-semibold leading-tight">{status.label}</h3>
            <p className="text-xs text-muted-foreground">{step.date ? new Date(step.date).toLocaleString('fr-FR') : 'Date inconnue'}</p>
            {step.description && <p className="text-sm mt-1">{step.description}</p>}
          </li>
        );
      })}
    </ol>
  );
};

export default ParcelTimeline;
