import { QueryClient as BaseQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";
const CACHE_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

const queryClient = new BaseQueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: CACHE_KEY,
});

// Persist options with cache invalidation strategy
const persistOptions = {
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  buster: CACHE_VERSION, // Busts cache when app version changes
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[] }) => {
      // Only persist these query keys (non-sensitive data)
      const persistableKeys = ["my_brands", "brand-list", "brand", "users", "my_user"];
      return persistableKeys.some((key) =>
        query.queryKey.some((k) => typeof k === "string" && k.includes(key))
      );
    },
  },
};

// Export for use in logout
export { queryClient, CACHE_KEY };

interface QueryClientProps {
  children: JSX.Element | JSX.Element[];
}

export function QueryClientProvider({ children }: QueryClientProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </PersistQueryClientProvider>
  );
}
