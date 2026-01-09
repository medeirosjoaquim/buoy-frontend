import { UsersFakeService } from "./fake";
import { UsersApiService } from "./api";
import { UsersService } from "./interface";

let service: UsersService = new UsersApiService();

if (import.meta.env.VITE_FAKE_API_MODE === "true") {
  service = new UsersFakeService(1000, 0);
}

export default service;
