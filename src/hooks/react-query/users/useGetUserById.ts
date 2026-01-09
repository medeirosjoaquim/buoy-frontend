import { useQuery } from "@tanstack/react-query";
import UsersService from "services/users";
import { User } from "services/users/interface";

export function useGetUserById(id: number) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async (): Promise<User | undefined> => {
      const response = await UsersService.getById(id);
      return response.users[0];
    },
    enabled: !!id,
  });
}
