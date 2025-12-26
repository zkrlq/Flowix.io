import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    client_name: '',
    service_name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    price: 0,
  });

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const { appointments, createAppointment, completeAppointment, cancelAppointment, deleteAppointment } = useAppointments(dateStr);
  const { clients } = useClients();
  const { services } = useServices();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_name: client?.name || '',
    });
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    setFormData({
      ...formData,
      service_id: serviceId,
      service_name: service?.name || '',
      price: service?.price || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAppointment.mutateAsync({
      ...formData,
      date: dateStr,
    });
    setDialogOpen(false);
    setFormData({
      client_id: '',
      service_id: '',
      client_name: '',
      service_name: '',
      date: dateStr,
      time: '09:00',
      price: 0,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      agendado: 'bg-warning/10 text-warning border border-warning/20',
      concluido: 'bg-success/10 text-success border border-success/20',
      cancelado: 'bg-destructive/10 text-destructive border border-destructive/20',
    };
    const labels = { agendado: 'Agendado', concluido: 'Concluído', cancelado: 'Cancelado' };
    return (
      <span className={cn('px-2 py-1 rounded-md text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout title="Agenda">
      <div className="space-y-6 animate-fade-in">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weekDays.map((day) => {
              const isSelected = format(day, 'yyyy-MM-dd') === dateStr;
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 rounded-xl min-w-[50px] transition-all',
                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                    isToday && !isSelected && 'ring-2 ring-primary'
                  )}
                >
                  <span className="text-xs font-medium">{format(day, 'EEE', { locale: ptBR })}</span>
                  <span className="text-lg font-bold">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* New Appointment Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={formData.client_id} onValueChange={handleClientChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select value={formData.service_id} onValueChange={handleServiceChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(Number(service.price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
              </div>
              <Button type="submit" className="w-full" disabled={!formData.client_name || !formData.service_name}>
                Agendar
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Appointments List */}
        <Card className="border-0 shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{format(selectedDate, "d 'de' MMMM", { locale: ptBR })}</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum agendamento para este dia</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl bg-secondary/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-primary">{apt.time.slice(0, 5)}</p>
                        <p className="font-semibold">{apt.client_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.service_name}</p>
                        <p className="text-sm font-medium">{formatCurrency(Number(apt.price))}</p>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>
                    {apt.status === 'agendado' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" className="flex-1" onClick={() => completeAppointment.mutate(apt)}>
                          <CheckCircle2 className="h-4 w-4" /> Concluir
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => cancelAppointment.mutate(apt.id)}>
                          <XCircle className="h-4 w-4" /> Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
