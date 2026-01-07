import { useQuery } from "@tanstack/react-query";
import UsersService from "services/users";
import { UsersResponse } from "services/users/interface";

export function useGetUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<UsersResponse> => {
      return UsersService.getAll();
    },
  });
}
