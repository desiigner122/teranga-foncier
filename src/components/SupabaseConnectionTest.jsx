// Composant de test pour vérifier la connexion Supabase
import React, { useState, useEffect } from 'react';
const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [results, setResults] = useState({
    users: null,
    parcels: null,
    requests: null,
    blog_posts: null,
    auth: null
  });
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setError(null);
    
    try {      // Test des tables
      const tables = ['users', 'parcels', 'requests', 'blog_posts'];
      const newResults = {};
      
      for (const table of tables) {
        try {
          const { data, error: tableError, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5);
          
          if (tableError) {            newResults[table] = { error: tableError.message, count: 0 };
          } else {            newResults[table] = { 
              data: data || [], 
              count: count || 0,
              success: true 
            };
          }
        } catch (err) {          newResults[table] = { error: err.message, count: 0 };
        }
      }
      
      // Test d'authentification
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
          newResults.auth = { error: authError.message };
        } else {
          newResults.auth = { 
            success: true, 
            session: !!authData.session,
            user: authData.session?.user || null
          };
        }
      } catch (err) {
        newResults.auth = { error: err.message };
      }
      
      setResults(newResults);
      setConnectionStatus('success');
      
    } catch (error) {      setError(error.message);
      setConnectionStatus('error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'testing':
        return <Badge className="bg-yellow-500">Test en cours...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">✅ Connecté</Badge>;
      case 'error':
        return <Badge className="bg-red-500">❌ Erreur</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Test de Connexion Supabase
          {getStatusBadge(connectionStatus)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 font-semibold">Erreur générale:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tests des tables */}
            {Object.entries(results).filter(([key]) => key !== 'auth').map(([table, result]) => (
              <div key={table} className="p-4 border rounded">
                <h3 className="font-semibold mb-2">Table: {table}</h3>
                {result ? (
                  result.success ? (
                    <div className="text-green-700">
                      <p>✅ {result.count} enregistrements</p>
                      {result.data && result.data.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer">Voir les données</summary>
                          <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(result.data[0], null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600">❌ {result.error}</p>
                  )
                ) : (
                  <p className="text-gray-500">En attente...</p>
                )}
              </div>
            ))}
            
            {/* Test d'authentification */}
            <div className="p-4 border rounded md:col-span-2">
              <h3 className="font-semibold mb-2">Authentification Supabase</h3>
              {results.auth ? (
                results.auth.success ? (
                  <div className="text-green-700">
                    <p>✅ Service opérationnel</p>
                    <p>Session: {results.auth.session ? '🔒 Connecté' : '🔓 Déconnecté'}</p>
                    {results.auth.user && (
                      <p className="text-sm">Utilisateur: {results.auth.user.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">❌ {results.auth.error}</p>
                )
              ) : (
                <p className="text-gray-500">En attente...</p>
              )}
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
              {connectionStatus === 'testing' ? 'Test en cours...' : 'Retester la connexion'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
