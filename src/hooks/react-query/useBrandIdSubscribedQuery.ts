import { useEffect } from "react";
import { QueryKey, UseQueryResult, useQuery } from "@tanstack/react-query";
import { useGetBrandId } from "hooks";

export function useBrandIdSubscribedQuery<T>(
  handler: (brandId: string) => Promise<T | undefined>,
  queryKeyBuilder: (brandId: string) => QueryKey
): UseQueryResult<T | null | undefined> {
  const brandId = useGetBrandId();

  const query = useQuery({
    queryFn: async (): Promise<T | null> => {
      if (!brandId) return null;
      const response = await handler(brandId);
      // React Query doesn't allow undefined, return null instead
      return response ?? null;
    },
    queryKey: queryKeyBuilder(brandId),
    enabled: !!brandId, // Only run query when brandId is available
  });

  useEffect(() => {
    if (brandId) {
      query.refetch();
    }
  }, [brandId]);

  return query;
}
