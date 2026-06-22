import { useMutation } from '@tanstack/react-query';
import * as api from '../api/auth';

export function useRegisterCasa() {
  return useMutation({ mutationFn: api.registerCasa });
}

export function useLoginCasa() {
  return useMutation({ mutationFn: api.loginCasa });
}
