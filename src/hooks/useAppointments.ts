import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string | null;
  service_id: string | null;
  client_name: string | null;
  service_name: string | null;
  date: string;
  time: string;
  price: number;
  status: 'agendado' | 'concluido' | 'cancelado';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAppointments(date?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.id, date],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointment: {
      client_id?: string;
      service_id?: string;
      client_name: string;
      service_name: string;
      date: string;
      time: string;
      price: number;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appointment, user_id: user.id, status: 'agendado' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({
        title: 'Agendamento criado!',
        description: 'O serviço foi agendado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao agendar',
        description: error.message,
      });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({
        title: 'Agendamento atualizado!',
        description: 'As informações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message,
      });
    },
  });

  const completeAppointment = useMutation({
    mutationFn: async (appointment: Appointment) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'concluido' })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      // Create transaction entry
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          appointment_id: appointment.id,
          description: `${appointment.service_name} - ${appointment.client_name}`,
          amount: appointment.price,
          type: 'entrada',
          date: appointment.date,
        });

      if (transactionError) throw transactionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: 'Serviço concluído!',
        description: 'O valor foi adicionado ao caixa.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao concluir',
        description: error.message,
      });
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({
        title: 'Agendamento cancelado',
        description: 'O agendamento foi cancelado.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar',
        description: error.message,
      });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({
        title: 'Agendamento removido!',
        description: 'O agendamento foi excluído.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover',
        description: error.message,
      });
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    completeAppointment,
    cancelAppointment,
    deleteAppointment,
  };
}
