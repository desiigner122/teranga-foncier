import React, { useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, UploadCloud } from 'lucide-react';

const DocumentUpload = ({ onUpload, loading }) => {
  const fileInput = useRef();
  const [selected, setSelected] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelected(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selected && onUpload) {
      onUpload(selected);
      setSelected(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Ajouter un document</CardTitle>
      </CardHeader>
      <CardContent>
        <input type="file" ref={fileInput} onChange={handleFileChange} className="mb-2" />
        <div className="flex gap-2 items-center">
          <Button onClick={handleUpload} disabled={!selected || loading}>
            <UploadCloud className="h-4 w-4 mr-1" />
            {loading ? 'Envoi...' : 'Uploader'}
          </Button>
          {selected && <span className="text-xs text-muted-foreground">{selected.name}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
