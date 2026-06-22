import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/locals';
import { useSession } from '../lib/session';

function useLocalsKey() {
  const { activeId } = useSession();
  return ['locals', activeId];
}

export function useLocals() {
  const { activeId } = useSession();
  return useQuery({
    queryKey: ['locals', activeId],
    queryFn: api.fetchLocals,
    enabled: !!activeId,
  });
}

export function useCreateLocal() {
  const qc = useQueryClient();
  const key = useLocalsKey();
  return useMutation({
    mutationFn: api.createLocal,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateLocal() {
  const qc = useQueryClient();
  const key = useLocalsKey();
  return useMutation({
    mutationFn: api.updateLocal,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteLocal() {
  const qc = useQueryClient();
  const key = useLocalsKey();
  return useMutation({
    mutationFn: api.deleteLocal,
    // Ao apagar um local, os itens deixam de lhe estar associados no servidor.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
