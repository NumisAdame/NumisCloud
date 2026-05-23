'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Shield, Trash2, Save, AlertTriangle, Globe, BookOpen, Eye, Camera, Loader2, Instagram, ExternalLink, Crown, Sparkles, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function ProfileContent() {
  const { data: session, update } = useSession() || {};
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [profileVisibility, setProfileVisibility] = useState('CONTACTS');
  const [instagramUser, setInstagramUser] = useState('');
  const [twitterUser, setTwitterUser] = useState('');
  const [youtubeUser, setYoutubeUser] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data?.user ?? null);
          setName(data?.user?.name ?? '');
          setCountry(data?.user?.country ?? '');
          setBio(data?.user?.bio ?? '');
          setSpecialty(data?.user?.specialty ?? '');
          setProfileVisibility(data?.user?.profileVisibility ?? 'CONTACTS');
          setInstagramUser(data?.user?.instagram ?? '');
          setTwitterUser(data?.user?.twitter ?? '');
          setYoutubeUser(data?.user?.youtube ?? '');
          setWebsiteUrl(data?.user?.website ?? '');
          setAvatarUrl(data?.user?.image ?? null);
        }
      } catch (err: any) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5 MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      // 1. Get presigned URL (public so avatar is accessible everywhere)
      const presignedRes = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: `avatar-${file.name}`, contentType: file.type, isPublic: true }),
      });
      if (!presignedRes.ok) throw new Error('Error al preparar subida');
      const { uploadUrl, cloud_storage_path } = await presignedRes.json();

      // 2. Upload file to S3
      const headers: Record<string, string> = { 'Content-Type': file.type };
      // Check if Content-Disposition is in the signed headers
      if (uploadUrl.includes('content-disposition')) {
        headers['Content-Disposition'] = 'attachment';
      }
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers });
      if (!uploadRes.ok) throw new Error('Error al subir imagen');

      // 3. Get public URL for the uploaded file
      const urlRes = await fetch('/api/upload/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloud_storage_path, isPublic: true }),
      });
      let publicUrl = '';
      if (urlRes.ok) {
        const urlData = await urlRes.json();
        publicUrl = urlData.url;
      } else {
        // Fallback: construct URL directly
        publicUrl = uploadUrl.split('?')[0];
      }

      // 4. Save to profile
      const saveRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: publicUrl }),
      });
      if (saveRes.ok) {
        setAvatarUrl(publicUrl);
        toast.success('Foto de perfil actualizada');
        await update?.({ image: publicUrl });
      } else {
        throw new Error('Error al guardar foto');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      toast.error(err?.message ?? 'Error al subir la foto');
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, bio, specialty, profileVisibility, instagram: instagramUser, twitter: twitterUser, youtube: youtubeUser, website: websiteUrl }),
      });
      if (res.ok) {
        toast.success('Perfil actualizado');
        await update?.({ name });
      } else {
        toast.error('Error al actualizar');
      }
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'ELIMINAR') {
      toast.error('Escribe ELIMINAR para confirmar');
      return;
    }
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Cuenta eliminada permanentemente');
        signOut?.({ callbackUrl: '/' });
      } else {
        toast.error('Error al eliminar la cuenta');
      }
    } catch (err: any) {
      console.error('Error:', err);
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'SUBSCRIBER') return 'Suscriptor';
    return 'Gratuito';
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-7 w-7 text-gold" /> Perfil y ajustes
        </h1>
        <p className="text-muted-foreground mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Avatar / Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-gold" /> Foto de perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              {avatarUrl ? (
                <div className="h-24 w-24 rounded-full overflow-hidden relative border-2 border-gold/30">
                  <Image
                    src={avatarUrl}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/30">
                  <span className="text-3xl font-bold text-gold">
                    {(name || session?.user?.name || '?')[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="space-y-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="border-gold/30 text-gold hover:bg-gold/10"
              >
                {uploadingPhoto ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Subiendo...</>
                ) : (
                  <><Camera className="h-4 w-4 mr-1" /> Cambiar foto</>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground">JPG, PNG o WebP. Máx 5 MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gold" /> Información personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={profile?.email ?? ''} disabled className="mt-1 bg-muted" />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e: any) => setName(e.target?.value ?? '')}
              placeholder="Tu nombre"
              className="mt-1"
            />
          </div>
          <div>
            <Label>País</Label>
            <Input
              value={country}
              onChange={(e: any) => setCountry(e.target?.value ?? '')}
              placeholder="Ej: España"
              className="mt-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Plan:</Label>
            <Badge variant="secondary" className={profile?.role === 'SUBSCRIBER' ? 'bg-gold/20 text-gold border-gold/30' : profile?.role === 'ADMIN' ? 'bg-secondary/20 text-secondary' : ''}>
              {profile?.role === 'SUBSCRIBER' && <Crown className="h-3 w-3 mr-1" />}
              {roleLabel(profile?.role ?? 'FREE')}
            </Badge>
            {profile?.role === 'FREE' && (() => {
              const trialEnd = profile?.trialEndsAt ? new Date(profile.trialEndsAt) : null;
              const trialActive = trialEnd && trialEnd > new Date();
              const daysLeft = trialActive ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
              return trialActive ? (
                <Badge variant="outline" className="border-gold/40 text-gold text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {daysLeft === 1 ? '1 día de prueba IA' : `${daysLeft} días de prueba IA`}
                </Badge>
              ) : null;
            })()}
            <Link href="/suscripcion">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-gold hover:text-gold-dark">
                <CreditCard className="h-3 w-3 mr-1" />
                {profile?.role === 'SUBSCRIBER' ? 'Gestionar' : 'Mejorar plan'}
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Label>Miembro desde:</Label>
            <span className="text-sm text-muted-foreground">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
              }) : ''}
            </span>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Social Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gold" /> Perfil social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Especialidad numismática</Label>
            <Input
              value={specialty}
              onChange={(e: any) => setSpecialty(e.target?.value ?? '')}
              placeholder="Ej: Moneda romana imperial, Euros conmemorativos..."
              className="mt-1"
            />
          </div>
          <div>
            <Label>Biografía</Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti y tu pasión por la numismática..."
              className="mt-1 w-full min-h-[100px] bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-gold/40 focus:outline-none resize-y"
              maxLength={500}
            />
            <p className="text-[11px] text-muted-foreground mt-1">{bio.length}/500 caracteres</p>
          </div>
          {/* Social media links */}
          <div className="border-t border-border pt-4 mt-2">
            <Label className="text-sm font-semibold mb-3 block">Redes sociales</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </Label>
                <Input
                  value={instagramUser}
                  onChange={(e: any) => setInstagramUser(e.target?.value ?? '')}
                  placeholder="@tu_usuario"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </Label>
                <Input
                  value={twitterUser}
                  onChange={(e: any) => setTwitterUser(e.target?.value ?? '')}
                  placeholder="@tu_usuario"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </Label>
                <Input
                  value={youtubeUser}
                  onChange={(e: any) => setYoutubeUser(e.target?.value ?? '')}
                  placeholder="@canal o URL"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Sitio web
                </Label>
                <Input
                  value={websiteUrl}
                  onChange={(e: any) => setWebsiteUrl(e.target?.value ?? '')}
                  placeholder="https://tusitio.com"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-1"><Eye className="h-4 w-4" /> Visibilidad del perfil</Label>
            <select
              value={profileVisibility}
              onChange={(e) => setProfileVisibility(e.target.value)}
              className="mt-1 w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:border-gold/40 focus:outline-none"
            >
              <option value="PUBLIC">Público — Cualquiera puede ver tu perfil</option>
              <option value="CONTACTS">Contactos — Solo tus contactos ven tus datos</option>
              <option value="PRIVATE">Privado — Nadie puede ver tu perfil</option>
            </select>
          </div>
          {profile?.id && (
            <Link href={`/usuario/${profile.id}`} className="text-sm text-gold hover:text-gold-dark inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> Ver mi perfil público
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-gold hover:bg-gold-dark text-graphite font-semibold">
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" /> Zona peligrosa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Eliminar tu cuenta borrará permanentemente todos tus datos, piezas, imágenes y
            configuración. Esta acción es irreversible (RGPD).
          </p>
          {!showDelete ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar mi cuenta
            </Button>
          ) : (
            <div className="space-y-3 bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-semibold text-destructive">Confirmar eliminación</span>
              </div>
              <p className="text-sm">Escribe <strong>ELIMINAR</strong> para confirmar:</p>
              <Input
                value={deleteConfirm}
                onChange={(e: any) => setDeleteConfirm(e.target?.value ?? '')}
                placeholder="ELIMINAR"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>
                  Cancelar
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  Eliminar permanentemente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
