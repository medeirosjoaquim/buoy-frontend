import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { useGetBrandId } from "hooks";

type MutationFn<T, K> = (brandId: string, input: K) => Promise<T | undefined | void>;
type OnSuccessFn<T, K> = (
  brandId: string,
  data: T | undefined | void,
  variables: K,
  context: unknown
) => void;

export function useBrandIdSubscribedMutation<T, K>(
  mutationFn: MutationFn<T, K>,
  onSuccess: OnSuccessFn<T, K>
): UseMutationResult<T | undefined | void, unknown, K> {
  const brandId = useGetBrandId();

  const mutation = useMutation({
    mutationFn: (input: K) => mutationFn(brandId, input),
    onSuccess: (data, variables, context) => onSuccess(brandId, data, variables, context),
  });

  return mutation;
}
