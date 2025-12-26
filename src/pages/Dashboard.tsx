import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppointments } from '@/hooks/useAppointments';
import { useTransactions } from '@/hooks/useTransactions';
import { useClients } from '@/hooks/useClients';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, DollarSign, Clock, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { appointments, completeAppointment, cancelAppointment } = useAppointments(today);
  const { totalToday, totalWeek, totalMonth } = useTransactions();
  const { clients } = useClients();

  const todayAppointments = appointments.filter((a) => a.status === 'agendado');
  const completedToday = appointments.filter((a) => a.status === 'concluido').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout title="Painel">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu dia</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Agendados hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedToday}</p>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalToday)}</p>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{clients.length}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action */}
        <Link to="/agenda">
          <Button className="w-full lg:w-auto" size="lg">
            <Plus className="h-5 w-5" />
            Novo Agendamento
          </Button>
        </Link>

        {/* Today's Appointments */}
        <Card className="border-0 shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum agendamento para hoje
              </p>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 animate-slide-up"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-primary">
                          {appointment.time.slice(0, 5)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service_name} • {formatCurrency(Number(appointment.price))}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-success hover:bg-success/10"
                        onClick={() => completeAppointment.mutate(appointment)}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => cancelAppointment.mutate(appointment.id)}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Esta semana</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalWeek)}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Este mês</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(totalMonth)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
