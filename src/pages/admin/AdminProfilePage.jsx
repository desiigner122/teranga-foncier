import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const AdminProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    let finalAvatarUrl = avatarUrl;
    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('public_files').upload(filePath, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicURLData } = supabase.storage.from('public_files').getPublicUrl(filePath);
        finalAvatarUrl = publicURLData.publicUrl;
        setAvatarUrl(finalAvatarUrl);
      }
      // Update profile in DB
      const { error: updateError } = await supabase.from('profiles').update({ full_name: fullName, avatar_url: finalAvatarUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      setSuccess('Profil mis à jour avec succès.');
      if (refreshProfile) await refreshProfile();
      if (typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Profil Administrateur</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mon Profil Administrateur</CardTitle>
          <CardDescription>Modifier vos informations personnelles et votre photo de profil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
            {success && <div className="text-green-600 font-semibold">{success}</div>}
            {error && <div className="text-red-600 font-semibold">{error}</div>}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group">
                <img src={avatarUrl || `/avatar.svg`} alt="Avatar" className="h-20 w-20 rounded-full object-cover border shadow" />
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer shadow-lg group-hover:scale-110 transition-transform" title="Changer la photo">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground mt-1">Formats acceptés : JPG, PNG, SVG. Taille max : 2 Mo.</span>
                {imageFile && <span className="block text-xs text-green-600 mt-1">Image sélectionnée : {imageFile.name}</span>}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Nom complet</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2 bg-gray-100" value={email} disabled />
            </div>
            <div>
              <label className="block font-medium mb-1">Rôle</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" value={profile?.role || 'admin'} disabled />
            </div>
            <div>
              <label className="block font-medium mb-1">Dernière connexion</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-100" value={profile?.last_login || '---'} disabled />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Mise à jour...' : 'Enregistrer les modifications'}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sécurité du Compte</CardTitle>
          <CardDescription>Modifier le mot de passe administrateur.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>Changer le mot de passe (à implémenter)</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Logs de Connexion</CardTitle>
          <CardDescription>Historique des connexions admin (à venir).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>Voir les logs (à implémenter)</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
