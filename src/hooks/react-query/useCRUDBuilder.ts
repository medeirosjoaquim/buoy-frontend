import { ElementIdType, PaginatedResult } from "services/base/interface";
import { useBrandIdSubscribedQuery } from "./useBrandIdSubscribedQuery";
import {
  UseMutationResult,
  UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useBrandIdSubscribedMutation } from "./useBrandIdSubscribedMutation";

export interface useCRUDBuilderProps<T, ListQueryParams extends unknown[] = []> {
  cacheQueryName: string;
  paramlessDetail?: boolean;
  readListPromise?: (
    brandId: string,
    ...rest: ListQueryParams
  ) => Promise<PaginatedResult<T> | undefined>;
  readDetailPromise?: (
    brandId: string,
    elementId?: ElementIdType
  ) => Promise<T | undefined>;
  createPromise?: (
    brandId: string,
    body: Partial<T>
  ) => Promise<T | undefined | void>;
  updatePromise?: (
    brandId: string,
    elementId: ElementIdType,
    body: Partial<T>
  ) => Promise<T | undefined | void>;
  deletePromise?: (
    brandId: string,
    elementId: ElementIdType
  ) => Promise<T | undefined | void>;
}

export interface useCRUDBuilderResponse<T, ListQueryParams extends unknown[] = []> {
  useGetList: (query?: ListQueryParams) => UseQueryResult<PaginatedResult<T> | null | undefined>;
  useGetDetail: (elementId?: ElementIdType) => UseQueryResult<T | null | undefined>;
  useCreate: () => UseMutationResult<T | undefined | void, unknown, Partial<T>>;
  useUpdate: (
    elementId: ElementIdType
  ) => UseMutationResult<T | undefined | void, unknown, Partial<T>>;
  useDelete: (
    elementId: ElementIdType
  ) => UseMutationResult<T | undefined | void, unknown, void>;
}

export function useCRUDBuilder<T, ListQueryParams extends unknown[] = []>({
  cacheQueryName,
  paramlessDetail = false,
  readListPromise,
  readDetailPromise,
  createPromise,
  updatePromise,
  deletePromise,
}: useCRUDBuilderProps<T, ListQueryParams>): useCRUDBuilderResponse<T, ListQueryParams> {
  const listQueryName = `${cacheQueryName}-list`;
  const detailQueryName = `${cacheQueryName}`;

  const listQueryKey = (brandId: string) => [listQueryName, brandId];
  const detailQueryKey = (brandId: string, elementId: ElementIdType) => [
    detailQueryName,
    brandId,
    paramlessDetail ? "" : elementId || "",
  ];

  return {
    useGetList: (query: ListQueryParams = [] as unknown as ListQueryParams) => {
      return useBrandIdSubscribedQuery<PaginatedResult<T> | undefined>(
        async (brandId) =>
          readListPromise && readListPromise(brandId, ...query),
        listQueryKey
      );
    },

    useGetDetail: (elementId?: ElementIdType) => {
      return useBrandIdSubscribedQuery<T | undefined>(
        async (brandId) => {
          return readDetailPromise && readDetailPromise(brandId, elementId);
        },
        (brandId) => detailQueryKey(brandId, elementId)
      );
    },

    useCreate: () => {
      const queryClient = useQueryClient();

      return useBrandIdSubscribedMutation<T | undefined, Partial<T>>(
        async (brandId: string, body: Partial<T>) => {
          return createPromise && createPromise(brandId, body);
        },
        (brandId) => {
          queryClient.invalidateQueries({
            queryKey: listQueryKey(brandId),
          });
        }
      );
    },

    useUpdate: (elementId: ElementIdType) => {
      const queryClient = useQueryClient();

      return useBrandIdSubscribedMutation<T, Partial<T>>(
        async (brandId: string, body: Partial<T>) => {
          if (!elementId) return;
          return updatePromise && updatePromise(brandId, elementId, body);
        },
        (brandId) => {
          queryClient.invalidateQueries({
            queryKey: listQueryKey(brandId),
          });
          queryClient.invalidateQueries({
            queryKey: detailQueryKey(brandId, elementId),
          });
          console.log(
            brandId,
            elementId,
            listQueryKey(brandId),
            detailQueryKey(brandId, elementId)
          );
        }
      );
    },

    useDelete: (elementId: ElementIdType) => {
      const queryClient = useQueryClient();

      return useBrandIdSubscribedMutation<T, void>(
        async (brandId: string) => {
          if (!elementId) return;
          return deletePromise && deletePromise(brandId, elementId);
        },
        (brandId) => {
          queryClient.invalidateQueries({
            queryKey: listQueryKey(brandId),
          });
          queryClient.invalidateQueries({
            queryKey: detailQueryKey(brandId, elementId),
          });
        }
      );
    },
  };
}
