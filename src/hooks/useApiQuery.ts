import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface FetchOptions<T> {
  endpoint: string;
  queryKey: string[];
  enabled?: boolean;
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
}

export function useApiQuery<T>({ endpoint, queryKey, enabled = true, options }: FetchOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, endpoint: ${endpoint}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response from ${endpoint}, got ${contentType}`);
        }
        const data = await response.json();
        if (!data) {
          throw new Error(`Empty response from ${endpoint}`);
        }
        return data;
      } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        throw error;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // Data remains fresh for 5 minutes
    // cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
    retry: 2,
    ...options,
  });
}