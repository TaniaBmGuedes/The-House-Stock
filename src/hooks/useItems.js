import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/items';
import { useSession } from '../lib/session';

// A chave inclui a Casa ativa, para que mudar de Casa refaça o fetch e os
// dados de uma Casa nunca apareçam noutra.
function useItemsKey() {
  const { activeId } = useSession();
  return ['items', activeId];
}

export function useItems() {
  const { activeId } = useSession();
  return useQuery({
    queryKey: ['items', activeId],
    queryFn: api.fetchItems,
    enabled: !!activeId,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  const key = useItemsKey();
  return useMutation({
    mutationFn: api.createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

// Atualização otimista: a UI responde de imediato e reverte se falhar.
export function useUpdateItem() {
  const qc = useQueryClient();
  const key = useItemsKey();
  return useMutation({
    mutationFn: api.updateItem,
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old = []) =>
        old.map((it) => (it._id === id ? { ...it, ...data } : it))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  const key = useItemsKey();
  return useMutation({
    mutationFn: api.deleteItem,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      qc.setQueryData(key, (old = []) => old.filter((it) => it._id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
