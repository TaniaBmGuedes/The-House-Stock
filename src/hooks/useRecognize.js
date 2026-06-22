import { useMutation } from '@tanstack/react-query';
import { recognizePhoto } from '../api/recognize';

export function useRecognize() {
  return useMutation({ mutationFn: recognizePhoto });
}
