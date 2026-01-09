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
}
