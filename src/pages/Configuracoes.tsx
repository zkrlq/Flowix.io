import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Save, LogOut, Loader2 } from 'lucide-react';

export default function Configuracoes() {
  const { profile, updateProfile } = useProfile();
  const { signOut, user } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    phone: '',
    working_hours_start: '08:00',
    working_hours_end: '18:00',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || '',
        phone: profile.phone || '',
        working_hours_start: profile.working_hours_start || '08:00',
        working_hours_end: profile.working_hours_end || '18:00',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <Layout title="Configurações">
      <div className="space-y-6 animate-fade-in max-w-lg">
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Dados do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Negócio</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Ex: Barbearia do João"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Abre às</Label>
                  <Input
                    type="time"
                    value={formData.working_hours_start}
                    onChange={(e) => setFormData({ ...formData, working_hours_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha às</Label>
                  <Input
                    type="time"
                    value={formData.working_hours_end}
                    onChange={(e) => setFormData({ ...formData, working_hours_end: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Salvar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button variant="destructive" onClick={signOut} className="w-full">
              <LogOut className="h-5 w-5" />
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
