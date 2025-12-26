import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useServices, Service } from '@/hooks/useServices';
import { Plus, Clock, Trash2, Edit2 } from 'lucide-react';

export default function Servicos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: '', price: 0, duration_minutes: 30 });

  const { services, createService, updateService, deleteService } = useServices();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, ...formData });
    } else {
      await createService.mutateAsync(formData);
    }
    setDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', price: 0, duration_minutes: 30 });
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({ name: service.name, price: Number(service.price), duration_minutes: service.duration_minutes || 30 });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      await deleteService.mutateAsync(id);
    }
  };

  return (
    <Layout title="Serviços">
      <div className="space-y-6 animate-fade-in">
        {/* Add Service */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingService(null); }}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required />
              </div>
              <div className="space-y-2">
                <Label>Duração (minutos)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })} />
              </div>
              <Button type="submit" className="w-full">{editingService ? 'Salvar' : 'Cadastrar'}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Services List */}
        <div className="space-y-3">
          {services.length === 0 ? (
            <Card className="border-0 shadow-medium">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum serviço cadastrado
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{service.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{formatCurrency(Number(service.price))}</span>
                        {service.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {service.duration_minutes} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(service)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
