import { UsersService, UsersResponse } from "./interface";

const DUMMYJSON_URL = "https://dummyjson.com";

export class UsersApiService extends UsersService {
  async getAll(): Promise<UsersResponse> {
    // Fetch all users (dummyjson has 30 users by default, use limit=0 to get all)
    const response = await fetch(`${DUMMYJSON_URL}/users?limit=0`);

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  }
  async getById(id: number): Promise<UsersResponse> {
    // Fetch user by ID
    const response = await fetch(`${DUMMYJSON_URL}/users/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user with id ${id}`);
    }

    const user = await response.json();
    return {
      users: [user],
      total: 1,
      skip: 0,
      limit: 1,
    };
  }
}
