
import { useQuery } from '@tanstack/react-query';

interface FetchOptions {
  endpoint: string;
  queryKey: string[];
  enabled?: boolean;
}

export function useApiQuery<T>({ endpoint, queryKey, enabled = true }: FetchOptions) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`${endpoint}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled,
  });
}
