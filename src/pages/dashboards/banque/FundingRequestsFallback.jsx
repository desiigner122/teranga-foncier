import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../contexts/AuthContext";

const FundingRequestsFallback = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Demandes de Financement (fallback)</h1>
    <p className="text-sm text-gray-600">Fallback component used while resolving OneDrive file lock issues.</p>
  </div>
);

export default FundingRequestsFallback;
