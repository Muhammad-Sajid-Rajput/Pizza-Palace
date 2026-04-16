import { useState, useCallback, useEffect } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for making API calls with loading and error states
 */
export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP Error: ${response.status}`);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url, options.method, options.body, options.headers, options.token]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Custom hook for managing form state
 */
export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setValues((prev) => ({ ...prev, [name]: fieldValue }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const setFieldValue = (name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setFieldError = (name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  };

  return {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    resetForm,
  };
}

/**
 * Custom hook for managing local storage
 */
export function useLocalStorage<T>(key: string, initialValue?: T) {
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T | undefined) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      console.error('Failed to store value in localStorage');
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(undefined);
    } catch {
      console.error('Failed to remove value from localStorage');
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Custom hook for managing debounced values
 */
export function useDebounce<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>();

  useEffect(() => {
    setPrev(value);
  }, [value]);

  return prev;
}

/**
 * Custom hook for async operations with loading/error handling
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      void execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
}

/**
 * Custom hook for managing visibility state (modals, dropdowns, etc)
 */
export function useToggle(initialValue: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, toggle, open, close };
}

/**
 * Custom hook for managing multiple boolean states
 */
export function useFlags(initialValues: Record<string, boolean> = {}) {
  const [flags, setFlags] = useState(initialValues);

  const setFlag = useCallback((key: string, value: boolean) => {
    setFlags((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleFlag = useCallback((key: string) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetFlags = useCallback(() => {
    setFlags(initialValues);
  }, [initialValues]);

  return { flags, setFlag, toggleFlag, resetFlags };
}

/**
 * Custom hook for pagination
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}

/**
 * Custom hook for managing counter/counter state
 */
export function useCounter(initialValue: number = 0, { min, max }: { min?: number; max?: number } = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    setCount((prev) => (max !== undefined ? Math.min(prev + 1, max) : prev + 1));
  };

  const decrement = () => {
    setCount((prev) => (min !== undefined ? Math.max(prev - 1, min) : prev - 1));
  };

  const reset = () => {
    setCount(initialValue);
  };

  const set = (value: number) => {
    setCount(value);
  };

  return { count, increment, decrement, reset, set };
}