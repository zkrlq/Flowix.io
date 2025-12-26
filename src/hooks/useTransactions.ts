import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export interface Transaction {
  id: string;
  user_id: string;
  appointment_id: string | null;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  date: string;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (transaction: {
      description: string;
      amount: number;
      type: 'entrada' | 'saida';
      date?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          user_id: user.id,
          date: transaction.date || format(new Date(), 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: 'Transação registrada!',
        description: 'A movimentação foi adicionada ao caixa.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar',
        description: error.message,
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: 'Transação removida!',
        description: 'A movimentação foi excluída.',
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

  // Calculate totals
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  const calculateTotal = (start: string, end: string) => {
    return transactions
      .filter((t) => t.date >= start && t.date <= end)
      .reduce((acc, t) => acc + (t.type === 'entrada' ? Number(t.amount) : -Number(t.amount)), 0);
  };

  const totalToday = transactions
    .filter((t) => t.date === todayStr)
    .reduce((acc, t) => acc + (t.type === 'entrada' ? Number(t.amount) : -Number(t.amount)), 0);

  const totalWeek = calculateTotal(weekStart, weekEnd);
  const totalMonth = calculateTotal(monthStart, monthEnd);

  return {
    transactions,
    isLoading,
    createTransaction,
    deleteTransaction,
    totalToday,
    totalWeek,
    totalMonth,
  };
}
