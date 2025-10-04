import { useState } from 'react';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const request = async (
    url: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    setState({ data: null, error: null, loading: true });

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        setState({ data: null, error: data.error || 'Request failed', loading: false });
        return null;
      }

      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, error: errorMessage, loading: false });
      return null;
    }
  };

  return { ...state, request };
}